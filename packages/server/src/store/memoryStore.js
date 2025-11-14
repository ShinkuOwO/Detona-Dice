// Almacenamiento en memoria compartido por todos los módulos

const salas = new Map();      // codigoSala -> Sala
const jugadores = new Map();  // socketId  -> Jugador
const partidas = new Map();   // socketId  -> PartidaState
const usuarios = new Map();   // userId -> Usuario

module.exports = {
  salas,
  jugadores,
  partidas,
  usuarios,
};
