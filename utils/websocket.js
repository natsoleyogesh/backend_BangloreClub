const { Server } = require('socket.io');

let io;

const initWebSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: ["http://localhost:3000", '*'], // Allow all origins in development
            methods: ['GET', 'POST'], // Adjust for your app
        },
    });

    // Handle WebSocket connections
    io.on('connection', (socket) => {
        console.log('A client connected:', socket.id);

        // Cleanup on disconnect
        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    return io;
};

const emitEvent = (event, data) => {
    if (io) {
        io.emit(event, data); // Emit the event to all connected clients
    } else {
        console.error('WebSocket not initialized. Call initWebSocket first.');
    }
};

module.exports = { initWebSocket, emitEvent };
