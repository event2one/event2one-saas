import React from 'react';
import VotingApp from '@/features/voting/components/VotingApp';

export default async function VotingPage({ params }: { params: Promise<{ slug: string[] }> }) {
    const resolvedParams = await params;

    return (
        <VotingApp params={resolvedParams} />
    );
}
