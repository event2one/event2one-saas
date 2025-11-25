import React from 'react';
import VotingApp from '@/features/voting/components/VotingApp';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export default function VotingPage({ params }: { params: { slug: string[] } }) {
    return (
        <VotingApp params={params} />
    );
}
