'use client';

import { useParams, useSearchParams } from 'next/navigation';

import { ParticipantStreamPublisher } from '@/features/broadcast/components/ParticipantStreamPublisher';

export default function ParticipantPage() {
    const params = useParams();
    const searchParams = useSearchParams();

    const participantId = params?.participantId as string;
    const idConfEvent = searchParams.get('idConfEvent') || '';
    const displayName = searchParams.get('name') || undefined;

    return (
        <div className="min-h-screen bg-neutral-950 text-white px-4 py-6">
            <div className="max-w-4xl mx-auto">
                <ParticipantStreamPublisher participantId={participantId} idConfEvent={idConfEvent} displayName={displayName} />
            </div>
        </div>
    );
}
