import { FileText } from 'lucide-react';
import { EmptyState } from '@/components/dashboard/empty-state';

type Document = {
    id: number;
    original_filename: string;
    file_size: number;
    page_count: number | null;
    status: string;
    created_at: string | null;
};

export function DocumentList({ documents }: { documents: Document[] }) {
    if (documents.length === 0)
        return (
            <EmptyState
                title="Your workspace is clear"
                description="Upload a supported text-based PDF to see recent work here."
                action
            />
        );

    return (
        <div className="divide-y divide-border">
            {documents.map((document) => (
                <div
                    key={document.id}
                    className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
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
                    <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
                        {document.status}
                    </span>
                </div>
            ))}
        </div>
    );
}
