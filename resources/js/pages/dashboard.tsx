import { Head, Link } from '@inertiajs/react';
import {
    ArrowUpRight,
    CalendarClock,
    FileCheck2,
    Files,
    Upload,
    Zap,
} from 'lucide-react';
import { DocumentList } from '@/components/dashboard/document-list';
import { EmptyState } from '@/components/dashboard/empty-state';
import { StatCard } from '@/components/dashboard/stat-card';
import { UsageMeter } from '@/components/dashboard/usage-meter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard, register } from '@/routes';

type DashboardData = {
    plan: { name: string; free_documents: number } | null;
    subscription: {
        status: string;
        currency: string;
        amount: string;
        ends_at: string | null;
    } | null;
    usage: { used_documents: number; available_documents: number | null };
    recent_documents: {
        id: number;
        original_filename: string;
        file_size: number;
        page_count: number | null;
        status: string;
        created_at: string | null;
    }[];
};

export default function Dashboard({
    dashboard: data,
}: {
    dashboard: DashboardData;
}) {
    const expiration = data.subscription?.ends_at
        ? new Intl.DateTimeFormat('en', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
          }).format(new Date(data.subscription.ends_at))
        : 'No active subscription';
    const remaining =
        data.usage.available_documents === null
            ? '—'
            : String(
                  Math.max(
                      data.usage.available_documents -
                          data.usage.used_documents,
                      0,
                  ),
              );

    return (
        <>
            <Head title="Dashboard" />
            <div className="min-h-full bg-[#f7f8f4] p-4 text-[#17221e] sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    <section className="flex flex-col justify-between gap-5 rounded-2xl bg-[#17221e] px-6 py-7 text-white sm:flex-row sm:items-end sm:px-8">
                        <div>
                            <p className="text-xs font-bold tracking-[0.16em] text-[#d8f36a] uppercase">
                                Your workspace
                            </p>
                            <h1 className="mt-3 text-3xl font-semibold tracking-tighter sm:text-4xl">
                                Good to see you.
                            </h1>
                            <p className="mt-2 max-w-lg text-sm leading-6 text-white/60">
                                Keep your documents, plan, and editing usage in
                                one clear place.
                            </p>
                        </div>
                        <Button
                            disabled
                            className="bg-[#d8f36a] text-[#17221e] hover:bg-[#c9e45c]"
                        >
                            <Upload /> Upload PDF{' '}
                            <span className="text-xs opacity-60">
                                Coming soon
                            </span>
                        </Button>
                    </section>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <StatCard
                            icon={Files}
                            label="Documents left"
                            value={remaining}
                            detail={
                                data.usage.available_documents === null
                                    ? 'Choose a plan to begin'
                                    : `of ${data.usage.available_documents} this month`
                            }
                        />
                        <StatCard
                            icon={Zap}
                            label="Current plan"
                            value={data.plan?.name ?? 'Free workspace'}
                            detail={
                                data.subscription?.status ?? 'Ready to start'
                            }
                        />
                        <StatCard
                            icon={CalendarClock}
                            label="Renewal"
                            value={data.subscription ? expiration : '—'}
                            detail={
                                data.subscription
                                    ? 'Subscription end date'
                                    : 'No active subscription'
                            }
                        />
                        <StatCard
                            icon={FileCheck2}
                            label="Recent files"
                            value={String(data.recent_documents.length)}
                            detail="Last five documents"
                        />
                    </div>
                    <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
                        <Card
                            id="documents"
                            className="rounded-2xl border-sidebar-border/70 bg-white shadow-none"
                        >
                            <CardHeader className="flex-row items-start justify-between gap-4">
                                <div>
                                    <CardTitle className="text-lg tracking-[-0.03em]">
                                        Recent documents
                                    </CardTitle>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Only documents belonging to your account
                                        appear here.
                                    </p>
                                </div>
                                <Button variant="ghost" size="sm" disabled>
                                    View all <ArrowUpRight />
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <DocumentList
                                    documents={data.recent_documents}
                                />
                            </CardContent>
                        </Card>
                        <div className="space-y-6">
                            <Card
                                id="usage"
                                className="rounded-2xl border-sidebar-border/70 bg-white shadow-none"
                            >
                                <CardHeader>
                                    <CardTitle className="text-lg tracking-[-0.03em]">
                                        Usage this month
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <UsageMeter
                                        used={data.usage.used_documents}
                                        available={
                                            data.usage.available_documents
                                        }
                                    />
                                </CardContent>
                            </Card>
                            <Card
                                id="subscription"
                                className="rounded-2xl border-[#17221e]/10 bg-[#d8f36a] shadow-none"
                            >
                                <CardHeader>
                                    <CardTitle className="text-lg tracking-[-0.03em]">
                                        Ready for more?
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm leading-6 text-[#33422e]">
                                        Upgrade your workspace when you need
                                        more document capacity.
                                    </p>
                                    <Button
                                        asChild
                                        className="mt-5 bg-[#17221e] text-[#d8f36a] hover:bg-[#2b3b31]"
                                    >
                                        <Link href={register()}>
                                            Explore plans <ArrowUpRight />
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                    {data.recent_documents.length === 0 && (
                        <EmptyState
                            title="Start with a supported PDF"
                            description="The upload workflow is coming in the next product phase. Your workspace is ready when it arrives."
                        />
                    )}
                </div>
            </div>
        </>
    );
}

Dashboard.layout = { breadcrumbs: [{ title: 'Dashboard', href: dashboard() }] };
