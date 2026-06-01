import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';

const PORT = 3001;
const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('DevPulse AI Real-Time WebSocket Server\n');
});

const wss = new WebSocketServer({ server });

// Map of connected client user details
// Key: WebSocket, Value: { userId, userName, lastSeen }
const clients = new Map();

wss.on('connection', (ws) => {
  console.log('New client connected to WS');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      
      switch (data.type) {
        case 'join':
          // Save client metadata
          clients.set(ws, {
            userId: data.userId,
            name: data.name,
            lastSeen: Date.now()
          });
          console.log(`User connected: ${data.name} (${data.userId})`);
          
          // Broadcast updated presence list
          broadcastPresenceList();
          break;

        case 'activity_update':
          // Broadcast state changes directly to all other clients
          console.log(`Activity broadcast received:`, data);
          broadcastToAll(data);
          break;

        case 'pong':
          // Heartbeat answer received
          const client = clients.get(ws);
          if (client) {
            client.lastSeen = Date.now();
          }
          break;

        default:
          console.log('Unknown message type received:', data.type);
      }
    } catch (err) {
      console.error('Error parsing client WS message:', err);
    }
  });

  ws.on('close', () => {
    const client = clients.get(ws);
    if (client) {
      console.log(`User disconnected: ${client.name}`);
      clients.delete(ws);
      broadcastPresenceList();
    }
  });
});

// Broadcasts list of active developer names
function broadcastPresenceList() {
  const seen = new Set();
  const activeUsers = [];

  for (const c of clients.values()) {
    if (c.userId && !seen.has(c.userId)) {
      seen.add(c.userId);
      activeUsers.push({
        userId: c.userId,
        name: c.name,
      });
    }
  }

  const msg = JSON.stringify({
    type: 'presence_list',
    users: activeUsers,
  });

  broadcastToAll(JSON.parse(msg));
}

// Broadcasts payload to all active connections
function broadcastToAll(payload) {
  const messageStr = JSON.stringify(payload);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageStr);
    }
  });
}

// Heartbeat checker interval (every 30 seconds)
setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      // Send ping, expect pong back
      ws.send(JSON.stringify({ type: 'ping' }));
    }
  });
}, 30000);

server.listen(PORT, () => {
  console.log(`DevPulse WebSocket Server running on port ${PORT}`);
});
