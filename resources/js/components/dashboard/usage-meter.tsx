export function UsageMeter({
    used,
    available,
}: {
    used: number;
    available: number | null;
}) {
    const percentage =
        available && available > 0
            ? Math.min(100, Math.round((used / available) * 100))
            : 0;

    return (
        <div className="space-y-3">
            <div className="flex items-end justify-between gap-4">
                <div>
                    <p className="text-2xl font-semibold tracking-[-0.04em]">
                        {available === null
                            ? 'No plan yet'
                            : `${Math.max(available - used, 0)} left`}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {available === null
                            ? 'Choose a plan to track usage.'
                            : `${used} of ${available} documents used this month`}
                    </p>
                </div>
                {available !== null && (
                    <span className="text-sm font-semibold text-[#667b15]">
                        {percentage}%
                    </span>
                )}
            </div>
            {available !== null && (
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                        className="h-full rounded-full bg-[#8aa51d] transition-all"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            )}
        </div>
    );
}
