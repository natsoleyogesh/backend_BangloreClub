const { Server } = require('socket.io');

let io;
let isDevelopment = true;

const initWebSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: isDevelopment ? "*" : ["https://your-production-domain.com"],
            methods: ['GET', 'POST'], // Adjust for your app
            credentials: true, // Allow credentials if needed
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
