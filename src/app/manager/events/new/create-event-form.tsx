'use client';

import { createManagerEvent } from '../../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CreateEventForm() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);

        const result = await createManagerEvent(formData);

        if (result.error) {
            setError(result.error);
            setLoading(false);
        } else {
            router.push('/manager/events');
            router.refresh();
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent>
                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Event Name</Label>
                        <Input id="name" name="name" required placeholder="My Awesome Event" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="date">Start Date</Label>
                        <Input id="date" name="date" type="datetime-local" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" name="location" placeholder="Paris, France or Online" />
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm">{error}</div>
                    )}

                    <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Event'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
