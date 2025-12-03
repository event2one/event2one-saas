import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth.api.getSession({ headers: await headers() });

    return (
        <div className="min-h-screen bg-background">
            {/* Admin Header */}
            <header className="border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-8">
                            <Link href="/manager" className="text-2xl font-bold">
                                Event2one Admin
                            </Link>
                            <nav className="hidden md:flex space-x-6">
                                <Link href="/manager" className="text-sm font-medium hover:text-primary">
                                    Dashboard
                                </Link>
                                <Link href="/manager/events" className="text-sm font-medium hover:text-primary">
                                    Events
                                </Link>
                                <Link href="/manager/users" className="text-sm font-medium hover:text-primary">
                                    Users
                                </Link>
                                <Link href="/manager/settings" className="text-sm font-medium hover:text-primary">
                                    Settings
                                </Link>
                            </nav>
                        </div>

                        {session?.user && (
                            <div className="flex items-center space-x-4">
                                <div className="text-sm">
                                    <p className="font-medium">{session.user.name}</p>
                                    <p className="text-muted-foreground text-xs">{session.user.email}</p>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/api/auth/signout">Sign Out</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                {children}
            </main>
        </div>
    );
}
