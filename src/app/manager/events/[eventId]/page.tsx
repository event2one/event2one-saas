import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getManagerEvent } from '../../actions';
import EditEventForm from './edit-event-form';

export default async function EventEditPage({
    params,
}: {
    params: Promise<{ eventId: string }>;
}) {
    const { eventId } = await params;
    const event = await getManagerEvent(eventId);

    if (!event) {
        notFound();
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/manager/events">
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Events
                    </Link>
                </Button>
            </div>

            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{event.nom}</h1>
                    <p className="text-muted-foreground mt-1 flex items-center gap-2">
                        ID: {eventId}
                        <Badge variant={event.actif === '1' ? 'default' : 'secondary'}>
                            {event.actif === '1' ? 'Active' : 'Inactive'}
                        </Badge>
                    </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                    <Link href={`/events/${eventId}`} target="_blank">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View page
                    </Link>
                </Button>
            </div>

            <EditEventForm event={event} />
        </div>
    );
}
