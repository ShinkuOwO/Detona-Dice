class PartidaState {
  constructor() {
    // --- lo que ya tenías ---
    this.piso = 1;
    this.hp = 20;
    this.hpMax = 20;
    this.oro = 20;
    this.energia = 3;
    this.energiaMax = 3;
    this.dadosLanzados = false;

    this.estadoJuego = 'combate'; // combate, subiendo_nivel, evento_pacto, tienda, mapa, eliminado
    this.nivel = 1;
    this.xp = 0;
    this.xpParaNivel = 100;

    this.dadosBase = [
      { id: 'd1', valor: null, esCorrupto: false },
      { id: 'd2', valor: null, esCorrupto: false },
    ];
    this.dadosCorrupcion = [];

    // ya existían o las mantienes:
    this.reliquias = [];
    this.pactosHechos = [];
    this.habilidadesActivas = [];

    this.mapaActual = null;
    this.encuentroActual = null;

    this.opcionesMejora = [];
    this.opcionesPacto = [];

    this.puntuacion = 100;
    this.objetivoEncuentro = 5;
    this.historial = [];
    this.efectos = [];
    this.pactos = [];
    this.mensaje = '¡Bienvenido a Detona Dice!';

    // --- NUEVO: tienda / items ---
    this.tiendaActual = null;    // { piso, tipo, items: [...] }
    this.consumibles = [];  // ids de ítems consumibles
    this.modificadores = {};     
    // this.reliquias ya existe y se reutiliza
  }
}

module.exports = PartidaState;
