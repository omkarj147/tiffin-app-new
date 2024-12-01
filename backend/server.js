const app = require('./app');
const http = require('http');
const WebSocket = require('ws');

const server = http.createServer(app);
const wss = new WebSocket.Server({
    server,
    path: '/ws',
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

wss.on('connection', (ws) => {
    console.log('New WebSocket connection');
    
    // Send initial connection success message
    ws.send(JSON.stringify({ type: 'connection', status: 'connected' }));
    
    ws.on('message', (message) => {
        try {
            console.log('Received:', message.toString());
            // Echo the message back for testing
            ws.send(message.toString());
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });
    
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
    
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// Broadcast to all connected clients
wss.broadcast = function(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
};

// Add error handling for unhandled routes
app.use((req, res, next) => {
    console.log(`Route not found: ${req.method} ${req.url}`);
    res.status(404).json({ message: `Route ${req.url} not found` });
});

const PORT = process.env.PORT || 5002;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
