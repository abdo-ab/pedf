import { Link } from '@inertiajs/react';
import {
    Pencil,
    LayoutDashboard,
    Download,
    ShieldCheck,
    FolderOpen,
    Zap,
    Plus,
    Minus,
    ChevronDown,
    Star,
    ExternalLink,
    Github,
    Send,
} from 'lucide-react';
import { useState } from 'react';
import { register } from '@/routes';

// ── Floating Pill Navbar ───────────────────────────────────────────────────────

function Navbar() {
    return (
        <div className="fixed top-4 left-1/2 z-50 w-full max-w-2xl -translate-x-1/2 px-4">
            <header className="flex items-center justify-between gap-2 rounded-full border border-white/10 bg-[#111] px-3 py-2 shadow-lg shadow-black/30 backdrop-blur-md">
                {/* Logo */}
                <a
                    href="/"
                    className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                    aria-label="PEDF home"
                >
                    <img src="/favicon.svg" alt="PEDF" className="size-5" />
                </a>

                {/* Nav links */}
                <nav className="flex items-center gap-1 text-sm font-medium text-gray-300">
                    <a
                        href="#features"
                        className="rounded-full px-3 py-1.5 transition-colors hover:bg-white/10 hover:text-white"
                    >
                        Features
                    </a>
                    <a
                        href="#about"
                        className="hidden rounded-full px-3 py-1.5 transition-colors hover:bg-white/10 hover:text-white sm:block"
                    >
                        About
                    </a>
                    <a
                        href="#faq"
                        className="hidden rounded-full px-3 py-1.5 transition-colors hover:bg-white/10 hover:text-white sm:block"
                    >
                        FAQ
                    </a>
                </nav>

                {/* Divider */}
                <div
                    className="hidden h-4 w-px bg-white/15 sm:block"
                    aria-hidden="true"
                />

                {/* GitHub stars */}
                <a
                    href="https://github.com/abdo-ab/pedf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                    aria-label="Star on GitHub — 271 stars"
                >
                    <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
                    <span>271</span>
                    <span className="hidden text-gray-600 sm:inline">
                        support
                    </span>
                </a>

                {/* CTA */}
                <Link
                    href={register().url}
                    className="shrink-0 rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-black transition-colors hover:bg-gray-100 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black focus:outline-none"
                >
                    Try it free
                </Link>
            </header>
        </div>
    );
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function Hero() {
    return (
        <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0a0a0a] px-6 pt-28 pb-20">
            {/* Radial glow */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 flex items-center justify-center"
            >
                <div className="h-[600px] w-[900px] rounded-full bg-[#d8f36a]/8 blur-[120px]" />
            </div>

            <div className="relative z-10 mx-auto max-w-4xl text-center">
                <h1 className="text-5xl leading-[1.1] font-extrabold tracking-tight text-white md:text-7xl">
                    Edit PDFs. <span className="text-[#d8f36a]">Keep the</span>
                    <br />
                    <span className="text-[#d8f36a]">original design.</span>
                </h1>

                <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-gray-400">
                    PEDF lets you modify text in supported, text-based PDFs
                    while preserving the original layout. No scanned or
                    image-only PDFs — just clean edits that fit the design.
                </p>

                <p className="mt-5 text-xs text-gray-600">
                    No credit card required &middot; Text-based PDFs only
                </p>
            </div>

            {/* Scroll hint */}
            <div
                className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-gray-700"
                aria-hidden="true"
            >
                <ChevronDown className="size-5" />
            </div>
        </section>
    );
}

// ── Features ──────────────────────────────────────────────────────────────────

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
    return (
        <div className="group rounded-2xl border border-white/5 bg-white/3 p-6 transition-all hover:border-white/10 hover:bg-white/5">
            <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-[#d8f36a]/10 text-[#d8f36a]">
                {icon}
            </div>
            <h3 className="mb-2 text-sm font-semibold text-white">{title}</h3>
            <p className="text-sm leading-relaxed text-gray-500">
                {description}
            </p>
        </div>
    );
}

function Features() {
    const features: FeatureCardProps[] = [
        {
            icon: <Pencil className="size-5" aria-hidden="true" />,
            title: 'Edit text inline',
            description:
                'Click any selectable text in a compatible PDF and edit it directly — no copy-pasting or re-exporting.',
        },
        {
            icon: <LayoutDashboard className="size-5" aria-hidden="true" />,
            title: 'Layout stays intact',
            description:
                'Fonts, spacing, and page structure are preserved wherever technically possible. Your edits blend right in.',
        },
        {
            icon: <Download className="size-5" aria-hidden="true" />,
            title: 'One-click download',
            description:
                'Export your edited file as a standard PDF. Ready to share immediately.',
        },
        {
            icon: <ShieldCheck className="size-5" aria-hidden="true" />,
            title: 'Text-based PDFs only',
            description:
                "Works with PDFs that contain actual text data. Scanned or image-only files aren't supported — and we'll tell you upfront.",
        },
        {
            icon: <FolderOpen className="size-5" aria-hidden="true" />,
            title: 'Document history',
            description:
                'All your uploaded and edited documents are saved to your account for easy access.',
        },
        {
            icon: <Zap className="size-5" aria-hidden="true" />,
            title: 'No install needed',
            description:
                'Runs entirely in your browser. Upload, edit, download — done.',
        },
    ];

    return (
        <section id="features" className="bg-[#0a0a0a] py-24">
            <div className="mx-auto max-w-6xl px-6">
                <div className="mb-14 text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                        Built for one job
                    </h2>
                    <p className="mx-auto mt-4 max-w-md text-gray-500">
                        A focused PDF editor that respects the original design.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((f) => (
                        <FeatureCard key={f.title} {...f} />
                    ))}
                </div>
            </div>
        </section>
    );
}

// ── About ─────────────────────────────────────────────────────────────────────

function About() {
    return (
        <section id="about" className="bg-[#0d0d0d] py-24">
            <div className="mx-auto max-w-3xl px-6">
                <div className="rounded-2xl border border-white/5 bg-white/2 p-8 sm:p-12">
                    <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-[#d8f36a]/10">
                        <img src="/favicon.svg" alt="PEDF" className="size-7" />
                    </div>

                    <h2 className="mb-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                        What is PEDF?
                    </h2>

                    <div className="space-y-4 leading-relaxed text-gray-400">
                        <p>
                            PEDF is a browser-based PDF text editor built for
                            people who need to make quick, clean edits to
                            existing documents without destroying their design.
                        </p>
                        <p>
                            Most PDF editors either convert your document to an
                            editable format (breaking the layout) or require
                            expensive desktop software. PEDF takes a different
                            approach — it works directly with the PDF's internal
                            text data, so the original structure, fonts, and
                            spacing are preserved wherever possible.
                        </p>
                        <p>
                            It's designed for text-based PDFs only. If you
                            upload a scanned document or an image-only PDF, PEDF
                            will let you know before you waste any time.
                        </p>
                        <p>
                            No installation, no subscription required to get
                            started. Just upload, edit, and download.
                        </p>
                    </div>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-gray-300">
                            <Zap
                                className="size-3.5 text-[#d8f36a]"
                                aria-hidden="true"
                            />
                            Browser-based
                        </div>
                        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-gray-300">
                            <ShieldCheck
                                className="size-3.5 text-[#d8f36a]"
                                aria-hidden="true"
                            />
                            Layout-preserving
                        </div>
                        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-gray-300">
                            <Pencil
                                className="size-3.5 text-[#d8f36a]"
                                aria-hidden="true"
                            />
                            Text-based PDFs
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ── FAQ ───────────────────────────────────────────────────────────────────────

interface FaqItemProps {
    question: string;
    answer: string;
    isOpen: boolean;
    onToggle: () => void;
}

function FaqItem({ question, answer, isOpen, onToggle }: FaqItemProps) {
    return (
        <div className="border-b border-white/5">
            <button
                type="button"
                onClick={onToggle}
                className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors hover:text-white focus:outline-none"
                aria-expanded={isOpen}
            >
                <span className="text-sm font-semibold text-white">
                    {question}
                </span>
                <span className="shrink-0">
                    {isOpen ? (
                        <Minus
                            className="size-4 text-[#d8f36a]"
                            aria-hidden="true"
                        />
                    ) : (
                        <Plus
                            className="size-4 text-gray-400"
                            aria-hidden="true"
                        />
                    )}
                </span>
            </button>

            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-96 pb-5 opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
                <p className="text-sm leading-relaxed text-gray-500">
                    {answer}
                </p>
            </div>
        </div>
    );
}

function Faq() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const items = [
        {
            question: 'What types of PDFs does PEDF support?',
            answer: 'PEDF works with text-based PDFs — files where the text is stored as actual selectable content. PDFs that are purely scanned images are not supported.',
        },
        {
            question: 'Will editing change the look of my PDF?',
            answer: 'PEDF is designed to preserve the original layout wherever technically possible. Fonts, spacing, and structure remain consistent with the original document.',
        },
        {
            question: 'Do I need to install anything?',
            answer: 'No. PEDF runs entirely in your browser. Create a free account, upload your PDF, and start editing.',
        },
        {
            question: 'Is there a free plan?',
            answer: 'Yes — you can get started for free. Sign up and explore the editor at no cost.',
        },
        {
            question: 'What if my PDF cannot be edited?',
            answer: 'If PEDF detects an incompatible PDF (image-only, encrypted, etc.), it will let you know before you attempt to edit.',
        },
    ];

    return (
        <section id="faq" className="bg-[#0a0a0a] py-24">
            <div className="mx-auto max-w-2xl px-6">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                        Frequently asked questions
                    </h2>
                    <p className="mt-4 text-gray-500">
                        Still curious? Reach out via the contact link below.
                    </p>
                </div>

                <dl>
                    {items.map((item, index) => (
                        <FaqItem
                            key={item.question}
                            question={item.question}
                            answer={item.answer}
                            isOpen={openIndex === index}
                            onToggle={() =>
                                setOpenIndex(openIndex === index ? null : index)
                            }
                        />
                    ))}
                </dl>
            </div>
        </section>
    );
}

// ── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
    return (
        <footer className="border-t border-white/5 bg-[#0a0a0a] py-8">
            <div className="mx-auto max-w-6xl px-6">
                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                    {/* Copyright */}
                    <p className="text-center text-sm text-gray-600 sm:text-left">
                        &copy; {new Date().getFullYear()} PEDF. All rights
                        reserved.
                    </p>

                    {/* Developer info */}
                    <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500">
                        <span className="text-gray-700">Built by Abdo Ab</span>

                        <a
                            href="https://abdoab.dev"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 transition-colors hover:text-white"
                        >
                            <ExternalLink
                                className="size-3.5"
                                aria-hidden="true"
                            />
                            Portfolio
                        </a>

                        <a
                            href="https://t.me/abshamam"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 transition-colors hover:text-white"
                        >
                            <Send className="size-3.5" aria-hidden="true" />
                            Telegram
                        </a>

                        <a
                            href="https://github.com/abdo-ab/pedf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 transition-colors hover:text-white"
                        >
                            <Github className="size-3.5" aria-hidden="true" />
                            GitHub
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Welcome() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] font-sans antialiased">
            <Navbar />
            <main>
                <Hero />
                <Features />
                <About />
                <Faq />
            </main>
            <Footer />
        </div>
    );
}
