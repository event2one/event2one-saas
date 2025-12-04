'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { Users, MonitorPlay } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ParticipantSummary } from '@/features/broadcast/types';

interface ParticipantStreamsPanelProps {
    idConfEvent?: number;
    socket: Socket | null;
}

const statusVariant: Record<string, string> = {
    idle: 'bg-neutral-700 text-neutral-100',
    requested: 'bg-amber-500 text-black',
    streaming: 'bg-emerald-500 text-black',
};

export function ParticipantStreamsPanel({ idConfEvent, socket }: ParticipantStreamsPanelProps) {
    const [participants, setParticipants] = useState<ParticipantSummary[]>([]);
    const [selectedScreen, setSelectedScreen] = useState('1');
    const [isAssigning, setIsAssigning] = useState<string | null>(null);

    useEffect(() => {
        if (!socket) return;
        const handleList = (list: ParticipantSummary[]) => setParticipants(list);
        socket.on('admin:participant-list', handleList);
        return () => {
            socket.off('admin:participant-list', handleList);
        };
    }, [socket]);

    const requestStream = (participantId: string) => {
        if (!socket || !selectedScreen) return;
        setIsAssigning(participantId);
        socket.emit('admin:assign-stream', {
            participantId,
            screenId: selectedScreen,
            idConfEvent,
        });
        setTimeout(() => setIsAssigning(null), 800);
    };

    const stopStream = (participantId: string) => {
        if (!socket) return;
        socket.emit('admin:stop-stream', {
            participantId,
            screenId: selectedScreen,
            idConfEvent,
        });
    };

    const sortedParticipants = useMemo(
        () => [...participants].sort((a, b) => (a.displayName || '').localeCompare(b.displayName || '')),
        [participants]
    );

    return (
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 text-white">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-400" />
                    <div>
                        <p className="text-sm text-neutral-400 leading-none">Flux participants</p>
                        <h3 className="text-lg font-semibold">Salle de régie</h3>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <MonitorPlay className="w-4 h-4 text-neutral-400" />
                    <Input
                        value={selectedScreen}
                        onChange={(event) => setSelectedScreen(event.target.value)}
                        placeholder="ID écran"
                        className="h-8 w-28 bg-neutral-800 border-neutral-700 text-right"
                    />
                </div>
            </div>

            {sortedParticipants.length === 0 ? (
                <p className="text-sm text-neutral-400">
                    Aucun participant connecté pour l&rsquo;instant. Invitez vos intervenants à ouvrir la page participant.
                </p>
            ) : (
                <div className="space-y-2">
                    {sortedParticipants.map((participant) => (
                        <div
                            key={participant.participantId}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-900/60 px-3 py-2"
                        >
                            <div>
                                <p className="font-medium text-sm">{participant.displayName || participant.participantId}</p>
                                <p className="text-xs text-neutral-500">ID: {participant.participantId}</p>
                                {participant.currentScreenId && (
                                    <p className="text-xs text-neutral-400">Diffuse sur l&rsquo;écran #{participant.currentScreenId}</p>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge className={statusVariant[participant.status] || statusVariant.idle}>
                                    {participant.status === 'streaming' && 'En direct'}
                                    {participant.status === 'requested' && 'Connexion...'}
                                    {participant.status === 'idle' && 'Disponible'}
                                </Badge>
                                <Button
                                    size="sm"
                                    onClick={() => requestStream(participant.participantId)}
                                    disabled={!selectedScreen}
                                    className="bg-emerald-600 hover:bg-emerald-500"
                                >
                                    {isAssigning === participant.participantId ? 'Connexion...' : 'Afficher'}
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => stopStream(participant.participantId)}>
                                    Stop
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
