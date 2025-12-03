import CreateEventForm from './create-event-form';

export default function NewEventPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Create New Event</h1>
                <p className="text-muted-foreground">
                    Fill in the details to create a new event.
                </p>
            </div>
            <CreateEventForm />
        </div>
    );
}
