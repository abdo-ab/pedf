import { Head, Link, router } from '@inertiajs/react';
import { LoaderCircle, Trash2, Upload, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { EditorToolbar } from '@/components/pdf-editor/editor-toolbar';
import { SignaturePad } from '@/components/pdf-editor/signature-pad';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { applyEditsAndExport, validateExportedPdf } from '@/lib/pdf-exporter';
import { extractPdfText, loadPdf, renderPdfPage } from '@/lib/pdf-renderer';
import type { ExtractedPdfText, PdfDocument } from '@/lib/pdf-renderer';
import { update } from '@/routes/api/documents/edits';
import type {
    EditorDocument,
    EditorObject,
    EditorTool,
} from '@/types/pdf-editor';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function csrfToken(): string {
    return decodeURIComponent(
        document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? '',
    );
}

/**
 * Convert a pointer event position (relative to the page container element)
 * into fractional PDF coordinates (0–1).
 */
function toFractional(
    clientX: number,
    clientY: number,
    containerEl: HTMLElement,
): { fx: number; fy: number } {
    const rect = containerEl.getBoundingClientRect();

    return {
        fx: Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)),
        fy: Math.max(0, Math.min(1, (clientY - rect.top) / rect.height)),
    };
}

/** Read a File as a base64 data URI. */
function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function createObjectId(): string {
    if (typeof crypto?.randomUUID === 'function') {
        return crypto.randomUUID();
    }

    const bytes = new Uint8Array(16);
    crypto?.getRandomValues?.(bytes);

    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(
        '',
    );
}

function isFiniteNumber(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value);
}

function normalizeObjects(objects: EditorObject[]): EditorObject[] {
    return objects.filter(
        (object) =>
            Number.isInteger(object.page) &&
            object.page > 0 &&
            [object.x, object.y, object.width, object.height].every(
                isFiniteNumber,
            ),
    );
}

// ---------------------------------------------------------------------------
// Resize handle directions
// ---------------------------------------------------------------------------

type ResizeHandle = 'se' | 'sw' | 'ne' | 'nw' | 'e' | 'w' | 'n' | 's';

const RESIZE_HANDLES: { id: ResizeHandle; className: string }[] = [
    { id: 'nw', className: 'top-0 left-0 cursor-nw-resize' },
    { id: 'ne', className: 'top-0 right-0 cursor-ne-resize' },
    { id: 'sw', className: 'bottom-0 left-0 cursor-sw-resize' },
    { id: 'se', className: 'bottom-0 right-0 cursor-se-resize' },
    { id: 'n', className: 'top-0 left-1/2 -translate-x-1/2 cursor-n-resize' },
    {
        id: 's',
        className: 'bottom-0 left-1/2 -translate-x-1/2 cursor-s-resize',
    },
    { id: 'w', className: 'top-1/2 left-0 -translate-y-1/2 cursor-w-resize' },
    {
        id: 'e',
        className: 'top-1/2 right-0 -translate-y-1/2 cursor-e-resize',
    },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PdfEditor({
    document: documentData,
}: {
    document: EditorDocument;
}) {
    const [pdf, setPdf] = useState<PdfDocument | null>(null);
    const [page, setPage] = useState(1);
    const [zoom, setZoom] = useState(() =>
        typeof window !== 'undefined' && window.innerWidth < 640 ? 0.55 : 1,
    );
    const [objects, setObjects] = useState<EditorObject[]>(() =>
        normalizeObjects(documentData.edits ?? []),
    );
    const [sourceText, setSourceText] = useState<ExtractedPdfText[]>([]);
    const [history, setHistory] = useState<EditorObject[][]>([]);
    const [future, setFuture] = useState<EditorObject[][]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [tool, setTool] = useState<EditorTool>('select');
    const [pageWidth, setPageWidth] = useState(612);
    const [pageHeight, setPageHeight] = useState(792);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSignaturePad, setShowSignaturePad] = useState(false);
    const [pendingImageType, setPendingImageType] = useState<
        'image' | 'signature' | null
    >(null);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pageContainerRef = useRef<HTMLDivElement>(null);
    const thumbnailRefs = useRef<Record<number, HTMLCanvasElement | null>>({});
    const imageInputRef = useRef<HTMLInputElement>(null);

    // Drag / resize interaction state (not in React state — avoids re-renders)
    const dragState = useRef<{
        type: 'drag' | 'resize' | 'pending';
        objectId: string;
        startFx: number;
        startFy: number;
        origX: number;
        origY: number;
        origW: number;
        origH: number;
        handle?: ResizeHandle;
        moved?: boolean;
    } | null>(null);

    const currentObjects = useMemo(
        () => objects.filter((o) => o.page === page),
        [objects, page],
    );

    const selected = objects.find((o) => o.id === selectedId) ?? null;

    // -----------------------------------------------------------------------
    // PDF loading
    // -----------------------------------------------------------------------

    useEffect(() => {
        loadPdf(documentData.file_url)
            .then(setPdf)
            .catch(() =>
                setError('This PDF could not be rendered in the browser.'),
            )
            .finally(() => setLoading(false));
    }, [documentData.file_url]);

    const renderPage = useCallback(
        async (
            pageNumber: number,
            scale: number,
            canvas: HTMLCanvasElement | null,
        ) => {
            if (!pdf || !canvas) {
                return;
            }

            const pdfPage = await pdf.getPage(pageNumber);
            const viewport = pdfPage.getViewport({ scale: 1 });

            if (pageNumber === page) {
                setPageWidth(viewport.width);
                setPageHeight(viewport.height);
            }

            await renderPdfPage(pdfPage, canvas, scale);
        },
        [pdf, page],
    );

    useEffect(() => {
        renderPage(page, zoom, canvasRef.current).catch(() =>
            setError('This page could not be rendered.'),
        );
    }, [page, zoom, renderPage]);

    useEffect(() => {
        if (!pdf) {
            return;
        }

        pdf.getPage(page)
            .then(extractPdfText)
            .then(setSourceText)
            .catch(() => setSourceText([]));
    }, [page, pdf]);

    useEffect(() => {
        if (!pdf) {
            return;
        }

        Array.from({ length: pdf.numPages }, (_, i) =>
            renderPage(i + 1, 0.18, thumbnailRefs.current[i + 1]).catch(
                () => undefined,
            ),
        );
    }, [pdf, renderPage]);

    // -----------------------------------------------------------------------
    // History management
    // -----------------------------------------------------------------------

    function commit(next: EditorObject[]) {
        setHistory((h) => [...h, objects]);
        setFuture([]);
        setObjects(next);
    }

    function undo() {
        const previous = history.at(-1);

        if (!previous) {
            return;
        }

        setFuture((f) => [...f, objects]);
        setObjects(previous);
        setHistory(history.slice(0, -1));
        setSelectedId(null);
    }

    function redo() {
        const next = future.at(-1);

        if (!next) {
            return;
        }

        setHistory((h) => [...h, objects]);
        setObjects(next);
        setFuture(future.slice(0, -1));
    }

    // -----------------------------------------------------------------------
    // Object operations
    // -----------------------------------------------------------------------

    function createObject(
        type: Exclude<EditorTool, 'select'>,
        overrides: Partial<EditorObject> = {},
    ) {
        const object: EditorObject = {
            id: createObjectId(),
            page,
            type,
            x: 0.2,
            y: 0.2,
            width:
                type === 'line' ||
                type === 'underline' ||
                type === 'strikethrough'
                    ? 0.35
                    : 0.28,
            height:
                type === 'line' ||
                type === 'underline' ||
                type === 'strikethrough'
                    ? 0.01
                    : 0.08,
            text: type === 'text' ? 'New text' : undefined,
            color: type === 'highlight' ? '#fde047' : '#17221e',
            fontSize: 18,
            fontFamily: 'Helvetica',
            fontWeight: 'normal',
            fontStyle: 'normal',
            opacity: type === 'highlight' ? 0.4 : 1,
            ...overrides,
        };
        commit([...objects, object]);
        setSelectedId(object.id);
        setTool('select');

        return object;
    }

    function updateSelected(changes: Partial<EditorObject>) {
        if (!selected) {
            return;
        }

        commit(
            objects.map((o) =>
                o.id === selected.id ? { ...o, ...changes } : o,
            ),
        );
    }

    function editSourceText(text: ExtractedPdfText) {
        const existingReplacement = objects.find(
            (object) =>
                object.type === 'text' &&
                object.coverOriginal &&
                object.sourceTextId === text.id,
        );

        if (existingReplacement) {
            setSelectedId(existingReplacement.id);

            return;
        }

        const object = createObject('text', {
            ...text,
            sourceTextId: text.id,
            coverOriginal: true,
        });
        setSelectedId(object.id);
    }

    function removeSelected() {
        if (!selected) {
            return;
        }

        commit(objects.filter((o) => o.id !== selected.id));
        setSelectedId(null);
    }

    // -----------------------------------------------------------------------
    // Tool activation
    // -----------------------------------------------------------------------

    function activateTool(next: EditorTool) {
        setTool(next);

        if (next === 'select') {
            return;
        }

        if (next === 'signature') {
            setPendingImageType('signature');
            setShowSignaturePad(true);

            return;
        }

        if (next === 'image') {
            setPendingImageType('image');
            imageInputRef.current?.click();

            return;
        }

        createObject(next);
    }

    async function handleImageFile(file: File) {
        try {
            const dataUrl = await readFileAsDataUrl(file);
            createObject(pendingImageType ?? 'image', { data: dataUrl });
        } catch {
            toast.error('Could not load the selected image.');
        } finally {
            setPendingImageType(null);
        }
    }

    function handleSignatureConfirm(dataUrl: string) {
        setShowSignaturePad(false);
        createObject('signature', { data: dataUrl, width: 0.3, height: 0.1 });
        setPendingImageType(null);
    }

    // -----------------------------------------------------------------------
    // Drag & resize (pointer events on the page overlay)
    // -----------------------------------------------------------------------

    function startResize(
        event: React.PointerEvent,
        objectId: string,
        handle: ResizeHandle,
    ) {
        event.stopPropagation();
        event.preventDefault();
        (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
        const obj = objects.find((o) => o.id === objectId);

        if (!obj || !pageContainerRef.current) {
            return;
        }

        const { fx, fy } = toFractional(
            event.clientX,
            event.clientY,
            pageContainerRef.current,
        );
        dragState.current = {
            type: 'resize',
            objectId,
            handle,
            startFx: fx,
            startFy: fy,
            origX: obj.x,
            origY: obj.y,
            origW: obj.width,
            origH: obj.height,
        };
    }

    function onPointerMove(event: React.PointerEvent) {
        const ds = dragState.current;

        if (!ds || !pageContainerRef.current) {
            return;
        }

        const { fx, fy } = toFractional(
            event.clientX,
            event.clientY,
            pageContainerRef.current,
        );
        const dx = fx - ds.startFx;
        const dy = fy - ds.startFy;
        const MIN_SIZE = 0.02;

        // If we're in pending state, check if movement threshold is exceeded
        if (ds.type === 'pending') {
            const moveThreshold = 0.005; // Small threshold to detect intentional drag

            if (Math.abs(dx) > moveThreshold || Math.abs(dy) > moveThreshold) {
                ds.type = 'drag';
                ds.moved = true;
            } else {
                return; // Don't move yet, just selecting
            }
        }

        setObjects((current) =>
            current.map((o) => {
                if (o.id !== ds.objectId) {
                    return o;
                }

                if (ds.type === 'drag') {
                    return {
                        ...o,
                        x: Math.max(0, Math.min(1 - o.width, ds.origX + dx)),
                        y: Math.max(0, Math.min(1 - o.height, ds.origY + dy)),
                    };
                }

                // Resize
                let x = ds.origX;
                let y = ds.origY;
                let w = ds.origW;
                let h = ds.origH;

                const handle = ds.handle!;

                if (handle.includes('e')) {
                    w = Math.max(MIN_SIZE, ds.origW + dx);
                }

                if (handle.includes('s')) {
                    h = Math.max(MIN_SIZE, ds.origH + dy);
                }

                if (handle.includes('w')) {
                    const newW = Math.max(MIN_SIZE, ds.origW - dx);
                    x = ds.origX + ds.origW - newW;
                    w = newW;
                }

                if (handle.includes('n')) {
                    const newH = Math.max(MIN_SIZE, ds.origH - dy);
                    y = ds.origY + ds.origH - newH;
                    h = newH;
                }

                return { ...o, x, y, width: w, height: h };
            }),
        );
    }

    function onPointerUp() {
        const ds = dragState.current;

        if (!ds) {
            return;
        }

        // Only commit to history if we actually moved something
        if (ds.moved || ds.type === 'drag' || ds.type === 'resize') {
            setObjects((current) => {
                setHistory((h) => [...h, objects]);
                setFuture([]);

                return current;
            });
        }

        dragState.current = null;
    }

    // -----------------------------------------------------------------------
    // Keyboard shortcuts
    // -----------------------------------------------------------------------

    useEffect(() => {
        function handler(event: KeyboardEvent) {
            const target = event.target as HTMLElement;

            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                return;
            }

            if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
                event.preventDefault();
                undo();
            }

            if ((event.ctrlKey || event.metaKey) && event.key === 'y') {
                event.preventDefault();
                redo();
            }

            if (event.key === 'Delete' || event.key === 'Backspace') {
                removeSelected();
            }
        }
        window.addEventListener('keydown', handler);

        return () => window.removeEventListener('keydown', handler);
    });

    // -----------------------------------------------------------------------
    // Save
    // -----------------------------------------------------------------------

    async function save() {
        setSaving(true);

        try {
            const response = await fetch(update.url(documentData.route_key), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-XSRF-TOKEN': csrfToken(),
                },
                body: JSON.stringify({ objects }),
            });

            if (!response.ok) {
                throw new Error('Server error');
            }

            toast.success('Changes saved.');
        } catch {
            toast.error('Could not save changes. Please try again.');
        } finally {
            setSaving(false);
        }
    }

    // -----------------------------------------------------------------------
    // Export
    // -----------------------------------------------------------------------

    async function exportPdf() {
        setExporting(true);

        try {
            const response = await fetch(documentData.file_url);

            if (!response.ok) {
                throw new Error('Could not load the original PDF.');
            }

            const originalBytes = await response.arrayBuffer();

            const exportedBytes = await applyEditsAndExport(
                originalBytes,
                objects,
            );

            console.log('Export complete, objects count:', objects.length);
            console.log('Exported PDF size:', exportedBytes.length, 'bytes');

            const expectedPages = pdf?.numPages ?? documentData.page_count ?? 1;
            const validation = await validateExportedPdf(
                exportedBytes,
                expectedPages,
            );

            console.log('Validation result:', validation);

            if (!validation.valid) {
                // Show warning but still allow download
                toast.error(
                    `Export validation warning: ${validation.reason ?? 'Unknown error.'}. Downloading anyway...`,
                );
            }

            const blob = new Blob([exportedBytes.slice().buffer], {
                type: 'application/pdf',
            });
            const url = URL.createObjectURL(blob);
            const anchor = window.document.createElement('a');
            anchor.href = url;
            anchor.download =
                documentData.name.replace(/\.pdf$/i, '') + '-edited.pdf';
            anchor.click();
            URL.revokeObjectURL(url);

            if (validation.valid) {
                toast.success('PDF exported and download started.');
            } else {
                toast.success('PDF downloaded. Please verify the output.');
            }
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : 'Export failed. The original file has not been modified.',
            );
        } finally {
            setExporting(false);
        }
    }

    // -----------------------------------------------------------------------
    // Render guards
    // -----------------------------------------------------------------------

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
                <LoaderCircle className="mr-2 animate-spin" /> Loading PDF…
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 p-6 text-center text-white">
                <p className="text-lg font-semibold">{error}</p>
                <Link href="/dashboard" className="text-lime-300 underline">
                    Return to dashboard
                </Link>
            </div>
        );
    }

    // -----------------------------------------------------------------------
    // Page dimensions scaled by zoom
    // -----------------------------------------------------------------------

    const canvasWidth = pageWidth * zoom;
    const canvasHeight = pageHeight * zoom;

    // -----------------------------------------------------------------------
    // Render
    // -----------------------------------------------------------------------

    return (
        <>
            <Head title={`Edit ${documentData.name}`} />

            {/* Hidden file input for image uploads */}
            <input
                ref={imageInputRef}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                className="hidden"
                onChange={async (e) => {
                    const file = e.target.files?.[0];

                    if (file) {
                        await handleImageFile(file);
                    }

                    e.target.value = '';
                }}
            />

            {/* Signature pad modal */}
            {showSignaturePad && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                    <div className="w-full max-w-lg rounded-xl border border-white/10 bg-slate-900 shadow-2xl">
                        <SignaturePad
                            onConfirm={handleSignatureConfirm}
                            onCancel={() => {
                                setShowSignaturePad(false);
                                setTool('select');
                                setPendingImageType(null);
                            }}
                        />
                    </div>
                </div>
            )}

            <div className="flex h-screen flex-col overflow-hidden bg-slate-900 text-white">
                <EditorToolbar
                    tool={tool}
                    onToolChange={activateTool}
                    onUndo={undo}
                    onRedo={redo}
                    onZoom={(direction) =>
                        setZoom((z) =>
                            parseFloat(
                                Math.min(
                                    3,
                                    Math.max(
                                        0.3,
                                        z + (direction === 'in' ? 0.15 : -0.15),
                                    ),
                                ).toFixed(2),
                            ),
                        )
                    }
                    onSave={save}
                    onExport={exportPdf}
                    onBackToDashboard={() => router.visit('/dashboard')}
                    canUndo={history.length > 0}
                    canRedo={future.length > 0}
                    saving={saving}
                    exporting={exporting}
                />

                <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
                    {/* ── Thumbnail sidebar ── */}
                    <aside className="hidden w-44 shrink-0 overflow-y-auto border-r border-white/10 bg-slate-950 p-3 md:block">
                        <p className="mb-3 truncate text-xs font-semibold text-white/50">
                            {documentData.name}
                        </p>
                        {Array.from(
                            {
                                length:
                                    pdf?.numPages ??
                                    documentData.page_count ??
                                    0,
                            },
                            (_, i) => i + 1,
                        ).map((n) => (
                            <button
                                key={n}
                                type="button"
                                className={`mb-3 w-full rounded-lg p-2 ${
                                    n === page
                                        ? 'bg-lime-300/20 ring-2 ring-lime-300'
                                        : 'bg-white/5 hover:bg-white/10'
                                }`}
                                onClick={() => setPage(n)}
                            >
                                <div className="overflow-hidden rounded bg-white">
                                    <canvas
                                        ref={(el) => {
                                            thumbnailRefs.current[n] = el;
                                        }}
                                        className="mx-auto block max-w-full"
                                    />
                                </div>
                                <span className="mt-1 block text-xs text-white/60">
                                    Page {n}
                                </span>
                            </button>
                        ))}
                    </aside>

                    {/* ── Main canvas area ── */}
                    <main
                        className="min-w-0 flex-1 overflow-auto bg-slate-700 p-2 sm:p-8"
                        onPointerMove={onPointerMove}
                        onPointerUp={onPointerUp}
                    >
                        <label className="mx-auto mb-2 flex w-full max-w-sm items-center gap-2 rounded-md bg-slate-800 px-3 py-2 text-xs font-medium text-white md:hidden">
                            Page
                            <select
                                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                                value={page}
                                onChange={(event) =>
                                    setPage(Number(event.target.value))
                                }
                            >
                                {Array.from(
                                    {
                                        length:
                                            pdf?.numPages ??
                                            documentData.page_count ??
                                            0,
                                    },
                                    (_, index) => index + 1,
                                ).map((pageNumber) => (
                                    <option key={pageNumber} value={pageNumber}>
                                        Page {pageNumber}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <div className="mx-auto flex touch-pan-x touch-pan-y items-start justify-center overflow-auto">
                            {/* Page container */}
                            <div
                                ref={pageContainerRef}
                                className="relative max-w-full bg-white shadow-2xl select-none"
                                style={{
                                    width: canvasWidth,
                                    height: canvasHeight,
                                    minWidth:
                                        'min(100%, ' + canvasWidth + 'px)',
                                }}
                                onDoubleClick={() => {
                                    if (tool !== 'select') {
                                        activateTool(tool);
                                    }
                                }}
                                onClick={() => setSelectedId(null)}
                            >
                                {/* PDF rendered canvas */}
                                <canvas
                                    ref={canvasRef}
                                    className="pointer-events-none block"
                                />

                                {/* Invisible hit targets make text in the original PDF editable. */}
                                {tool === 'select' &&
                                    sourceText.map((text) => (
                                        <button
                                            key={text.id}
                                            type="button"
                                            className="absolute z-[1] cursor-text bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-lime-400"
                                            style={{
                                                left: `${text.x * 100}%`,
                                                top: `${text.y * 100}%`,
                                                width: `${text.width * 100}%`,
                                                height: `${text.height * 100}%`,
                                            }}
                                            aria-label={`Edit PDF text: ${text.text}`}
                                            title="Select to edit this PDF text"
                                            onPointerDown={(event) =>
                                                event.stopPropagation()
                                            }
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                editSourceText(text);
                                            }}
                                        />
                                    ))}

                                {/* Editor objects overlay */}
                                {currentObjects.map((obj) => {
                                    const isSelected = selectedId === obj.id;

                                    return (
                                        <div
                                            key={obj.id}
                                            className={`absolute z-10 overflow-hidden ${
                                                isSelected
                                                    ? 'ring-2 ring-lime-400'
                                                    : 'hover:ring-1 hover:ring-lime-300'
                                            } ${
                                                obj.type === 'highlight'
                                                    ? 'bg-yellow-300/40'
                                                    : ''
                                            } ${
                                                obj.type === 'rectangle'
                                                    ? 'border border-current'
                                                    : ''
                                            } ${
                                                obj.type === 'circle'
                                                    ? 'rounded-full border border-current'
                                                    : ''
                                            }`}
                                            style={{
                                                left: `${obj.x * 100}%`,
                                                top: `${obj.y * 100}%`,
                                                width: `${obj.width * 100}%`,
                                                height: `${obj.height * 100}%`,
                                                color: obj.color,
                                                fontFamily: obj.fontFamily,
                                                fontSize: `${(obj.fontSize ?? 18) * zoom}px`,
                                                fontWeight:
                                                    obj.fontWeight ?? 'normal',
                                                fontStyle:
                                                    obj.fontStyle ?? 'normal',
                                                opacity:
                                                    obj.type === 'highlight'
                                                        ? 1
                                                        : (obj.opacity ?? 1),
                                                cursor: 'move',
                                                backgroundColor:
                                                    obj.coverOriginal
                                                        ? '#ffffff'
                                                        : undefined,
                                            }}
                                            onPointerDown={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                (
                                                    e.currentTarget as HTMLElement
                                                ).setPointerCapture(
                                                    e.pointerId,
                                                );
                                                const pObj = objects.find(
                                                    (o) => o.id === obj.id,
                                                );

                                                if (
                                                    !pObj ||
                                                    !pageContainerRef.current
                                                ) {
                                                    return;
                                                }

                                                const { fx, fy } = toFractional(
                                                    e.clientX,
                                                    e.clientY,
                                                    pageContainerRef.current,
                                                );
                                                dragState.current = {
                                                    type: 'pending',
                                                    objectId: obj.id,
                                                    startFx: fx,
                                                    startFy: fy,
                                                    origX: pObj.x,
                                                    origY: pObj.y,
                                                    origW: pObj.width,
                                                    origH: pObj.height,
                                                    moved: false,
                                                };
                                                setSelectedId(obj.id);
                                            }}
                                            onDoubleClick={(e) => {
                                                e.stopPropagation();
                                                // Double-click to edit text
                                                setSelectedId(obj.id);
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                            }}
                                        >
                                            {obj.type === 'text' &&
                                            obj.coverOriginal &&
                                            isSelected ? (
                                                <textarea
                                                    autoFocus
                                                    aria-label="Edit PDF text"
                                                    className="block size-full resize-none border-0 bg-transparent p-0 leading-tight text-inherit outline-none"
                                                    value={obj.text ?? ''}
                                                    onPointerDown={(event) =>
                                                        event.stopPropagation()
                                                    }
                                                    onChange={(event) =>
                                                        updateSelected({
                                                            text: event.target
                                                                .value,
                                                        })
                                                    }
                                                />
                                            ) : obj.type === 'text' ? (
                                                <span className="pointer-events-none leading-tight break-words whitespace-pre-wrap">
                                                    {obj.text}
                                                </span>
                                            ) : null}
                                            {(obj.type === 'image' ||
                                                obj.type === 'signature') &&
                                                obj.data && (
                                                    <img
                                                        src={obj.data}
                                                        alt={
                                                            obj.type ===
                                                            'signature'
                                                                ? 'Signature'
                                                                : 'Image'
                                                        }
                                                        className="pointer-events-none size-full object-contain"
                                                    />
                                                )}
                                            {(obj.type === 'image' ||
                                                obj.type === 'signature') &&
                                                !obj.data && (
                                                    <div className="flex size-full items-center justify-center border border-dashed border-slate-400 bg-slate-50">
                                                        <Upload className="size-5 text-slate-400" />
                                                    </div>
                                                )}
                                            {obj.type === 'line' && (
                                                <div
                                                    className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t"
                                                    style={{
                                                        borderColor:
                                                            obj.color ??
                                                            '#17221e',
                                                    }}
                                                />
                                            )}
                                            {obj.type === 'underline' && (
                                                <div
                                                    className="absolute inset-x-0 bottom-0 border-b"
                                                    style={{
                                                        borderColor:
                                                            obj.color ??
                                                            '#17221e',
                                                    }}
                                                />
                                            )}
                                            {obj.type === 'strikethrough' && (
                                                <div
                                                    className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t"
                                                    style={{
                                                        borderColor:
                                                            obj.color ??
                                                            '#17221e',
                                                    }}
                                                />
                                            )}

                                            {/* Resize handles — only on selected object */}
                                            {isSelected &&
                                                RESIZE_HANDLES.map((handle) => (
                                                    <div
                                                        key={handle.id}
                                                        className={`absolute z-20 size-2.5 rounded-sm bg-lime-400 ${handle.className}`}
                                                        onPointerDown={(e) =>
                                                            startResize(
                                                                e,
                                                                obj.id,
                                                                handle.id,
                                                            )
                                                        }
                                                    />
                                                ))}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </main>

                    {/* ── Properties panel ── */}
                    <aside
                        className={`fixed inset-x-0 bottom-0 z-40 max-h-[55dvh] w-full overflow-y-auto rounded-t-2xl border-t border-white/10 bg-slate-950 p-4 shadow-2xl lg:static lg:block lg:max-h-none lg:w-64 lg:rounded-none lg:border-t-0 lg:border-l lg:shadow-none ${
                            selected ? 'block' : 'hidden'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold">
                                Properties
                            </h2>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-7 text-white hover:bg-white/10 lg:hidden"
                                    onClick={() => setSelectedId(null)}
                                    title="Close properties"
                                >
                                    <X className="size-4" />
                                </Button>
                                {selected && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-7 text-white hover:bg-white/10"
                                        onClick={removeSelected}
                                        title="Delete object"
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        {selected ? (
                            <div className="mt-4 space-y-4">
                                {selected.type === 'text' && (
                                    <>
                                        <label className="block text-xs text-white/60">
                                            Text content
                                            <textarea
                                                className="mt-1 w-full rounded border border-white/10 bg-white/5 px-2 py-1 text-sm text-white"
                                                rows={3}
                                                value={selected.text ?? ''}
                                                onChange={(e) =>
                                                    updateSelected({
                                                        text: e.target.value,
                                                    })
                                                }
                                            />
                                        </label>
                                        <label className="block text-xs text-white/60">
                                            Font size
                                            <Input
                                                type="number"
                                                min={6}
                                                max={96}
                                                className="mt-1 border-white/10 bg-white/5 text-white"
                                                value={selected.fontSize ?? 18}
                                                onChange={(e) =>
                                                    updateSelected({
                                                        fontSize: Number(
                                                            e.target.value,
                                                        ),
                                                    })
                                                }
                                            />
                                        </label>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant={
                                                    selected.fontWeight ===
                                                    'bold'
                                                        ? 'secondary'
                                                        : 'ghost'
                                                }
                                                className="font-bold text-white"
                                                onClick={() =>
                                                    updateSelected({
                                                        fontWeight:
                                                            selected.fontWeight ===
                                                            'bold'
                                                                ? 'normal'
                                                                : 'bold',
                                                    })
                                                }
                                            >
                                                B
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant={
                                                    selected.fontStyle ===
                                                    'italic'
                                                        ? 'secondary'
                                                        : 'ghost'
                                                }
                                                className="text-white italic"
                                                onClick={() =>
                                                    updateSelected({
                                                        fontStyle:
                                                            selected.fontStyle ===
                                                            'italic'
                                                                ? 'normal'
                                                                : 'italic',
                                                    })
                                                }
                                            >
                                                I
                                            </Button>
                                        </div>
                                    </>
                                )}

                                {selected.type !== 'image' &&
                                    selected.type !== 'signature' && (
                                        <label className="block text-xs text-white/60">
                                            Color
                                            <input
                                                type="color"
                                                className="mt-1 h-9 w-full cursor-pointer rounded"
                                                value={
                                                    selected.color ?? '#17221e'
                                                }
                                                onChange={(e) =>
                                                    updateSelected({
                                                        color: e.target.value,
                                                    })
                                                }
                                            />
                                        </label>
                                    )}

                                <label className="block text-xs text-white/60">
                                    Opacity
                                    <input
                                        type="range"
                                        min={0.1}
                                        max={1}
                                        step={0.05}
                                        className="mt-1 w-full"
                                        value={selected.opacity ?? 1}
                                        onChange={(e) =>
                                            updateSelected({
                                                opacity: Number(e.target.value),
                                            })
                                        }
                                    />
                                </label>

                                <div className="space-y-2">
                                    <p className="text-xs text-white/60">
                                        Position
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <label className="text-xs text-white/60">
                                            X (%)
                                            <Input
                                                type="number"
                                                min={0}
                                                max={99}
                                                step={1}
                                                className="mt-1 border-white/10 bg-white/5 text-white"
                                                value={Math.round(
                                                    selected.x * 100,
                                                )}
                                                onChange={(e) =>
                                                    updateSelected({
                                                        x:
                                                            Number(
                                                                e.target.value,
                                                            ) / 100,
                                                    })
                                                }
                                            />
                                        </label>
                                        <label className="text-xs text-white/60">
                                            Y (%)
                                            <Input
                                                type="number"
                                                min={0}
                                                max={99}
                                                step={1}
                                                className="mt-1 border-white/10 bg-white/5 text-white"
                                                value={Math.round(
                                                    selected.y * 100,
                                                )}
                                                onChange={(e) =>
                                                    updateSelected({
                                                        y:
                                                            Number(
                                                                e.target.value,
                                                            ) / 100,
                                                    })
                                                }
                                            />
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-xs text-white/60">
                                        Size
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <label className="text-xs text-white/60">
                                            W (%)
                                            <Input
                                                type="number"
                                                min={1}
                                                max={100}
                                                step={1}
                                                className="mt-1 border-white/10 bg-white/5 text-white"
                                                value={Math.round(
                                                    selected.width * 100,
                                                )}
                                                onChange={(e) =>
                                                    updateSelected({
                                                        width:
                                                            Number(
                                                                e.target.value,
                                                            ) / 100,
                                                    })
                                                }
                                            />
                                        </label>
                                        <label className="text-xs text-white/60">
                                            H (%)
                                            <Input
                                                type="number"
                                                min={1}
                                                max={100}
                                                step={1}
                                                className="mt-1 border-white/10 bg-white/5 text-white"
                                                value={Math.round(
                                                    selected.height * 100,
                                                )}
                                                onChange={(e) =>
                                                    updateSelected({
                                                        height:
                                                            Number(
                                                                e.target.value,
                                                            ) / 100,
                                                    })
                                                }
                                            />
                                        </label>
                                    </div>
                                </div>

                                {(selected.type === 'image' ||
                                    selected.type === 'signature') && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full text-white"
                                        onClick={() => {
                                            if (selected.type === 'signature') {
                                                setPendingImageType(
                                                    'signature',
                                                );
                                                setShowSignaturePad(true);
                                            } else {
                                                setPendingImageType('image');
                                                imageInputRef.current?.click();
                                            }
                                        }}
                                    >
                                        Replace{' '}
                                        {selected.type === 'signature'
                                            ? 'Signature'
                                            : 'Image'}
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <p className="mt-4 text-sm leading-relaxed text-white/50">
                                Select an object to edit its properties. Added
                                objects are exported as overlays on top of the
                                original PDF.
                            </p>
                        )}
                    </aside>
                </div>
            </div>
        </>
    );
}
