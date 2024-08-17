const WebSocket = require('ws');
const port = 8000;
const host = '127.0.0.1';
const wss = new WebSocket.Server({ host, port });

const sessions = {}; // Stores active sessions and their clients

wss.on('connection', (ws, req) => {
    // Extract the unique session ID from the URL
    const urlSegments = req.url.split('/')
    const uniqueId = urlSegments[urlSegments.length -2];
console.log(req.url)
console.log({urlSegments})
    // If the session doesn't exist, create it
    if (!sessions[uniqueId]) {
        sessions[uniqueId] = [];
    }

    // Add the new client to the session
    sessions[uniqueId].push(ws);
    console.log(`Client connected to session: ${uniqueId}`);

    // Broadcast a message to all clients in the session when a new client joins
    /*
    sessions[uniqueId].forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'notification', message: `A new client has joined the session ${uniqueId}` }));
        }
    });
    */
    
    // When a message is received from a client
    ws.on('message', (res) => {
        console.log(`Received message from session ${uniqueId}`);
        let message = JSON.parse(res)
          console.log(message)
        // If message contains 'approval', broadcast it to all clients in the session
        if (message.type == 'approval') {
       
            sessions[uniqueId].forEach(client => {

                if (client.readyState === WebSocket.OPEN) {

                    client.send(JSON.stringify({ type: 'approval', message: 'Approval received' }));
                }
            });
        }
    });

    // Handle client disconnection
    ws.on('close', () => {
        console.log(`Client disconnected from session: ${uniqueId}`);
        sessions[uniqueId] = sessions[uniqueId].filter(client => client !== ws);

        // If no clients left in the session, remove the session
        if (sessions[uniqueId].length === 0) {
            delete sessions[uniqueId];
        }
    });
});

console.log(`WebSocket server is running on ws://${host}:${port}`);
