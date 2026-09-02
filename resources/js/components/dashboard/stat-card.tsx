import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function StatCard({
    icon: Icon,
    label,
    value,
    detail,
}: {
    icon: LucideIcon;
    label: string;
    value: string;
    detail: string;
}) {
    return (
        <Card className="rounded-2xl border-sidebar-border/70 shadow-none">
            <CardContent className="flex items-start justify-between gap-4 p-5">
                <div>
                    <p className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                        {label}
                    </p>
                    <p className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
                        {value}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {detail}
                    </p>
                </div>
                <span className="flex size-10 items-center justify-center rounded-xl bg-[#eef6ce] text-[#667b15]">
                    <Icon className="size-5" />
                </span>
            </CardContent>
        </Card>
    );
}
