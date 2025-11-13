// src/sockets/index.js

const registerLobbyHandlers = require('./lobbyHandlers');
const registerGameHandlers = require('./gameHandlers');

module.exports = function registerSocketHandlers(io, socket) {
  // Todo lo que sea lobby / salas / chat
  registerLobbyHandlers(io, socket);

  // Todo lo que sea lógica de partida
  registerGameHandlers(io, socket);
};
