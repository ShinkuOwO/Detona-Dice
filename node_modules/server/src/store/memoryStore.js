// Almacenamiento en memoria compartido por todos los módulos

const salas = new Map();      // codigoSala -> Sala
const jugadores = new Map();  // socketId  -> Jugador
const partidas = new Map();   // socketId  -> PartidaState

module.exports = {
  salas,
  jugadores,
  partidas,
};
