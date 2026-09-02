import { Link } from '@inertiajs/react';
import { FileText } from 'lucide-react';
import { EmptyState } from '@/components/dashboard/empty-state';
import { edit } from '@/routes/documents';

type Document = {
    public_id: string;
    original_filename: string;
    file_size: number;
    page_count: number | null;
    status: string;
    created_at: string | null;
};

export function DocumentList({
    documents,
    onUpload,
}: {
    documents: Document[];
    onUpload?: () => void;
}) {
    if (documents.length === 0) {
        return (
            <EmptyState
                title="Your workspace is clear"
                description="Upload a supported text-based PDF to see recent work here."
                onUpload={onUpload}
            />
        );
    }

    return (
        <div className="divide-y divide-border">
            {documents.map((document) => (
                <Link
                    key={document.public_id}
                    href={edit.url(document.public_id)}
                    className="flex items-start gap-3 py-4 first:pt-0 last:pb-0 sm:items-center sm:gap-4"
                >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#eef6ce] text-[#667b15]">
                        <FileText className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                            {document.original_filename}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {document.page_count ?? '—'} pages ·{' '}
                            {Math.round(document.file_size / 1024)} KB
                        </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
                        {document.status}
                    </span>
                </Link>
            ))}
        </div>
    );
}
