const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

const clients = new Set();

wss.on('connection', (ws) => {
  ws.id = Math.random().toString(36).substr(2, 9);
  clients.add(ws);

  console.log("Client connecté", ws.id);
  ws.send(JSON.stringify({ type: "server:welcome", id:ws.id }));

  broadcast({
    type: "server:newuser",
    id: ws.id
  }, ws);

  ws.on('message', (message) => {
    let data;

    try {
      data = JSON.parse(message);
    } catch (e) {
      console.log("JSON invalide");
      return;
    }

    data.id = ws.id;
    console.log("receive : ", data);

    broadcast(data, ws);

  });

  ws.on('close', () => {

    clients.delete(ws);

    console.log("Client déconnecté", ws.id);

    broadcast({
      type: "server:leave",
      id: ws.id
    });

  });
});

function broadcast(data, except = null) {

  const msg = JSON.stringify(data);

  clients.forEach(client => {

    if (client === except) return;

    if (client.readyState === WebSocket.OPEN) {
      console.log("send ", data.type, " to ", client.id);
      client.send(msg);
    }

  });

}

console.log("WebSocket server running on ws://localhost:8080");