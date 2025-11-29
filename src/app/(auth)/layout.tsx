import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Authentification - Event2one',
    description: 'Connectez-vous ou créez votre compte Event2one',
};

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            {/* Left side - Dark with branding */}
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
                <div className="relative z-20 flex items-center text-lg font-medium">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="font-bold text-2xl">Event2one</span>
                    </Link>
                </div>
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-lg">
                            &ldquo;Event2one has transformed how we manage our events. The platform is intuitive, powerful, and saves us countless hours.&rdquo;
                        </p>
                        <footer className="text-sm">Sofia Davis - Event Manager</footer>
                    </blockquote>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
                    {children}
                </div>
            </div>
        </div>
    );
}
