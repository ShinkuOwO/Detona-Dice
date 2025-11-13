class Sala {
  constructor(codigoSala, hostId) {
    this.codigoSala = codigoSala;
    this.hostId = hostId;
    this.jugadores = [];
    this.chat = [];
    this.estado = 'esperando'; // esperando, jugando, terminado
    this.carreras = [];
  }
}

module.exports = Sala;
