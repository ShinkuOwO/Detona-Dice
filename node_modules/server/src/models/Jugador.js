class Jugador {
  constructor(id, nick) {
    this.id = id;
    this.nick = nick;
    this.listo = false; // se setea en cliente:marcar_listo
  }
}

module.exports = Jugador;
