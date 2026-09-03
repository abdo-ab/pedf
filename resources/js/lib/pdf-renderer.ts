import * as pdfjs from 'pdfjs-dist';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

// Suppress PDF.js source map warnings in console
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
    if (
        typeof args[0] === 'string' &&
        (args[0].includes('installHook.js.map') ||
            args[0].includes('Source map error'))
    ) {
        return;
    }

    originalConsoleError.apply(console, args);
};

export type PdfDocument = pdfjs.PDFDocumentProxy;
export type PdfPage = pdfjs.PDFPageProxy;

export type ExtractedPdfText = {
    id: string;
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fontSize: number;
    fontFamily?: string;
    fontWeight?: 'normal' | 'bold';
    fontStyle?: 'normal' | 'italic';
};

export async function loadPdf(source: string): Promise<PdfDocument> {
    return pdfjs.getDocument({ url: source }).promise;
}

export async function renderPdfPage(
    page: PdfPage,
    canvas: HTMLCanvasElement,
    scale: number,
): Promise<{ width: number; height: number }> {
    const viewport = page.getViewport({ scale });
    const context = canvas.getContext('2d');

    if (!context) {
        throw new Error('PDF canvas is unavailable.');
    }

    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    canvas.style.width = `${Math.ceil(viewport.width)}px`;
    canvas.style.height = `${Math.ceil(viewport.height)}px`;

    await page.render({ canvasContext: context, viewport, canvas }).promise;

    return { width: viewport.width, height: viewport.height };
}

/**
 * Return text positions as fractional page coordinates so the editor can make
 * text already in a PDF selectable without changing its rendered appearance.
 */
export async function extractPdfText(
    page: PdfPage,
): Promise<ExtractedPdfText[]> {
    const viewport = page.getViewport({ scale: 1 });
    const content = await page.getTextContent();

    return content.items.flatMap((item, index) => {
        if (!('str' in item) || !item.str.trim() || !('transform' in item)) {
            return [];
        }

        const [a, , , d, translateX, translateY] = item.transform;
        const height = Math.max(Math.abs(item.height || d), 1);
        const width = Math.max(item.width, 1);
        const fontName = item.fontName.toLowerCase();
        const fontFamily = content.styles[item.fontName]?.fontFamily;

        return [
            {
                id: `${index}-${translateX}-${translateY}`,
                text: item.str,
                x: translateX / viewport.width,
                y: (viewport.height - translateY - height) / viewport.height,
                width: width / viewport.width,
                height: height / viewport.height,
                fontSize: Math.max(Math.abs(a), Math.abs(d), 6),
                fontFamily,
                fontWeight: fontName.includes('bold') ? 'bold' : 'normal',
                fontStyle:
                    fontName.includes('italic') || fontName.includes('oblique')
                        ? 'italic'
                        : 'normal',
            },
        ];
    });
}
