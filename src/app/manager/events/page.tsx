import { getManagerEvents } from '../actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default async function EventsPage() {
    const events = await getManagerEvents();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Events</h1>
                    <p className="text-muted-foreground">
                        Manage your events, broadcasts, and voting sessions.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/manager/events/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Event
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Events</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {events.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No events found. Create your first event!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                events.map((event: any) => (
                                    <TableRow key={event.id_event}>
                                        <TableCell className="font-medium">
                                            {event.nom}
                                        </TableCell>
                                        <TableCell>
                                            {event.date_debut ? new Date(event.date_debut).toLocaleDateString() : 'N/A'}
                                        </TableCell>
                                        <TableCell>{event.lieu || 'Online'}</TableCell>
                                        <TableCell>
                                            <Badge variant={event.actif === '1' ? 'default' : 'secondary'}>
                                                {event.actif === '1' ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/manager/events/${event.id_event}`}>
                                                    Edit
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
