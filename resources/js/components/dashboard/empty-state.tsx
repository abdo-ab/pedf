import { FileText, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function EmptyState({
    title,
    description,
    action = false,
}: {
    title: string;
    description: string;
    action?: boolean;
}) {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-muted">
                <FileText className="size-5 text-muted-foreground" />
            </span>
            <h3 className="mt-4 font-semibold">{title}</h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                {description}
            </p>
            {action && (
                <Button className="mt-5" disabled>
                    <Upload /> Upload PDF{' '}
                    <span className="text-xs opacity-60">Coming soon</span>
                </Button>
            )}
        </div>
    );
}
