import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getDashboardStats } from './actions';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AdminDashboard() {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
        redirect('/signin?callbackUrl=/saas/manager');
    }

    const stats = await getDashboardStats();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome back, {session.user?.name ?? 'Manager'}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="p-6">
                    <div className="flex flex-col space-y-2">
                        <span className="text-sm font-medium text-muted-foreground">Total Events</span>
                        <span className="text-2xl font-bold">{stats.totalEvents}</span>
                        <span className="text-xs text-muted-foreground">Active and past events</span>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex flex-col space-y-2">
                        <span className="text-sm font-medium text-muted-foreground">Active Users</span>
                        <span className="text-2xl font-bold">{stats.activeUsers}</span>
                        <span className="text-xs text-muted-foreground">Registered users</span>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex flex-col space-y-2">
                        <span className="text-sm font-medium text-muted-foreground">Total Votes</span>
                        <span className="text-2xl font-bold">-</span>
                        <span className="text-xs text-muted-foreground">Coming soon</span>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex flex-col space-y-2">
                        <span className="text-sm font-medium text-muted-foreground">Broadcasts</span>
                        <span className="text-2xl font-bold">-</span>
                        <span className="text-xs text-muted-foreground">Coming soon</span>
                    </div>
                </Card>
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="p-6">
                        <h3 className="font-semibold mb-2">Create Event</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Set up a new event with broadcast and voting capabilities
                        </p>
                        <Button asChild>
                            <Link href="/manager/events/new">Create Event</Link>
                        </Button>
                    </Card>

                    <Card className="p-6">
                        <h3 className="font-semibold mb-2">Manage Users</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            View and manage user accounts and permissions
                        </p>
                        <Button asChild variant="outline">
                            <Link href="/manager/users">View Users</Link>
                        </Button>
                    </Card>

                    <Card className="p-6">
                        <h3 className="font-semibold mb-2">System Settings</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Configure platform settings and integrations
                        </p>
                        <Button asChild variant="outline">
                            <Link href="/manager/settings">Settings</Link>
                        </Button>
                    </Card>
                </div>
            </div>

            {/* User Info */}
            {session.user && (
                <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4">Session Information</h2>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">User ID:</span>
                            <span className="font-mono">{session.user.id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Email:</span>
                            <span>{session.user.email}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Name:</span>
                            <span>{session.user.name}</span>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}
