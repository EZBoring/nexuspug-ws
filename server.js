// server.js
import { WebSocketServer } from "ws";
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// ==== Servidor WebSocket ====
const wss = new WebSocketServer({ noServer: true });
let clients = [];

wss.on("connection", (ws) => {
  clients.push(ws);
  console.log("🔗 Nuevo cliente conectado (" + clients.length + " total)");

  ws.on("close", () => {
    clients = clients.filter((c) => c !== ws);
    console.log("❌ Cliente desconectado (" + clients.length + " total)");
  });
});

// ==== Endpoint HTTP para notificaciones desde PHP ====
app.post("/notify", (req, res) => {
  const data = req.body;
  console.log("📡 Notificación recibida:", data);

  // Enviar a todos los clientes WebSocket conectados
  clients.forEach((ws) => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(data));
    }
  });

  res.json({ success: true });
});

// ==== Servidor HTTP + WebSocket ====
const server = app.listen(8080, () => {
  console.log("🚀 Servidor WebSocket corriendo en puerto 8080");
});

server.on("upgrade", (req, socket, head) => {
  if (req.url === "/ws") {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  } else {
    socket.destroy();
  }
});
