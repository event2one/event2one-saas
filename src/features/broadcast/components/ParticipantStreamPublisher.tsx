'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { AlertCircle, Camera, CameraOff, Mic, MicOff, RefreshCcw } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ParticipantStreamStatus } from '@/features/broadcast/types';

const ICE_SERVERS: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
];

interface ParticipantStreamPublisherProps {
    participantId: string;
    idConfEvent: string;
    displayName?: string;
}

const statusLabel: Record<ParticipantStreamStatus, string> = {
    idle: 'En attente',
    requested: 'Connexion en cours',
    streaming: 'En direct',
};

export function ParticipantStreamPublisher({ participantId, idConfEvent, displayName }: ParticipantStreamPublisherProps) {
    const [status, setStatus] = useState<ParticipantStreamStatus>('idle');
    const [socketState, setSocketState] = useState<'disconnected' | 'connected'>('disconnected');
    const [message, setMessage] = useState<string | null>(null);
    const [mediaError, setMediaError] = useState<string | null>(null);
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
    const [pendingScreenId, setPendingScreenId] = useState<string | null>(null);
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isVideoMuted, setIsVideoMuted] = useState(false);

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

    const canOperate = participantId && idConfEvent;

    const resetPeerConnection = () => {
        if (peerConnectionRef.current) {
            peerConnectionRef.current.ontrack = null;
            peerConnectionRef.current.onicecandidate = null;
            peerConnectionRef.current.onconnectionstatechange = null;
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }
    };

    const stopStreaming = () => {
        const previousScreen = pendingScreenId;
        resetPeerConnection();
        setStatus('idle');
        setPendingScreenId(null);
        if (previousScreen) {
            socketRef.current?.emit('participant:stop-stream', {
                participantId,
                screenId: previousScreen,
            });
        }
    };

    const requestLocalMedia = async (): Promise<MediaStream | null> => {
        if (mediaStream || !canOperate) return mediaStream || null;
        if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
            setMediaError('API média non disponible dans ce navigateur.');
            return null;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setMediaStream(stream);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setMediaError(null);
            return stream;
        } catch (error) {
            console.error('Impossible d\'accéder à la webcam:', error);
            setMediaError("Autorisez l'accès à la webcam et au micro pour participer.");
            return null;
        }
    };

    const attachStreamToVideo = (stream: MediaStream | null) => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    };

    const ensureLocalStream = async (): Promise<MediaStream | null> => {
        if (mediaStream) return mediaStream;
        return await requestLocalMedia();
    };

    const handleIceCandidate = (screenId: string, event: RTCPeerConnectionIceEvent) => {
        if (event.candidate && socketRef.current) {
            socketRef.current.emit('webrtc:ice-candidate', {
                target: 'screen',
                participantId,
                screenId,
                candidate: event.candidate,
            });
        }
    };

    const handleConnectionChange = (pc: RTCPeerConnection) => {
        setMessage(pc.connectionState);
        if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
            stopStreaming();
        }
    };

    const startPublishingToScreen = async (screenId: string) => {
        console.log('[PARTICIPANT] startPublishingToScreen called for screen:', screenId);
        const localStream = await ensureLocalStream();
        if (!localStream || !socketRef.current) {
            console.error('[PARTICIPANT] No local stream or socket:', { localStream: !!localStream, socket: !!socketRef.current });
            setMessage('Flux local indisponible.');
            return;
        }

        console.log('[PARTICIPANT] Local stream OK, creating peer connection');
        resetPeerConnection();
        const peer = new RTCPeerConnection({ iceServers: ICE_SERVERS });
        peerConnectionRef.current = peer;
        localStream.getTracks().forEach((track) => {
            console.log('[PARTICIPANT] Adding track:', track.kind, track.id);
            peer.addTrack(track, localStream);
        });
        peer.onicecandidate = (event) => handleIceCandidate(screenId, event);
        peer.onconnectionstatechange = () => handleConnectionChange(peer);

        try {
            console.log('[PARTICIPANT] Creating WebRTC offer...');
            const offer = await peer.createOffer();
            await peer.setLocalDescription(offer);
            console.log('[PARTICIPANT] Sending offer to server');
            socketRef.current.emit('webrtc:offer', {
                participantId,
                screenId,
                sdp: offer,
            });
            setPendingScreenId(screenId);
            setStatus('requested');
            setMessage("Connexion vers la régie écran...");
            console.log('[PARTICIPANT] Offer sent successfully');
        } catch (error) {
            console.error('[PARTICIPANT] Erreur lors de la création de l\'offre WebRTC:', error);
            setMessage('Impossible de démarrer la diffusion.');
        }
    };

    const handleAnswer = async (screenId: string, sdp: RTCSessionDescriptionInit) => {
        console.log('[PARTICIPANT] Received WebRTC answer from screen:', screenId);
        const peer = peerConnectionRef.current;
        if (!peer) {
            console.error('[PARTICIPANT] No peer connection for answer');
            return;
        }
        try {
            console.log('[PARTICIPANT] Setting remote description (answer)');
            await peer.setRemoteDescription(new RTCSessionDescription(sdp));
            setStatus('streaming');
            setMessage(`Diffusion vers écran ${screenId}`);
            console.log('[PARTICIPANT] Answer processed, connection established');
        } catch (error) {
            console.error('[PARTICIPANT] Erreur lors de l\'application de la réponse WebRTC:', error);
            setMessage('La réponse WebRTC est invalide.');
        }
    };

    const addRemoteCandidate = async (candidate: RTCIceCandidateInit) => {
        console.log('[PARTICIPANT] Adding remote ICE candidate');
        try {
            await peerConnectionRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
            console.log('[PARTICIPANT] ICE candidate added successfully');
        } catch (error) {
            console.error('[PARTICIPANT] Erreur lors de l\'ajout du candidat ICE:', error);
        }
    };

    useEffect(() => {
        if (!canOperate || typeof window === 'undefined') return;

        requestLocalMedia();

        const socketUrl = window.location.origin;
        const socket = io(socketUrl, { path: '/saas/socket.io' });
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('[PARTICIPANT] Socket connected');
            setSocketState('connected');
            socket.emit('participant:join', {
                participantId,
                displayName,
                idConfEvent,
            });
        });

        socket.on('disconnect', () => {
            console.log('[PARTICIPANT] Socket disconnected');
            setSocketState('disconnected');
            setStatus('idle');
        });

        socket.on('participant:start-stream', ({ screenId }: { screenId: string }) => {
            console.log('[PARTICIPANT] Received start-stream for screen:', screenId);
            setMessage(`La régie demande un flux pour l'écran ${screenId}`);
            startPublishingToScreen(screenId);
        });

        socket.on('participant:stop-stream', () => {
            console.log('[PARTICIPANT] Received stop-stream');
            setMessage('La régie a interrompu la diffusion.');
            stopStreaming();
        });

        socket.on('webrtc:answer', ({ screenId, sdp }: { screenId: string; sdp: RTCSessionDescriptionInit }) => {
            handleAnswer(screenId, sdp);
        });

        socket.on('webrtc:ice-candidate', ({ candidate }: { candidate: RTCIceCandidateInit }) => {
            if (candidate) addRemoteCandidate(candidate);
        });

        return () => {
            socket.emit('participant:leave');
            socket.disconnect();
            resetPeerConnection();
            mediaStream?.getTracks().forEach((track) => track.stop());
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canOperate, participantId, idConfEvent, displayName]);

    useEffect(() => {
        attachStreamToVideo(mediaStream);
    }, [mediaStream]);

    const toggleAudio = () => {
        if (!mediaStream) return;
        const enabled = !isAudioMuted;
        mediaStream.getAudioTracks().forEach((track) => {
            track.enabled = enabled;
        });
        setIsAudioMuted(!isAudioMuted);
    };

    const toggleVideo = () => {
        if (!mediaStream) return;
        const enabled = !isVideoMuted;
        mediaStream.getVideoTracks().forEach((track) => {
            track.enabled = enabled;
        });
        setIsVideoMuted(!isVideoMuted);
    };

    const statusColor = useMemo(() => {
        if (status === 'streaming') return 'bg-emerald-500';
        if (status === 'requested') return 'bg-amber-500';
        return 'bg-neutral-500';
    }, [status]);

    if (!canOperate) {
        return (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-red-100">
                <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    <p>Identifiants participant ou session manquants.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="rounded-2xl bg-neutral-900/80 border border-neutral-800 shadow-2xl p-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-sm text-neutral-400 uppercase tracking-wide">Participant</p>
                        <h2 className="text-xl font-semibold text-white">{displayName || participantId}</h2>
                        <p className="text-xs text-neutral-500">Session #{idConfEvent}</p>
                    </div>
                    <Badge className={`${statusColor} text-neutral-900`}>{statusLabel[status]}</Badge>
                </div>

                <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
                    <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        autoPlay
                        playsInline
                        muted
                    />
                    {mediaError && (
                        <div className="absolute inset-0 backdrop-blur flex flex-col items-center justify-center text-center p-4 text-red-200 bg-black/60">
                            <AlertCircle className="w-12 h-12 mb-2" />
                            <p className="font-medium">{mediaError}</p>
                            <Button variant="outline" className="mt-4" onClick={requestLocalMedia}>
                                Réessayer
                            </Button>
                        </div>
                    )}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-neutral-400">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${socketState === 'connected' ? 'bg-emerald-500' : 'bg-neutral-600'}`} />
                        <span>Socket {socketState === 'connected' ? 'connecté' : 'déconnecté'}</span>
                    </div>
                    <div>
                        <span className="text-neutral-500">Écran ciblé :</span>{' '}
                        {pendingScreenId ? `#${pendingScreenId}` : 'Aucun'}
                    </div>
                    {message && <div className="text-amber-400">{message}</div>}
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                    <Button variant="secondary" onClick={toggleAudio} disabled={!mediaStream}>
                        {isAudioMuted ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                        {isAudioMuted ? 'Micro coupé' : 'Micro actif'}
                    </Button>
                    <Button variant="secondary" onClick={toggleVideo} disabled={!mediaStream}>
                        {isVideoMuted ? <CameraOff className="w-4 h-4 mr-2" /> : <Camera className="w-4 h-4 mr-2" />}
                        {isVideoMuted ? 'Caméra coupée' : 'Caméra active'}
                    </Button>
                    <Button variant="outline" onClick={requestLocalMedia}>
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Réinitialiser la caméra
                    </Button>
                    {status !== 'idle' && (
                        <Button variant="destructive" onClick={stopStreaming}>
                            Arrêter la diffusion
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
