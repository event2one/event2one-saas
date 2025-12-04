'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';

const ICE_SERVERS: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
];

type ScreenStatus = 'idle' | 'awaiting' | 'connecting' | 'playing' | 'error';

export default function ScreenPage() {
    const params = useParams();
    const screenId = params?.id as string;

    const [iframeSrc, setIframeSrc] = useState('');
    const [status, setStatus] = useState<ScreenStatus>('idle');
    const [activeParticipant, setActiveParticipant] = useState<string | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

    const socketRef = useRef<Socket | null>(null);
    const peerRef = useRef<RTCPeerConnection | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const remoteStreamRef = useRef<MediaStream | null>(null);

    const attachRemoteStream = useCallback((stream: MediaStream | null) => {
        console.log('[SCREEN] attachRemoteStream called with stream:', !!stream, 'videoRef:', !!videoRef.current);
        remoteStreamRef.current = stream;
        setRemoteStream(stream);
        if (videoRef.current) {
            console.log('[SCREEN] Assigning stream to video element');
            videoRef.current.srcObject = stream;
            if (stream) {
                console.log('[SCREEN] Attempting to play video');
                const playPromise = videoRef.current.play();
                if (playPromise && typeof playPromise.then === 'function') {
                    playPromise.then(() => {
                        console.log('[SCREEN] Video playing successfully');
                    }).catch((error) => {
                        console.error('[SCREEN] Autoplay failed:', error);
                    });
                }
            }
        } else {
            console.log('[SCREEN] Cleanup: videoRef not available');
        }
    }, []);

    const cleanupPeer = useCallback(() => {
        if (peerRef.current) {
            peerRef.current.ontrack = null;
            peerRef.current.onicecandidate = null;
            peerRef.current.onconnectionstatechange = null;
            peerRef.current.close();
            peerRef.current = null;
        }
        attachRemoteStream(null);
    }, [attachRemoteStream]);

    const handleIframeUpdate = useCallback((data: { screenId: string; iframeSrc: string }) => {
        if (data.screenId !== screenId) return;
        let src = data.iframeSrc;
        const isDev = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        if (isDev && src.includes('event2one.com')) {
            src = `/saas/api/proxy?url=${encodeURIComponent(src)}`;
        }
        setIframeSrc(src);
    }, [screenId]);

    const createPeerConnection = useCallback((participantId: string) => {
        if (peerRef.current) {
            peerRef.current.close();
        }
        const peer = new RTCPeerConnection({ iceServers: ICE_SERVERS });
        peerRef.current = peer;
        peer.ontrack = (event) => {
            console.log('[SCREEN] ontrack event received', event.track.kind, event.track.id);
            let stream = event.streams?.[0] || null;
            console.log('[SCREEN] Stream from event:', !!stream, 'Streams count:', event.streams?.length);
            if (!stream) {
                if (!remoteStreamRef.current) {
                    remoteStreamRef.current = new MediaStream();
                    console.log('[SCREEN] Created new MediaStream');
                }
                // Safari sometimes omits event.streams, so rebuild the stream manually
                remoteStreamRef.current.addTrack(event.track);
                stream = remoteStreamRef.current;
                console.log('[SCREEN] Added track to manual stream');
            }
            if (stream) {
                console.log('[SCREEN] Attaching stream with tracks:', stream.getTracks().map(t => t.kind));
                attachRemoteStream(stream);
                setStatus('playing');
            }
        };
        peer.onicecandidate = (event) => {
            if (event.candidate && socketRef.current) {
                socketRef.current.emit('webrtc:ice-candidate', {
                    target: 'participant',
                    participantId,
                    screenId,
                    candidate: event.candidate,
                });
            }
        };
        peer.onconnectionstatechange = () => {
            if (peer.connectionState === 'failed' || peer.connectionState === 'disconnected') {
                cleanupPeer();
                setStatus('error');
            }
        };
        return peer;
    }, [cleanupPeer, screenId]);

    // Assign stream to video element when remoteStream changes
    useEffect(() => {
        if (videoRef.current && remoteStream) {
            console.log('[SCREEN] useEffect: Assigning stream to video element');
            videoRef.current.srcObject = remoteStream;
            const playPromise = videoRef.current.play();
            if (playPromise && typeof playPromise.then === 'function') {
                playPromise.then(() => {
                    console.log('[SCREEN] useEffect: Video playing successfully');
                }).catch((error) => {
                    console.error('[SCREEN] useEffect: Autoplay failed:', error);
                });
            }
        } else if (videoRef.current && !remoteStream) {
            console.log('[SCREEN] useEffect: Clearing video element');
            videoRef.current.srcObject = null;
        }
    }, [remoteStream]);

    useEffect(() => {
        if (!screenId) return;
        const socketUrl = typeof window !== 'undefined' ? window.location.origin : '';
        socketRef.current = io(socketUrl, {
            path: '/saas/socket.io',
            transports: ['websocket', 'polling'],
        });
        const socket = socketRef.current;

        const room = `room${screenId}`;
        socket.emit('room', room);
        socket.emit('screen:join', { screenId });

        socket.on('updateMediaContainer', handleIframeUpdate);

        socket.on('screen:await-stream', ({ participantId }: { participantId: string }) => {
            setActiveParticipant(participantId);
            setStatus('awaiting');
            cleanupPeer();
        });

        socket.on('screen:stop-stream', () => {
            setStatus('idle');
            setActiveParticipant(null);
            cleanupPeer();
        });

        socket.on('webrtc:offer', async ({ participantId, sdp }: { participantId: string; sdp: RTCSessionDescriptionInit }) => {
            console.log('[SCREEN] Received WebRTC offer from participant:', participantId);
            if (!participantId || !sdp) {
                console.error('[SCREEN] Missing participantId or sdp');
                return;
            }
            setActiveParticipant(participantId);
            setStatus('connecting');
            try {
                console.log('[SCREEN] Setting remote description');
                const peer = createPeerConnection(participantId);
                await peer.setRemoteDescription(new RTCSessionDescription(sdp));
                console.log('[SCREEN] Creating answer');
                const answer = await peer.createAnswer();
                await peer.setLocalDescription(answer);
                console.log('[SCREEN] Sending answer to participant, socket connected:', socket.connected);
                if (!socket.connected) {
                    console.error('[SCREEN] Socket not connected, cannot send answer');
                    return;
                }
                socket.emit('webrtc:answer', { participantId, screenId, sdp: answer });
                console.log('[SCREEN] Answer emitted successfully');
            } catch (error) {
                console.error('[SCREEN] Erreur lors du traitement de l\'offre WebRTC:', error);
                setStatus('error');
            }
        });

        socket.on('webrtc:ice-candidate', async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
            if (candidate && peerRef.current) {
                try {
                    await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (error) {
                    console.error('Erreur lors de l\'ajout du candidat ICE (screen):', error);
                }
            }
        });

        return () => {
            socket.disconnect();
            cleanupPeer();
        };
    }, [screenId, handleIframeUpdate, createPeerConnection, cleanupPeer]);

    return (
        <div className="relative w-screen h-screen bg-black overflow-hidden">
            {remoteStream ? (
                <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    controls={false}
                    muted
                />
            ) : iframeSrc ? (
                <iframe
                    src={iframeSrc}
                    className="w-full h-full border-0"
                    title={`Screen ${screenId}`}
                    allow="autoplay; fullscreen"
                />
            ) : (
                <div className="flex items-center justify-center w-full h-full text-white text-2xl">
                    Screen {screenId} - Waiting for content...
                </div>
            )}

            <div className="absolute bottom-4 left-4 bg-black/50 text-white px-4 py-2 rounded-full text-sm flex items-center gap-3">
                <span className="uppercase tracking-wide text-xs text-neutral-400">Status</span>
                <span className="font-semibold">{status}</span>
                {activeParticipant && <span>Participant: {activeParticipant}</span>}
            </div>
        </div>
    );
}
