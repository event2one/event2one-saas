const { createServer: createHttpServer } = require('http');
const { createServer: createHttpsServer } = require('https');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const fs = require('fs');
require('dotenv').config();

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3002;

// Initialize Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Note: Database connection and API helpers are now in src/lib/db.ts
// They are used by Next.js API routes, not directly in this server file

app.prepare().then(() => {
    let server;
    try {
        // Try to load SSL certificates
        const cert = fs.readFileSync("/etc/ssl/www.event2one.com/autres-formats/www.event2one.com.pem");
        const key = fs.readFileSync("/etc/ssl/www.event2one.com/www.event2one.com.key");
        const options = { key, cert };

        server = createHttpsServer(options, async (req, res) => {
            try {
                const parsedUrl = parse(req.url, true);
                await handle(req, res, parsedUrl);
            } catch (err) {
                console.error('Error occurred handling', req.url, err);
                res.statusCode = 500;
                res.end('internal server error');
            }
        });
        console.log("SSL certificates found. Starting HTTPS server.");
    } catch (e) {
        console.log("SSL certificates not found. Starting HTTP server.");
        server = createHttpServer(async (req, res) => {
            try {
                const parsedUrl = parse(req.url, true);
                await handle(req, res, parsedUrl);
            } catch (err) {
                console.error('Error occurred handling', req.url, err);
                res.statusCode = 500;
                res.end('internal server error');
            }
        });
    }

    // Socket.IO setup
    const io = new Server(server, {
        path: '/saas/socket.io',
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    const participants = new Map();
    const screens = new Map();

    const emitParticipantList = (idConfEvent) => {
        if (!idConfEvent) return;
        const room = `admin-event-${idConfEvent}`;
        const list = Array.from(participants.values())
            .filter((participant) => participant.idConfEvent === idConfEvent)
            .map(({ participantId, displayName, status, currentScreenId, lastRequestAt }) => ({
                participantId,
                displayName,
                status,
                currentScreenId: currentScreenId || null,
                lastRequestAt: lastRequestAt || null
            }));
        console.log(`[EMIT LIST] Sending ${list.length} participants to room ${room}:`, list.map(p => `${p.displayName}(${p.status})`));
        io.to(room).emit('admin:participant-list', list);
    };

    const cleanupSocket = (socket) => {
        if (socket?.data?.role === 'participant' && socket.data.participantId) {
            const stored = participants.get(socket.data.participantId);
            if (stored && stored.socketId === socket.id) {
                participants.delete(socket.data.participantId);
                emitParticipantList(socket.data.idConfEvent);
            }
        }

        if (socket?.data?.role === 'screen' && socket.data.screenId) {
            const stored = screens.get(socket.data.screenId);
            if (stored && stored.socketId === socket.id) {
                screens.delete(socket.data.screenId);
            }
        }
    };

    io.on('connection', function (socket) {
        console.log('a user is connected');

        socket.broadcast.emit('check_connexion', (data) => data);

        socket.on('check_connexion', function (data) {
            io.emit('check_connexion', data);
            console.log('message recu' + data);
        });

        // Admin joins event-specific room for notifications
        socket.on('admin:join-event', function (data) {
            const room = `admin-event-${data.ije}`;
            socket.join(room);
            console.log(`[ADMIN] Joined room: ${room} (ije: ${data.ije})`);
            socket.emit('admin:joined', { room });
            emitParticipantList(data.ije);
        });

        socket.on('participant:join', function (payload = {}) {
            const { participantId, displayName, idConfEvent } = payload;
            console.log('[PARTICIPANT JOIN] Received:', { participantId, displayName, idConfEvent });
            if (!participantId || !idConfEvent) {
                console.warn('participant:join missing identifiers');
                return;
            }
            socket.data.role = 'participant';
            socket.data.participantId = participantId;
            // Convert idConfEvent to number to ensure type consistency
            const confEventId = typeof idConfEvent === 'string' ? parseInt(idConfEvent, 10) : idConfEvent;
            socket.data.idConfEvent = confEventId;

            participants.set(participantId, {
                participantId,
                displayName: displayName || 'Participant',
                idConfEvent: confEventId,
                socketId: socket.id,
                status: 'idle',
                currentScreenId: null,
                lastRequestAt: null
            });

            socket.join(`event-${confEventId}`);
            console.log(`[PARTICIPANT] ${participantId} joined conf event ${confEventId}, total participants: ${participants.size}`);
            emitParticipantList(confEventId);
        });

        socket.on('participant:leave', function () {
            cleanupSocket(socket);
        });

        socket.on('screen:join', function (payload = {}) {
            const { screenId, idConfEvent } = payload;
            console.log('[SCREEN JOIN] Received:', { screenId, idConfEvent });
            if (!screenId) {
                console.warn('screen:join missing screenId');
                return;
            }
            socket.data.role = 'screen';
            socket.data.screenId = screenId;
            socket.data.idConfEvent = idConfEvent;

            // Join rooms for broadcasting
            const legacyRoom = `room${screenId}`;
            const screenRoom = `screen-${screenId}`;
            socket.join(legacyRoom);
            socket.join(screenRoom);
            console.log(`[SCREEN] Socket ${socket.id} joined rooms: ${legacyRoom}, ${screenRoom}`);

            // Keep track of at least one socket for validation (optional but good for admin feedback)
            screens.set(screenId, {
                screenId,
                idConfEvent: idConfEvent || null,
                socketId: socket.id
            });
        });

        socket.on('admin:assign-stream', function (payload = {}) {
            const { participantId, screenId, idConfEvent } = payload;
            console.log('[ADMIN ASSIGN] Received:', { participantId, screenId, idConfEvent });
            if (!participantId || !screenId) {
                console.warn('admin:assign-stream missing identifiers');
                return;
            }
            const participant = participants.get(participantId);
            // We don't strictly need to check screens map if we trust the room exists, 
            // but checking if at least one screen is registered is good practice.
            const screen = screens.get(screenId);

            console.log('[ADMIN ASSIGN] Participant found:', !!participant, 'Screen found:', !!screen);
            if (!participant) {
                console.warn(`Participant ${participantId} not registered. Available:`, Array.from(participants.keys()));
                return;
            }

            // Even if 'screen' is just the last one, we broadcast to the room.
            // If no screen is in the map, maybe no one is connected, but we can still try emitting to room.

            participant.status = 'requested';
            participant.currentScreenId = screenId;
            participant.lastRequestAt = Date.now();
            participants.set(participantId, participant);

            console.log(`[ASSIGN] Participant ${participantId} -> Screen ${screenId} (Room: screen-${screenId})`);
            emitParticipantList(idConfEvent || participant.idConfEvent);

            // Broadcast to ALL screens in the room
            io.to(`screen-${screenId}`).emit('screen:await-stream', { participantId });

            // Notify participant
            io.to(participant.socketId).emit('participant:start-stream', {
                screenId,
                screenSocketId: null // No longer relevant as we have multiple screens
            });
        });

        socket.on('admin:stop-stream', function (payload = {}) {
            const { participantId, screenId, idConfEvent } = payload;
            if (!participantId && !screenId) return;
            const participant = participantId ? participants.get(participantId) : null;
            const screen = screenId ? screens.get(screenId) : null;

            if (participant) {
                participant.status = 'idle';
                participant.currentScreenId = null;
                participants.set(participant.participantId, participant);
                io.to(participant.socketId).emit('participant:stop-stream', { screenId });
            }
            if (screen) {
                io.to(screen.socketId).emit('screen:stop-stream', { participantId });
            }

            emitParticipantList(idConfEvent || participant?.idConfEvent);
        });

        socket.on('participant:stop-stream', function (payload = {}) {
            const participantId = socket.data?.participantId || payload.participantId;
            const { screenId } = payload;
            if (!participantId) return;
            const participant = participants.get(participantId);
            if (participant) {
                participant.status = 'idle';
                participant.currentScreenId = null;
                participants.set(participantId, participant);
            }
            if (screenId) {
                const screen = screens.get(screenId);
                if (screen) {
                    io.to(screen.socketId).emit('screen:stop-stream', { participantId });
                }
            }
            emitParticipantList(participant?.idConfEvent || socket.data?.idConfEvent);
        });

        // Screen viewer requests stream from participant
        socket.on('screen:request-stream', function (payload = {}) {
            const { participantId, viewerId, screenId } = payload;
            console.log('[SCREEN REQUEST] Viewer', viewerId, 'requesting stream from participant:', participantId);
            if (!participantId || !viewerId) {
                console.warn('screen:request-stream missing identifiers');
                return;
            }
            const participant = participants.get(participantId);
            if (!participant) {
                console.warn(`Participant ${participantId} not found for screen request`);
                return;
            }
            // Notify participant that this specific viewer wants a stream
            console.log('[SCREEN REQUEST] Routing to participant:', participant.socketId);
            io.to(participant.socketId).emit('participant:viewer-ready', {
                viewerId,
                screenId
            });
        });

        socket.on('webrtc:offer', function (payload = {}) {
            const { participantId, viewerId, sdp } = payload;
            console.log('[WEBRTC OFFER] Received from participant:', participantId, 'for viewer:', viewerId);
            if (!participantId || !viewerId || !sdp) {
                console.warn('[WEBRTC OFFER] Missing data:', { participantId, viewerId, hasSdp: !!sdp });
                return;
            }
            // Send offer to specific viewer
            console.log('[WEBRTC OFFER] Routing to viewer socket:', viewerId);
            io.to(viewerId).emit('webrtc:offer', { participantId, sdp });
        });

        socket.on('webrtc:answer', function (payload = {}) {
            const { participantId, viewerId, sdp } = payload;
            console.log('[WEBRTC ANSWER] Received from viewer:', viewerId, 'to participant:', participantId);
            if (!participantId || !viewerId || !sdp) {
                console.warn('[WEBRTC ANSWER] Missing data:', { participantId, viewerId, hasSdp: !!sdp });
                return;
            }
            const participant = participants.get(participantId);
            if (!participant) {
                console.warn('[WEBRTC ANSWER] Participant not found:', participantId, 'Available:', Array.from(participants.keys()));
                return;
            }
            participant.status = 'streaming';
            participants.set(participantId, participant);
            console.log('[WEBRTC ANSWER] Routing to participant socket:', participant.socketId);
            io.to(participant.socketId).emit('webrtc:answer', { viewerId, sdp });
            emitParticipantList(participant.idConfEvent);
        });

        socket.on('webrtc:ice-candidate', function (payload = {}) {
            const { target, participantId, viewerId, candidate } = payload;
            if (!candidate) return;
            if (target === 'screen' && viewerId) {
                // Send to specific viewer
                io.to(viewerId).emit('webrtc:ice-candidate', { participantId, candidate });
                return;
            }
            if (target === 'participant' && participantId) {
                const participant = participants.get(participantId);
                if (participant) io.to(participant.socketId).emit('webrtc:ice-candidate', { viewerId, candidate });
            }
        });

        // Voting user connected - notify admin
        socket.on('voting:user-connected', function (data) {
            const room = `admin-event-${data.ije}`;
            const notification = {
                id: `${Date.now()}-${Math.random()}`,
                name: `${data.contactDatas.prenom} ${data.contactDatas.nom}`,
                company: data.contactDatas.societe,
                email: data.contactDatas.mail,
                timestamp: Date.now(),
                ije: data.ije
            };
            console.log(`[VOTING] User connected: ${notification.name} (${notification.company})`);
            console.log(`[VOTING] Emitting to room: ${room} (ije: ${data.ije})`);
            io.to(room).emit('admin:user-connected', notification);
        });

        // New vote or connection request - notify admin to refresh stats
        socket.on('voting:new-vote', function (data) {
            const room = `admin-event-${data.ije}`;
            console.log(`[VOTING] New vote/update from user in event ${data.ije}`);
            // Broadcast to admin room to trigger data refresh
            io.to(room).emit('admin:vote-updated', data);
        });

        socket.on('updateMediaContainer', function (data) {
            const room = `room${data.screenId}`;
            io.sockets.in(room).emit('updateMediaContainer', data);
            console.log(room + "\t" + ' MediaContainer : ' + data.iframeSrc);
        });

        socket.on('dire_bonjour', function (data) {
            console.log(data);
        });

        socket.on("message", function (data) {
            console.log("received: %s", data);
            io.emit('message', data);
        });

        socket.on('room', function (room) {
            socket.join(room);
            console.log("room", room);
            io.emit('message', room);
            io.sockets.in(room).emit('message', 'Direct messenger' + room);
        });

        socket.on('privateMessage', function (data) {
            console.log('Admin demande update de ' + data.screenId);
            const room = "room" + data.screenId + "\n";
            socket.broadcast.emit('check_connexion', { screenId: data.screenId });
            io.sockets.in(room).emit('message', `Private messenger ${data.screenId} ${data.message} WTF!!!`);
            socket.broadcast.emit('message', 'weshalors les gens');
        });
        socket.on('disconnect', function () {
            cleanupSocket(socket);
        });
    });

    // Make io accessible to API routes
    server.io = io;

    server
        .once('error', (err) => {
            console.error(err);
            process.exit(1);
        })
        .listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`);
        });
});
