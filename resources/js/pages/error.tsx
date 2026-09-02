import { Head, Link } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, Home, ServerCrash } from 'lucide-react';

interface ErrorProps {
    status: number;
}

interface ErrorConfig {
    icon: React.ElementType;
    heading: string;
    title: string;
    description: string;
    showHome: boolean;
    showBack: boolean;
}

function getConfig(status: number): ErrorConfig {
    switch (status) {
        case 404:
            return {
                icon: Home,
                heading: '404',
                title: 'Page not found',
                description:
                    "The page you're looking for doesn't exist or may have been moved. Double-check the URL or head back to the homepage.",
                showHome: true,
                showBack: true,
            };
        case 403:
            return {
                icon: AlertCircle,
                heading: '403',
                title: 'Access denied',
                description: "You don't have permission to view this page.",
                showHome: true,
                showBack: true,
            };
        case 500:
            return {
                icon: ServerCrash,
                heading: '500',
                title: 'Server error',
                description:
                    'Something went wrong on our end. Please try again in a moment.',
                showHome: true,
                showBack: false,
            };
        case 503:
            return {
                icon: ServerCrash,
                heading: '503',
                title: 'Service unavailable',
                description: "We're down for maintenance. Check back shortly.",
                showHome: false,
                showBack: false,
            };
        default:
            return {
                icon: AlertCircle,
                heading: String(status),
                title: 'Something went wrong',
                description: 'An unexpected error occurred.',
                showHome: true,
                showBack: true,
            };
    }
}

export default function Error({ status }: ErrorProps) {
    const config = getConfig(status);
    const Icon = config.icon;

    return (
        <>
            <Head title={`${config.heading} — ${config.title}`} />

            {/* Full-page dark background matching the landing page */}
            <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0a0a0a] px-6 py-20 font-sans antialiased">
                {/* Radial glow — same as hero */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 flex items-center justify-center"
                >
                    <div className="h-[500px] w-[800px] rounded-full bg-[#d8f36a]/6 blur-[120px]" />
                </div>

                <div className="relative z-10 mx-auto flex max-w-lg flex-col items-center text-center">
                    {/* Icon badge */}
                    <div className="mb-8 flex size-20 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                        <Icon
                            className="size-10 text-[#d8f36a]"
                            aria-hidden="true"
                        />
                    </div>

                    {/* Status code */}
                    <p className="mb-3 text-8xl leading-none font-extrabold tracking-tight text-[#d8f36a]">
                        {config.heading}
                    </p>

                    {/* Title */}
                    <h1 className="mb-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                        {config.title}
                    </h1>

                    {/* Description */}
                    <p className="mb-10 max-w-sm text-base leading-relaxed text-gray-400">
                        {config.description}
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                        {config.showHome && (
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 rounded-xl bg-[#d8f36a] px-6 py-3 text-sm font-semibold text-[#17221e] shadow-lg shadow-[#d8f36a]/20 transition-all hover:bg-[#c8e355] hover:shadow-[#d8f36a]/30 focus:ring-2 focus:ring-[#d8f36a] focus:ring-offset-2 focus:ring-offset-[#0a0a0a] focus:outline-none"
                            >
                                <Home className="size-4" aria-hidden="true" />
                                Back to Home
                            </Link>
                        )}

                        {config.showBack && (
                            <button
                                type="button"
                                onClick={() => window.history.back()}
                                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/5 focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-[#0a0a0a] focus:outline-none"
                            >
                                <ArrowLeft
                                    className="size-4"
                                    aria-hidden="true"
                                />
                                Go back
                            </button>
                        )}
                    </div>
                </div>

                {/* Footer credit */}
                <p className="absolute bottom-6 text-xs text-gray-700">
                    &copy; {new Date().getFullYear()} PEDF
                </p>
            </div>
        </>
    );
}
