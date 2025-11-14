// src/index.js
// Entry point del backend Detona Dice (servidor autoritativo)

const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

// Importa el registrador de handlers de sockets
const registerSocketHandlers = require('./sockets');

const app = express();
const server = http.createServer(app);

// === CONFIG BÁSICA DE DESPLIEGUE ===
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
// en local usas '*', en Render pondremos la URL de Vercel

// Socket.io con CORS controlado por env
const io = new Server(server, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST'],
  },
});

// Middlewares HTTP con el mismo origen
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ mensaje: 'Servidor Detona Dice funcionando' });
});

// Conexiones Socket.io
io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);
  registerSocketHandlers(io, socket);
});

// Iniciar servidor HTTP
server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
