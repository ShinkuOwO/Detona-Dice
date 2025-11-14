const { salas, jugadores, partidas, usuarios } = require('../store/memoryStore');
const Jugador = require('../models/Jugador');
const Sala = require('../models/Sala');
const PartidaState = require('../models/PartidaState');
const Usuario = require('../models/Usuario');
const { generarEncuentro } = require('../game/map');

function findSalaBySocketId(socketId) {
  return [...salas.values()].find((s) => s.jugadores.some((j) => j.id === socketId));
}

function registerLobbyHandlers(io, socket) {
  // Crear sala
  socket.on('cliente:crear_sala', ({ nick }) => {
    // Crear o recuperar usuario
    let usuario = usuarios.get(socket.id);
    if (!usuario) {
      usuario = new Usuario(socket.id, nick);
      usuarios.set(socket.id, usuario);
    }

    const jugador = new Jugador(socket.id, nick);
    jugadores.set(socket.id, jugador);

    let codigoSala;
    do {
      codigoSala = Math.random().toString(36).substring(2, 8).toUpperCase();
    } while (salas.has(codigoSala));

    const sala = new Sala(codigoSala, socket.id);
    sala.jugadores.push(jugador);
    salas.set(codigoSala, sala);

    socket.join(codigoSala);
    socket.emit('servidor:sala_actualizada', { sala });
    console.log(`Sala creada: ${codigoSala} por ${nick}`);
  });

  // Unirse a sala
  socket.on('cliente:unirse_sala', ({ nick, codigoSala }) => {
    if (!salas.has(codigoSala)) {
      return socket.emit('servidor:error', { mensaje: 'Código de sala no encontrado' });
    }

    const sala = salas.get(codigoSala);
    if (sala.estado !== 'esperando') {
      return socket.emit('servidor:error', { mensaje: 'La sala ya está en juego' });
    }

    if (sala.jugadores.some((j) => j.id === socket.id)) {
      return socket.emit('servidor:error', { mensaje: 'Ya estás en esta sala' });
    }

    // Crear o recuperar usuario
    let usuario = usuarios.get(socket.id);
    if (!usuario) {
      usuario = new Usuario(socket.id, nick);
      usuarios.set(socket.id, usuario);
    }

    const jugador = new Jugador(socket.id, nick);
    jugadores.set(socket.id, jugador);
    sala.jugadores.push(jugador);
    socket.join(codigoSala);

    io.to(codigoSala).emit('servidor:sala_actualizada', { sala });
    console.log(`${nick} se unió a la sala ${codigoSala}`);
  });

  // Chat
  socket.on('cliente:enviar_chat', ({ mensaje }) => {
    const jugador = jugadores.get(socket.id);
    if (!jugador) {
      return socket.emit('servidor:error', { mensaje: 'No estás autenticado' });
    }

    const sala = findSalaBySocketId(socket.id);
    if (!sala) {
      return socket.emit('servidor:error', { mensaje: 'No estás en ninguna sala' });
    }

    const mensajeChat = {
      id: socket.id,
      nick: jugador.nick,
      mensaje,
      timestamp: Date.now(),
    };

    sala.chat.push(mensajeChat);
    if (sala.chat.length > 50) sala.chat.shift();

    io.to(sala.codigoSala).emit('servidor:nuevo_chat', { mensaje: mensajeChat });
  });

  // Marcar listo
  socket.on('cliente:marcar_listo', ({ estaListo }) => {
    const jugador = jugadores.get(socket.id);
    if (!jugador) {
      return socket.emit('servidor:error', { mensaje: 'No estás autenticado' });
    }

    const sala = findSalaBySocketId(socket.id);
    if (!sala) {
      return socket.emit('servidor:error', { mensaje: 'No estás en ninguna sala' });
    }

    const jugadorSala = sala.jugadores.find((j) => j.id === socket.id);
    if (jugadorSala) {
      jugadorSala.listo = estaListo;
    }

    io.to(sala.codigoSala).emit('servidor:sala_actualizada', { sala });
  });

  // Iniciar partida
  socket.on('cliente:iniciar_partida', () => {
    const jugador = jugadores.get(socket.id);
    if (!jugador) {
      return socket.emit('servidor:error', { mensaje: 'No estás autenticado' });
    }

    const sala = findSalaBySocketId(socket.id);
    if (!sala) {
      return socket.emit('servidor:error', { mensaje: 'No estás en ninguna sala' });
    }

    if (sala.hostId !== socket.id) {
      return socket.emit('servidor:error', { mensaje: 'Solo el host puede iniciar' });
    }

    // Comprobar listos (excepto host)
    const otrosJugadores = sala.jugadores.filter((j) => j.id !== socket.id);
    const todosListos = otrosJugadores.every((j) => j.listo);

    if (sala.jugadores.length > 1 && !todosListos) {
      return socket.emit('servidor:error', { mensaje: 'No todos los jugadores están listos' });
    }

    sala.estado = 'jugando';
    sala.carreras = sala.jugadores.map((j) => ({
      jugadorId: j.id,
      nick: j.nick,
      piso: 1,
      hp: 20,
      estado: 'vivo',
    }));

    sala.jugadores.forEach((j) => {
      const nuevaPartida = new PartidaState();
      nuevaPartida.encuentroActual = generarEncuentro(1);
      nuevaPartida.objetivoEncuentro = nuevaPartida.encuentroActual.objetivo;
      partidas.set(j.id, nuevaPartida);

      io.to(j.id).emit('servidor:partida_actualizada', { partidaState: nuevaPartida });
    });

    io.to(sala.codigoSala).emit('servidor:carrera_iniciada', { carreras: sala.carreras });
  });

  // Volver al lobby
  socket.on('cliente:volver_al_lobby', () => {
    const jugador = jugadores.get(socket.id);
    if (!jugador) {
      return socket.emit('servidor:error', { mensaje: 'No estás autenticado' });
    }

    const sala = findSalaBySocketId(socket.id);
    if (!sala) {
      return socket.emit('servidor:error', { mensaje: 'No estás en ninguna sala' });
    }

    sala.estado = 'esperando';
    delete sala.carreras;

    sala.jugadores.forEach((j) => {
      j.listo = false;
      partidas.delete(j.id);
    });

    io.to(sala.codigoSala).emit('servidor:sala_actualizada', { sala });
  });

  // Desconexión
  socket.on('disconnect', () => {
    const jugadorId = socket.id;
    partidas.delete(jugadorId);
    jugadores.delete(jugadorId);

    for (const [codigo, sala] of salas) {
      const index = sala.jugadores.findIndex((j) => j.id === jugadorId);
      if (index !== -1) {
        const nickDesconectado = sala.jugadores[index].nick;
        sala.jugadores.splice(index, 1);

        if (sala.carreras) {
          const carreraIndex = sala.carreras.findIndex((c) => c.jugadorId === jugadorId);
          if (carreraIndex !== -1) {
            sala.carreras[carreraIndex].estado = 'eliminado';
            io.to(codigo).emit('servidor:jugador_eliminado', {
              jugadorId,
              nick: nickDesconectado,
            });
          }
        }

        if (sala.jugadores.length === 0) {
          salas.delete(codigo);
        } else {
          if (sala.hostId === jugadorId) {
            sala.hostId = sala.jugadores[0].id;
          }
          io.to(codigo).emit('servidor:sala_actualizada', { sala });
        }
      }
    }
  });
}

module.exports = registerLobbyHandlers;
