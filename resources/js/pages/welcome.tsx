import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Check,
    FilePenLine,
    FileText,
    Menu,
    ShieldCheck,
    Sparkles,
    Upload,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { dashboard, login, register } from '@/routes';

type Plan = {
    id: number;
    name: string;
    description: string | null;
    price_usd: string;
    billing_interval: string;
    free_documents: number;
};

const steps = [
    [
        '01',
        'Upload a supported PDF',
        'Start with a text-based PDF and keep the original file safely in your workspace.',
        Upload,
    ],
    [
        '02',
        'Edit what matters',
        'Make focused changes to supported text while the document layout stays familiar.',
        FilePenLine,
    ],
    [
        '03',
        'Export with confidence',
        'Review your work and download a polished copy when the editing workflow is ready.',
        ShieldCheck,
    ],
] as const;

const faqs = [
    [
        'Can PEDF edit every PDF?',
        'No. PEDF focuses on supported text-based PDFs. Scanned and image-only documents are not presented as editable.',
    ],
    [
        'Will my original design be preserved?',
        'PEDF is designed for focused edits that preserve the original design wherever the document structure allows it.',
    ],
    [
        'Can I try PEDF before subscribing?',
        'Available plans and their included document allowance are shown below when plan data is available.',
    ],
];

export default function Welcome({ plans = [] }: { plans?: Plan[] }) {
    const { auth } = usePage().props;
    const [menuOpen, setMenuOpen] = useState(false);
    const cta = auth.user ? dashboard() : register();

    return (
        <>
            <Head>
                <title>PEDF | Edit PDFs. Keep the original design. </title>
                <meta
                    name="description"
                    content="PEDF helps you edit supported text-based PDFs while preserving the original design wherever technically possible."
                />
                <meta
                    property="og:title"
                    content="PEDF - Edit PDFs. Keep the original design."
                />
                <meta
                    property="og:description"
                    content="A focused PDF editing workspace for supported text-based documents."
                />
            </Head>
            <div className="min-h-screen overflow-hidden bg-[#f7f8f4] text-[#17221e]">
                <header className="border-b border-[#17221e]/10 bg-[#f7f8f4]/90 backdrop-blur">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
                        <Link
                            href="/"
                            className="flex items-center gap-3"
                            aria-label="PEDF home"
                        >
                            <img
                                src="/favicon.svg"
                                alt="PEDF logo"
                                className="h-14 w-14"
                            />
                            <span className="font-semibold tracking-tight text-[#17221e]">
                                PEDF
                            </span>
                        </Link>
                        <nav
                            className="hidden items-center gap-8 text-sm font-medium text-[#17221e]/70 md:flex"
                            aria-label="Primary navigation"
                        >
                            <a href="#how-it-works">How it works</a>
                            <a href="#features">Features</a>
                            <a href="#pricing">Pricing</a>
                            <a href="#faq">FAQ</a>
                        </nav>
                        <div className="hidden items-center gap-3 md:flex">
                            {auth.user ? (
                                <Button asChild variant="outline">
                                    <Link href={dashboard()}>
                                        Open workspace
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="px-3 py-2 text-sm font-semibold"
                                    >
                                        Log in
                                    </Link>
                                    <Button asChild>
                                        <Link href={register()}>
                                            Start editing <ArrowRight />
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                        >
                            {menuOpen ? <X /> : <Menu />}
                        </Button>
                    </div>
                    {menuOpen && (
                        <div className="border-t border-[#17221e]/10 px-5 py-5 md:hidden">
                            <nav className="flex flex-col gap-4 text-sm font-semibold">
                                <a
                                    href="#how-it-works"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    How it works
                                </a>
                                <a
                                    href="#features"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    Features
                                </a>
                                <a
                                    href="#pricing"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    Pricing
                                </a>
                                <Link href={cta}>Open workspace</Link>
                            </nav>
                        </div>
                    )}
                </header>
                <main>
                    <section className="mx-auto grid max-w-7xl gap-14 px-5 pt-16 pb-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:pt-24 lg:pb-28">
                        <div>
                            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#17221e]/15 bg-white/60 px-3 py-1.5 text-xs font-bold tracking-[0.12em] text-[#526157] uppercase">
                                <Sparkles className="size-3.5 text-[#8aa51d]" />{' '}
                                A calmer way to edit
                            </div>
                            <h1 className="max-w-3xl text-5xl leading-[0.95] font-semibold tracking-[-0.075em] sm:text-6xl lg:text-8xl">
                                Edit PDFs.
                                <br />
                                <span className="text-[#8aa51d]">
                                    Keep the original design.
                                </span>
                            </h1>
                            <p className="mt-7 max-w-xl text-lg leading-8 text-[#526157]">
                                PEDF gives supported text-based PDFs a focused
                                editing workspace, so small changes do not have
                                to mean rebuilding the whole document.
                            </p>
                            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                                <Button
                                    asChild
                                    size="lg"
                                    className="h-12 rounded-xl bg-[#17221e] px-6 text-[#d8f36a] hover:bg-[#2b3b31]"
                                >
                                    <Link href={cta}>
                                        Start with a PDF <ArrowRight />
                                    </Link>
                                </Button>
                                <a
                                    href="#how-it-works"
                                    className="inline-flex h-12 items-center justify-center rounded-xl border border-[#17221e]/15 px-6 text-sm font-semibold hover:bg-white"
                                >
                                    See how it works
                                </a>
                            </div>
                            <p className="mt-5 text-xs font-medium text-[#526157]">
                                Built for supported text-based PDFs. Scanned or
                                image-only files are not supported.
                            </p>
                        </div>
                        <div className="relative min-h-110 lg:min-h-140">
                            <div className="absolute top-8 right-0 bottom-0 left-8 rounded-4xl bg-[#d8f36a] lg:left-16" />
                            <div className="absolute top-0 right-8 left-0 rotate-[-4deg] rounded-3xl border border-[#17221e]/10 bg-white p-5 shadow-[0_24px_70px_rgba(23,34,30,0.16)] lg:right-16 lg:p-7">
                                <div className="flex items-center justify-between border-b border-[#17221e]/10 pb-4">
                                    <div className="flex items-center gap-2">
                                        <FileText className="size-4 text-[#8aa51d]" />
                                        <span className="text-xs font-bold tracking-[0.15em] text-[#526157] uppercase">
                                            project-brief.pdf
                                        </span>
                                    </div>
                                    <span className="rounded-full bg-[#eef6ce] px-2.5 py-1 text-[10px] font-bold text-[#667b15]">
                                        EDITABLE
                                    </span>
                                </div>
                                <div className="space-y-4 py-8">
                                    <div className="h-3 w-1/3 rounded bg-[#17221e]/10" />
                                    <div className="h-12 w-4/5 rounded bg-[#17221e]" />
                                    <div className="h-3 w-full rounded bg-[#17221e]/10" />
                                    <div className="h-3 w-11/12 rounded bg-[#17221e]/10" />
                                    <div className="grid grid-cols-2 gap-4 pt-6">
                                        <div className="h-28 rounded-xl bg-[#f0f3ec]" />
                                        <div className="h-28 rounded-xl bg-[#f0f3ec]" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between rounded-xl bg-[#f7f8f4] p-3 text-xs">
                                    <span className="font-semibold">
                                        Design preserved
                                    </span>
                                    <span className="flex items-center gap-1 text-[#667b15]">
                                        <Check className="size-3.5" /> ready to
                                        review
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section
                        className="border-y border-[#17221e]/10 bg-white"
                        id="how-it-works"
                    >
                        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
                            <p className="text-xs font-bold tracking-[0.16em] text-[#8aa51d] uppercase">
                                A focused workflow
                            </p>
                            <h2 className="mt-4 max-w-xl text-4xl font-semibold tracking-[-0.06em] sm:text-5xl">
                                Small edits, less reconstruction.
                            </h2>
                            <div className="mt-14 grid gap-8 md:grid-cols-3">
                                {steps.map(
                                    ([number, title, description, Icon]) => (
                                        <article
                                            key={number}
                                            className="border-t-2 border-[#17221e] pt-5"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-bold text-[#8aa51d]">
                                                    {number}
                                                </span>
                                                <Icon className="size-5 text-[#526157]" />
                                            </div>
                                            <h3 className="mt-10 text-xl font-semibold">
                                                {title}
                                            </h3>
                                            <p className="mt-3 text-sm leading-6 text-[#526157]">
                                                {description}
                                            </p>
                                        </article>
                                    ),
                                )}
                            </div>
                        </div>
                    </section>
                    <section
                        className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[0.75fr_1.25fr] lg:px-8 lg:py-28"
                        id="features"
                    >
                        <div>
                            <p className="text-xs font-bold tracking-[0.16em] text-[#8aa51d] uppercase">
                                Why PEDF
                            </p>
                            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.06em] sm:text-5xl">
                                A document tool that respects the document.
                            </h2>
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2">
                            {[
                                [
                                    'Edit in context',
                                    'Make changes where they belong instead of exporting content into a separate editor.',
                                    FilePenLine,
                                ],
                                [
                                    'Know the limits',
                                    'Supported text-based files are the focus. Unsupported scanned documents are clearly out of scope.',
                                    ShieldCheck,
                                ],
                                [
                                    'Keep work organized',
                                    'A private workspace for your documents, plans, and usage - not a public file drop.',
                                    Upload,
                                ],
                                [
                                    'Preserve the feel',
                                    'The goal is not just editable text. It is a result that still feels like the original.',
                                    Sparkles,
                                ],
                            ].map(([title, description, Icon], index) => (
                                <article
                                    key={String(title)}
                                    className={`rounded-2xl p-6 ${index === 0 ? 'bg-[#17221e] text-white' : index === 3 ? 'bg-[#d8f36a]' : 'border border-[#17221e]/10 bg-white'}`}
                                >
                                    <Icon
                                        className={`size-6 ${index === 0 ? 'text-[#d8f36a]' : 'text-[#8aa51d]'}`}
                                    />
                                    <h3 className="mt-14 text-xl font-semibold">
                                        {String(title)}
                                    </h3>
                                    <p className="mt-3 text-sm leading-6 text-[#526157]">
                                        {String(description)}
                                    </p>
                                </article>
                            ))}
                        </div>
                    </section>
                    <section
                        className="border-y border-[#17221e]/10 bg-[#eef1e9]"
                        id="pricing"
                    >
                        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
                            <p className="text-xs font-bold tracking-[0.16em] text-[#8aa51d] uppercase">
                                Plans
                            </p>
                            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.06em]">
                                Choose your editing room.
                            </h2>
                            <p className="mt-4 max-w-sm text-sm leading-6 text-[#526157]">
                                Plan details come from the PEDF database and can
                                change as the product evolves.
                            </p>
                            {plans.length > 0 ? (
                                <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                                    {plans.map((plan) => (
                                        <article
                                            key={plan.id}
                                            className="flex flex-col rounded-2xl border border-[#17221e]/10 bg-white p-6"
                                        >
                                            <h3 className="text-xl font-semibold">
                                                {plan.name}
                                            </h3>
                                            <p className="mt-3 min-h-12 text-sm leading-6 text-[#526157]">
                                                {plan.description}
                                            </p>
                                            <div className="mt-8 text-4xl font-semibold">
                                                {Number(plan.price_usd) === 0
                                                    ? 'Free'
                                                    : `$${Number(plan.price_usd).toFixed(2)}`}
                                                <span className="text-sm opacity-60">
                                                    {Number(plan.price_usd) > 0
                                                        ? ` / ${plan.billing_interval}`
                                                        : ''}
                                                </span>
                                            </div>
                                            <p className="mt-2 text-sm text-[#526157]">
                                                {plan.free_documents} included
                                                documents
                                            </p>
                                            <Button
                                                asChild
                                                className="mt-8 w-full"
                                            >
                                                <Link href={register()}>
                                                    Choose {plan.name}{' '}
                                                    <ArrowRight />
                                                </Link>
                                            </Button>
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <div className="mt-12 rounded-2xl border border-dashed border-[#17221e]/20 bg-white/60 p-10 text-center">
                                    <p className="font-semibold">
                                        Plans are being prepared.
                                    </p>
                                    <p className="mt-2 text-sm text-[#526157]">
                                        Create an account to be ready when PEDF
                                        opens your editing workspace.
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>
                    <section
                        className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[0.7fr_1.3fr] lg:px-8"
                        id="faq"
                    >
                        <div>
                            <p className="text-xs font-bold tracking-[0.16em] text-[#8aa51d] uppercase">
                                FAQ
                            </p>
                            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.06em]">
                                The useful answers.
                            </h2>
                        </div>
                        <div className="divide-y divide-[#17221e]/10">
                            {faqs.map(([question, answer]) => (
                                <details key={question} className="group py-5">
                                    <summary className="cursor-pointer list-none pr-8 text-lg font-semibold">
                                        {question}
                                        <span className="float-right text-[#8aa51d]">
                                            +
                                        </span>
                                    </summary>
                                    <p className="mt-3 max-w-2xl text-sm leading-6 text-[#526157]">
                                        {answer}
                                    </p>
                                </details>
                            ))}
                        </div>
                    </section>
                    <section className="mx-5 mb-20 rounded-4xl bg-[#17221e] px-6 py-16 text-center text-white sm:px-12 lg:mx-auto lg:max-w-7xl">
                        <p className="text-xs font-bold tracking-[0.16em] text-[#d8f36a] uppercase">
                            Your next clean copy
                        </p>
                        <h2 className="mx-auto mt-4 max-w-2xl text-4xl font-semibold tracking-[-0.06em] sm:text-6xl">
                            Make the change. Keep the character.
                        </h2>
                        <Button
                            asChild
                            size="lg"
                            className="mt-8 h-12 rounded-xl bg-[#d8f36a] px-6 text-[#17221e] hover:bg-[#c9e45c]"
                        >
                            <Link href={cta}>
                                {auth.user
                                    ? 'Open your workspace'
                                    : 'Create your workspace'}{' '}
                                <ArrowRight />
                            </Link>
                        </Button>
                    </section>
                </main>
                <footer className="border-t border-[#17221e]/10">
                    <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-[#526157] sm:flex-row sm:items-center sm:justify-between lg:px-8">
                        <div className="font-semibold text-[#17221e]">PEDF</div>
                        <p>
                            Supported text-based PDF editing, with the original
                            design in mind.
                        </p>
                        <div className="flex gap-4">
                            <Link href={login()}>Log in</Link>
                            <Link href={register()}>Register</Link>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
