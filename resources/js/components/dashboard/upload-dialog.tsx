import { router } from '@inertiajs/react';
import { CheckCircle2, FileText, Loader2, Upload, XCircle } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { edit } from '@/routes/documents';

type UploadState =
    | { status: 'idle' }
    | { status: 'validating'; file: File }
    | { status: 'uploading'; file: File; progress: number }
    | { status: 'success'; filename: string; documentRouteKey: string }
    | { status: 'error'; message: string };

function csrfToken(): string {
    return decodeURIComponent(
        document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? '',
    );
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadDialog({
    open,
    onOpenChange,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const [state, setState] = useState<UploadState>({ status: 'idle' });
    const [dragging, setDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const reset = useCallback(() => {
        setState({ status: 'idle' });
        setDragging(false);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    const handleClose = useCallback(
        (open: boolean) => {
            if (!open) {
                reset();
            }

            onOpenChange(open);
        },
        [onOpenChange, reset],
    );

    async function uploadFile(file: File) {
        // Client-side validation
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            setState({
                status: 'error',
                message: 'Only PDF files are supported.',
            });

            return;
        }

        if (file.size > 20 * 1024 * 1024) {
            setState({
                status: 'error',
                message: 'File is too large. Maximum size is 20 MB.',
            });

            return;
        }

        setState({ status: 'uploading', file, progress: 0 });

        const formData = new FormData();
        formData.append('file', file);

        return new Promise<void>((resolve) => {
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    setState({
                        status: 'uploading',
                        file,
                        progress: Math.round((e.loaded / e.total) * 100),
                    });
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status === 201) {
                    const json = JSON.parse(xhr.responseText);
                    setState({
                        status: 'success',
                        filename: json.data.original_filename,
                        documentRouteKey: json.data.route_key,
                    });
                    toast.success('PDF uploaded successfully.');
                    // Refresh dashboard data in background
                    router.reload({ only: ['dashboard'] });
                } else {
                    const json = JSON.parse(xhr.responseText);
                    setState({
                        status: 'error',
                        message:
                            json.message ?? 'Upload failed. Please try again.',
                    });
                }

                resolve();
            });

            xhr.addEventListener('error', () => {
                setState({
                    status: 'error',
                    message: 'Network error. Please check your connection.',
                });
                resolve();
            });

            xhr.open('POST', '/api/documents/upload');
            xhr.setRequestHeader('Accept', 'application/json');
            xhr.setRequestHeader('X-XSRF-TOKEN', csrfToken());
            xhr.send(formData);
        });
    }

    function onFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];

        if (file) {
            uploadFile(file);
        }
    }

    function onDrop(e: React.DragEvent) {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];

        if (file) {
            uploadFile(file);
        }
    }

    function onDragOver(e: React.DragEvent) {
        e.preventDefault();
        setDragging(true);
    }

    function onDragLeave() {
        setDragging(false);
    }

    const isIdle = state.status === 'idle';

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Upload a PDF</DialogTitle>
                </DialogHeader>

                {/* Drop zone — shown when idle or after error */}
                {(isIdle || state.status === 'error') && (
                    <div
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        className={`mt-2 flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 transition-colors ${
                            dragging
                                ? 'border-[#8aa51d] bg-[#eef6ce]'
                                : 'border-border bg-muted/20 hover:border-[#8aa51d] hover:bg-[#eef6ce]/40'
                        }`}
                        onClick={() => fileInputRef.current?.click()}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) =>
                            e.key === 'Enter' && fileInputRef.current?.click()
                        }
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,application/pdf"
                            className="hidden"
                            onChange={onFileSelect}
                        />
                        <div className="flex size-12 items-center justify-center rounded-2xl bg-[#eef6ce] text-[#667b15]">
                            <Upload className="size-5" />
                        </div>
                        <p className="mt-4 text-sm font-semibold">
                            Drop a PDF here or click to browse
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Supported text-based PDFs only · Max 20 MB
                        </p>

                        {state.status === 'error' && (
                            <div className="mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                                <XCircle className="size-4 shrink-0" />
                                {state.message}
                            </div>
                        )}
                    </div>
                )}

                {/* Uploading state */}
                {state.status === 'uploading' && (
                    <div className="mt-2 rounded-xl border border-border bg-muted/20 p-6">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#eef6ce] text-[#667b15]">
                                <FileText className="size-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold">
                                    {state.file.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {formatBytes(state.file.size)}
                                </p>
                            </div>
                            <Loader2 className="size-5 shrink-0 animate-spin text-[#8aa51d]" />
                        </div>
                        <div className="mt-4">
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full rounded-full bg-[#8aa51d] transition-all duration-300"
                                    style={{ width: `${state.progress}%` }}
                                />
                            </div>
                            <p className="mt-1.5 text-right text-xs text-muted-foreground">
                                {state.progress}%
                            </p>
                        </div>
                    </div>
                )}

                {/* Success state */}
                {state.status === 'success' && (
                    <div className="mt-2 space-y-4">
                        <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-4">
                            <CheckCircle2 className="size-5 shrink-0 text-[#8aa51d]" />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold">
                                    {state.filename}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Ready to edit
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={reset}
                            >
                                Upload another
                            </Button>
                            <Button
                                className="flex-1 bg-[#17221e] text-[#d8f36a] hover:bg-[#2b3b31]"
                                onClick={() => {
                                    handleClose(false);
                                    router.visit(
                                        edit.url(state.documentRouteKey),
                                    );
                                }}
                            >
                                Open editor
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
