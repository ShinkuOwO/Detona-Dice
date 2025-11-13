import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "https://detona-dice.onrender.com";

// Instancia única del socket
export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket"], // Evitar long polling
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 500,           // 0.5s
  reconnectionDelayMax: 3000,       // 3s
  timeout: 10000,                   // 10s
});
