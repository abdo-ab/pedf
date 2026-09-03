import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { dashboard } from '@/routes';

type Props = {
    feature: string;
};

export default function ComingSoon({ feature }: Props) {
    return (
        <>
            <Head title={`${feature} — Coming Soon`} />
            <div className="flex min-h-[60vh] items-center justify-center p-6">
                <Card className="w-full max-w-md rounded-2xl border-sidebar-border/70 bg-white shadow-none">
                    <CardContent className="flex flex-col items-center gap-6 px-8 py-10 text-center">
                        <div className="space-y-2">
                            <h2 className="text-xl font-semibold tracking-tight text-[#17221e]">
                                {feature} — Coming Soon
                            </h2>
                            <p className="text-sm leading-6 text-muted-foreground">
                                This feature is not available yet. In the
                                meantime, enjoy the available features.
                            </p>
                        </div>
                        <Button
                            asChild
                            className="bg-[#17221e] text-[#d8f36a] hover:bg-[#2b3b31]"
                        >
                            <Link href={dashboard()}>Back to Dashboard</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ComingSoon.layout = { breadcrumbs: [{ title: 'Coming Soon' }] };
