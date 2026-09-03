import fontkit from '@pdf-lib/fontkit';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { PDFFont, RGB } from 'pdf-lib';
import type { EditorObject } from '@/types/pdf-editor';

const ETHIOPIC_FONT_URL = '/fonts/NotoSansEthiopic-Regular.ttf';

function isFiniteNumber(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value);
}

function needsUnicodeFont(value: string): boolean {
    return Array.from(value).some(
        (character) => (character.codePointAt(0) ?? 0) > 0xff,
    );
}

/** Convert a CSS hex color (e.g. "#ff8800" or "#f80") to a pdf-lib RGB triple. */
export function hexToRgb(hex: string): RGB {
    const cleaned = hex.replace('#', '');
    const full =
        cleaned.length === 3
            ? cleaned
                  .split('')
                  .map((c) => c + c)
                  .join('')
            : cleaned;
    const r = parseInt(full.slice(0, 2), 16) / 255;
    const g = parseInt(full.slice(2, 4), 16) / 255;
    const b = parseInt(full.slice(4, 6), 16) / 255;

    return rgb(isNaN(r) ? 0 : r, isNaN(g) ? 0 : g, isNaN(b) ? 0 : b);
}

/** Detect whether a data URI is JPEG or PNG and return the mime type. */
function detectImageMime(dataUri: string): 'image/png' | 'image/jpeg' | null {
    if (dataUri.startsWith('data:image/png')) {
        return 'image/png';
    }

    if (
        dataUri.startsWith('data:image/jpeg') ||
        dataUri.startsWith('data:image/jpg')
    ) {
        return 'image/jpeg';
    }

    return null;
}

/** Strip the "data:image/...;base64," prefix and return raw base64. */
function dataUriToBase64(dataUri: string): string {
    return dataUri.split(',')[1] ?? '';
}

function selectStandardFont(
    object: EditorObject,
    fonts: {
        helvetica: PDFFont;
        helveticaBold: PDFFont;
        helveticaItalic: PDFFont;
        times: PDFFont;
        timesBold: PDFFont;
        timesItalic: PDFFont;
        courier: PDFFont;
        courierBold: PDFFont;
        courierItalic: PDFFont;
    },
): PDFFont {
    const fontFamily = object.fontFamily?.toLowerCase() ?? '';
    const isBold = object.fontWeight === 'bold';
    const isItalic = object.fontStyle === 'italic';
    const family =
        fontFamily.includes('courier') || fontFamily.includes('mono')
            ? 'courier'
            : fontFamily.includes('times') || fontFamily.includes('serif')
              ? 'times'
              : 'helvetica';

    if (family === 'courier') {
        return isBold
            ? fonts.courierBold
            : isItalic
              ? fonts.courierItalic
              : fonts.courier;
    }

    if (family === 'times') {
        return isBold
            ? fonts.timesBold
            : isItalic
              ? fonts.timesItalic
              : fonts.times;
    }

    return isBold
        ? fonts.helveticaBold
        : isItalic
          ? fonts.helveticaItalic
          : fonts.helvetica;
}

/**
 * Overlay all editor objects on top of the original PDF bytes and return the
 * resulting PDF bytes.  The original PDF structure is preserved — objects are
 * additive overlays only.
 */
export async function applyEditsAndExport(
    originalBytes: ArrayBuffer,
    objects: EditorObject[],
): Promise<Uint8Array> {
    const output = await PDFDocument.load(originalBytes);

    // Register fontkit for custom font support
    output.registerFontkit(fontkit);

    // Embed standard fonts (these support Latin/WinAnsi only)
    const font = await output.embedFont(StandardFonts.Helvetica);
    const boldFont = await output.embedFont(StandardFonts.HelveticaBold);
    const italicFont = await output.embedFont(StandardFonts.HelveticaOblique);
    const timesFont = await output.embedFont(StandardFonts.TimesRoman);
    const timesBoldFont = await output.embedFont(StandardFonts.TimesRomanBold);
    const timesItalicFont = await output.embedFont(
        StandardFonts.TimesRomanItalic,
    );
    const courierFont = await output.embedFont(StandardFonts.Courier);
    const courierBoldFont = await output.embedFont(StandardFonts.CourierBold);
    const courierItalicFont = await output.embedFont(
        StandardFonts.CourierOblique,
    );

    // Check if we need Unicode font for non-Latin text (e.g., Amharic)
    let unicodeFont: any = null;
    const hasUnicodeText = objects.some(
        (obj) => obj.type === 'text' && obj.text && needsUnicodeFont(obj.text),
    );

    // The bundled TrueType asset works offline and is supported by fontkit.
    if (hasUnicodeText) {
        try {
            const response = await fetch(ETHIOPIC_FONT_URL);

            if (!response.ok) {
                throw new Error('The Ethiopic font could not be loaded.');
            }

            const fontBytes = await response.arrayBuffer();
            unicodeFont = await output.embedFont(fontBytes);
        } catch (error) {
            throw new Error(
                `Unable to prepare Amharic text for export: ${error instanceof Error ? error.message : 'Unknown font error.'}`,
            );
        }
    }

    for (const object of objects) {
        const pageIndex = object.page - 1;

        if (pageIndex < 0 || pageIndex >= output.getPageCount()) {
            continue;
        }

        const target = output.getPage(pageIndex);
        const { width: pageWidth, height: pageHeight } = target.getSize();

        if (
            ![object.x, object.y, object.width, object.height].every(
                isFiniteNumber,
            )
        ) {
            continue;
        }

        // Convert fractional coordinates to PDF point coordinates.
        // PDF origin is bottom-left; browser origin is top-left.
        const x = object.x * pageWidth;
        const objWidth = object.width * pageWidth;
        const objHeight = object.height * pageHeight;
        // y in PDF coords: flip from top-left origin to bottom-left origin
        const y = pageHeight - (object.y + object.height) * pageHeight;

        const color = hexToRgb(object.color ?? '#17221e');
        const opacity = isFiniteNumber(object.opacity) ? object.opacity : 1;

        switch (object.type) {
            case 'text': {
                const textContent = object.text ?? '';

                // Check if text contains non-Latin characters
                const requiresUnicodeFont = needsUnicodeFont(textContent);

                const selectedFont =
                    requiresUnicodeFont && unicodeFont
                        ? unicodeFont
                        : selectStandardFont(object, {
                              helvetica: font,
                              helveticaBold: boldFont,
                              helveticaItalic: italicFont,
                              times: timesFont,
                              timesBold: timesBoldFont,
                              timesItalic: timesItalicFont,
                              courier: courierFont,
                              courierBold: courierBoldFont,
                              courierItalic: courierItalicFont,
                          });

                try {
                    if (object.coverOriginal) {
                        target.drawRectangle({
                            x,
                            y,
                            width: objWidth,
                            height: objHeight,
                            color: rgb(1, 1, 1),
                        });
                    }

                    target.drawText(textContent, {
                        x,
                        y,
                        size: isFiniteNumber(object.fontSize)
                            ? object.fontSize
                            : 18,
                        font: selectedFont,
                        color,
                        opacity,
                    });
                } catch (error) {
                    throw new Error(
                        `Could not draw text "${textContent}": ${error instanceof Error ? error.message : 'Unknown error.'}`,
                    );
                }

                break;
            }

            case 'rectangle':
                target.drawRectangle({
                    x,
                    y,
                    width: objWidth,
                    height: objHeight,
                    borderColor: color,
                    borderWidth: 1.5,
                    opacity,
                });
                break;

            case 'circle':
                target.drawEllipse({
                    x: x + objWidth / 2,
                    y: y + objHeight / 2,
                    xScale: objWidth / 2,
                    yScale: objHeight / 2,
                    borderColor: color,
                    borderWidth: 1.5,
                    opacity,
                });
                break;

            case 'line':
            case 'underline':
            case 'strikethrough': {
                const lineY =
                    object.type === 'strikethrough' ? y + objHeight / 2 : y;
                target.drawLine({
                    start: { x, y: lineY },
                    end: { x: x + objWidth, y: lineY },
                    color,
                    thickness: object.type === 'line' ? 2 : 1,
                    opacity,
                });
                break;
            }

            case 'highlight':
                target.drawRectangle({
                    x,
                    y,
                    width: objWidth,
                    height: objHeight,
                    color: rgb(0.99, 0.88, 0.1),
                    opacity: 0.4,
                });
                break;

            case 'image':
            case 'signature': {
                const dataUri = object.data;

                if (!dataUri) {
                    break;
                }

                try {
                    const mime = detectImageMime(dataUri);
                    const base64 = dataUriToBase64(dataUri);
                    const bytes = Uint8Array.from(atob(base64), (c) =>
                        c.charCodeAt(0),
                    );
                    const embedded =
                        mime === 'image/jpeg'
                            ? await output.embedJpg(bytes)
                            : await output.embedPng(bytes);
                    target.drawImage(embedded, {
                        x,
                        y,
                        width: objWidth,
                        height: objHeight,
                        opacity,
                    });
                } catch {
                    // Skip image objects that cannot be embedded — do not corrupt.
                }

                break;
            }
        }
    }

    return output.save();
}

/**
 * Validate the exported PDF bytes with PDF.js to confirm the output is a
 * renderable PDF with the expected page count.
 */
export async function validateExportedPdf(
    bytes: Uint8Array,
    expectedPageCount: number,
): Promise<{ valid: boolean; reason?: string }> {
    try {
        // Dynamic import to avoid loading PDF.js in non-rendering contexts.
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
            'pdfjs-dist/build/pdf.worker.min.mjs',
            import.meta.url,
        ).toString();
        // PDF.js transfers its input buffer to its worker. Keep the export
        // buffer intact so the caller can still use it for the download.
        const doc = await pdfjs.getDocument({ data: bytes.slice() }).promise;

        if (doc.numPages !== expectedPageCount) {
            return {
                valid: false,
                reason: `Expected ${expectedPageCount} pages but got ${doc.numPages}.`,
            };
        }

        return { valid: true };
    } catch (error) {
        return {
            valid: false,
            reason: error instanceof Error ? error.message : 'Unknown error.',
        };
    }
}
