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
