'use client';

import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { VotingResult } from '@/features/broadcast/types';
import { useConfEvent } from '@/features/broadcast/contexts/ConfEventContext';
import { Trophy, Medal, Award } from 'lucide-react';

interface RankingSectionProps {
    idJuryEvent?: number; // Fallback if context is not available
}

export function RankingSection({ idJuryEvent: propIdJuryEvent }: RankingSectionProps = {}) {
    // Try to get id_jury_event from context first
    let contextIdJuryEvent: number | undefined;
    let confEventData: any;
    try {
        const { confEvent } = useConfEvent();
        confEventData = confEvent;
        contextIdJuryEvent = confEvent?.id_jury_event;
    } catch (error) {
        // Context not available, will use prop
        console.log('ConfEvent context not available, using prop');
    }

    // Use context value if available, otherwise fallback to prop
    const idJuryEvent = contextIdJuryEvent ?? propIdJuryEvent;

    const [rankingData, setRankingData] = useState<VotingResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0); // Used to trigger re-fetch

    useEffect(() => {
        const fetchRankingData = async () => {
            // Only fetch if we have id_jury_event
            if (!idJuryEvent) {
                console.log('No id_jury_event available');
                return;
            }

            // Don't set loading on background refreshes if we already have data
            if (rankingData.length === 0) setIsLoading(true);

            try {
                console.log('Fetching ranking data - confEvent context:', confEventData);
                console.log('Using id_jury_event:', confEventData?.jury_event?.id_jury_event || idJuryEvent);

                // Use the id_jury_event from context if available, otherwise prop
                const targetIdJuryEvent = confEventData?.jury_event?.id_jury_event || idJuryEvent;

                const filter = encodeURIComponent(`WHERE id_jury_event=${targetIdJuryEvent}`);
                const endpoint = `https://www.myglobalvillage.com/api/?action=getParcoursEval&filter=${filter}`;

                console.log('Fetching ranking data from:', endpoint);

                const response = await fetch(endpoint);
                const data = await response.json();

                console.log('Ranking data received:', data);
                setRankingData(data || []);
            } catch (error) {
                console.error('Error fetching ranking data:', error);
                setRankingData([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRankingData();
    }, [idJuryEvent, refreshTrigger]);

    // Socket.IO connection for real-time updates
    useEffect(() => {
        if (typeof window === 'undefined' || !idJuryEvent) return;

        const socketUrl = window.location.origin;
        const socket = io(socketUrl, {
            path: '/saas/socket.io'
        });

        socket.on('connect', () => {
            console.log('RankingSection: Socket connected');
            // Join the admin room for this event
            // Note: idJuryEvent here corresponds to 'ije' or 'adminId' passed to admin:join-event
            socket.emit('admin:join-event', { ije: idJuryEvent });
        });

        socket.on('admin:vote-updated', (data: any) => {
            console.log('RankingSection: Received vote update', data);
            // Trigger a re-fetch
            setRefreshTrigger(prev => prev + 1);
        });

        return () => {
            socket.disconnect();
        };
    }, [idJuryEvent]);

    // Calculate total score and sort
    const rankedCandidates = rankingData
        .map(candidate => ({
            ...candidate,
            totalScore:
                (parseInt(candidate.meeting) || 0) +
                (parseInt(candidate.comprehension) || 0) +
                (parseInt(candidate.timing) || 0) +
                (parseInt(candidate.support) || 0) +
                (parseInt(candidate.presentation) || 0)
        }))
        .sort((a, b) => b.totalScore - a.totalScore);

    const getRankIcon = (index: number) => {
        if (index === 0) return <Trophy className="w-5 h-5 text-yellow-500" />;
        if (index === 1) return <Medal className="w-5 h-5 text-gray-400" />;
        if (index === 2) return <Award className="w-5 h-5 text-amber-600" />;
        return null;
    };

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
                <h2 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-white">Classement des Candidats</h2>
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                </div>
            </div>
        );
    }

    if (rankedCandidates.length === 0) {
        return (
            <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
                <h2 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-white">Classement des Candidats</h2>
                <p className="text-neutral-500 dark:text-neutral-400 text-center py-8">
                    Aucun résultat de vote disponible pour le moment.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
            <h2 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-emerald-600" />
                Classement des Candidats
            </h2>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-neutral-200 dark:border-neutral-800">
                            <th className="text-left py-3 px-2 font-semibold text-neutral-700 dark:text-neutral-300">Rang</th>
                            <th className="text-left py-3 px-2 font-semibold text-neutral-700 dark:text-neutral-300">Candidat</th>
                            <th className="text-left py-3 px-2 font-semibold text-neutral-700 dark:text-neutral-300">Société</th>
                            <th className="text-center py-3 px-2 font-semibold text-neutral-700 dark:text-neutral-300">Meeting</th>
                            <th className="text-center py-3 px-2 font-semibold text-neutral-700 dark:text-neutral-300">Quality of presentation</th>
                            <th className="text-center py-3 px-2 font-semibold text-neutral-700 dark:text-neutral-300">Impact of the solution</th>
                            <th className="text-center py-3 px-2 font-semibold text-neutral-700 dark:text-neutral-300">Innovation of the solution</th>
                            <th className="text-center py-3 px-2 font-semibold text-neutral-700 dark:text-neutral-300">Interest for my business sector</th>
                            <th className="text-center py-3 px-2 font-semibold text-emerald-600 dark:text-emerald-400">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rankedCandidates.map((candidate, index) => (
                            <tr
                                key={candidate.id_parcours_eval}
                                className="border-b border-neutral-100 dark:border-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors"
                            >
                                <td className="py-3 px-2">
                                    <div className="flex items-center gap-2">
                                        {getRankIcon(index)}
                                        <span className="font-mono font-semibold text-neutral-900 dark:text-white">
                                            #{index + 1}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-3 px-2">
                                    <div className="font-medium text-neutral-900 dark:text-white">
                                        {candidate.prenom} <span className="uppercase">{candidate.nom}</span>
                                    </div>
                                </td>
                                <td className="py-3 px-2 text-neutral-600 dark:text-neutral-400">
                                    {candidate.societe}
                                </td>
                                <td className="py-3 px-2 text-center">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold">
                                        {candidate.meeting}
                                    </span>
                                </td>
                                <td className="py-3 px-2 text-center">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-semibold">
                                        {candidate.presentation}
                                    </span>
                                </td>
                                <td className="py-3 px-2 text-center">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 font-semibold">
                                        {candidate.comprehension}
                                    </span>
                                </td>
                                <td className="py-3 px-2 text-center">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 font-semibold">
                                        {candidate.timing}
                                    </span>
                                </td>
                                <td className="py-3 px-2 text-center">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 font-semibold">
                                        {candidate.support}
                                    </span>
                                </td>
                                <td className="py-3 px-2 text-center">
                                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-bold text-base">
                                        {candidate.totalScore}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
