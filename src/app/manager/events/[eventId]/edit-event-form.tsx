'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { updateManagerEvent } from '../../actions';

type Event = {
    id_event: string;
    nom: string;
    date_debut?: string;
    date_fin?: string;
    description?: string;
    actif?: string;
    lieu?: { lieu_nom?: string; lieu_ville?: string; lieu_cp?: string } | string;
};

export default function EditEventForm({ event }: { event: Event }) {
    const router = useRouter();
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const toDateInput = (val?: string) => {
        if (!val) return '';
        return val.slice(0, 10);
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setPending(true);
        setError(null);
        setSuccess(false);

        const result = await updateManagerEvent(event.id_event, new FormData(e.currentTarget));

        setPending(false);
        if (result.error) {
            setError(result.error);
        } else {
            setSuccess(true);
            router.refresh();
        }
    }

    const lieuNom =
        typeof event.lieu === 'object' ? event.lieu?.lieu_nom ?? '' : event.lieu ?? '';
    const lieuVille =
        typeof event.lieu === 'object' ? event.lieu?.lieu_ville ?? '' : '';

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>General</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="nom">Event name</Label>
                        <Input id="nom" name="nom" defaultValue={event.nom} required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="date_debut">Start date</Label>
                            <Input
                                id="date_debut"
                                name="date_debut"
                                type="date"
                                defaultValue={toDateInput(event.date_debut)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="date_fin">End date</Label>
                            <Input
                                id="date_fin"
                                name="date_fin"
                                type="date"
                                defaultValue={toDateInput(event.date_fin)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <textarea
                            id="description"
                            name="description"
                            rows={4}
                            defaultValue={event.description ?? ''}
                            className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Location</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                        {lieuNom || lieuVille
                            ? `${lieuNom}${lieuVille ? `, ${lieuVille}` : ''}`
                            : 'No location set'}
                    </div>
                    <p className="text-xs text-muted-foreground italic">
                        Location is managed via the MLG back-office and cannot be edited here.
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-3">
                        <input
                            id="actif"
                            name="actif"
                            type="checkbox"
                            value="1"
                            defaultChecked={event.actif === '1'}
                            className="h-4 w-4 rounded border-input accent-primary"
                        />
                        <Label htmlFor="actif">Active (visible to participants)</Label>
                    </div>
                </CardContent>
            </Card>

            {error && (
                <p className="text-sm text-destructive">{error}</p>
            )}
            {success && (
                <p className="text-sm text-green-600">Event saved successfully.</p>
            )}

            <div className="flex gap-3">
                <Button type="submit" disabled={pending}>
                    {pending ? 'Saving…' : 'Save changes'}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push('/manager/events')}>
                    Cancel
                </Button>
            </div>
        </form>
    );
}
