import { Head } from '@inertiajs/react';
import { ArrowUpRight, FileCheck2, Files, Upload } from 'lucide-react';
import { useState } from 'react';
import { DocumentList } from '@/components/dashboard/document-list';
import { StatCard } from '@/components/dashboard/stat-card';
import { UploadDialog } from '@/components/dashboard/upload-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes';

type DashboardData = {
    total_documents: number;
    recent_documents: {
        id: number;
        public_id: string;
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
    const [uploadOpen, setUploadOpen] = useState(false);

    return (
        <>
            <Head title="Dashboard" />
            <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />

            <div className="min-h-full bg-[#f7f8f4] p-4 text-[#17221e] sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* Hero banner */}
                    <section className="flex flex-col justify-between gap-5 rounded-2xl bg-[#17221e] px-6 py-7 text-white sm:flex-row sm:items-end sm:px-8">
                        <div>
                            <p className="text-xs font-bold tracking-[0.16em] text-[#d8f36a] uppercase">
                                Your workspace
                            </p>
                            <h1 className="mt-3 text-3xl font-semibold tracking-tighter sm:text-4xl">
                                Happy to see you Here.
                            </h1>
                            <p className="mt-2 max-w-lg text-sm leading-6 text-white/60">
                                PEDF is currently free. Upload and edit
                                supported text-based PDFs — no limits.
                            </p>
                        </div>
                        <Button
                            onClick={() => setUploadOpen(true)}
                            className="bg-[#d8f36a] text-[#17221e] hover:bg-[#c9e45c]"
                        >
                            <Upload /> Upload PDF
                        </Button>
                    </section>

                    {/* Stats */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <StatCard
                            icon={Files}
                            label="Total documents"
                            value={String(data.total_documents)}
                            detail="In your workspace"
                        />
                        <StatCard
                            icon={FileCheck2}
                            label="Recent files"
                            value={String(data.recent_documents.length)}
                            detail="Last five documents"
                        />
                    </div>

                    {/* Document list */}
                    <Card
                        id="documents"
                        className="rounded-2xl border-sidebar-border/70 bg-white shadow-none"
                    >
                        <CardHeader className="flex-col items-start justify-between gap-3 sm:flex-row sm:gap-4">
                            <div>
                                <CardTitle className="text-lg tracking-[-0.03em]">
                                    Recent documents
                                </CardTitle>
                                <p className="mt-1 text-xl font-semibold tracking-tighter text-muted-foreground sm:text-3xl">
                                    Only last five documents
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="self-end sm:self-auto"
                                onClick={() => setUploadOpen(true)}
                            >
                                <Upload className="size-4" />
                                Upload
                                <ArrowUpRight className="size-4" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <DocumentList
                                documents={data.recent_documents}
                                onUpload={() => setUploadOpen(true)}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = { breadcrumbs: [{ title: 'Dashboard', href: dashboard() }] };
