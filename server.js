// server.js
import express from "express";
import { WebSocketServer } from "ws";
import http from "http";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Middleware para recibir JSON desde PHP
app.use(express.json());

// Cuando un navegador se conecta
wss.on("connection", (ws) => {
  console.log("🟢 Cliente conectado");

  ws.on("close", () => {
    console.log("🔴 Cliente desconectado");
  });
});

// PHP enviará datos aquí cuando alguien entre/salga de la cola
app.post("/notify", (req, res) => {
  const data = req.body;
  console.log("📩 Notificación desde PHP:", data);

  // Reenvía el mensaje a todos los navegadores conectados
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(data));
    }
  });

  res.sendStatus(200);
});

server.listen(8080, () => {
  console.log("🚀 Servidor NexusPug WebSocket corriendo en puerto 8080");
});
