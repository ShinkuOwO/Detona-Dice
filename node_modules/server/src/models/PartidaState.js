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

  // Método para aplicar un efecto temporal
  aplicarEfecto(efecto) {
    this.efectos.push(efecto);
    efecto.aplicar(this);
  }

  // Método para limpiar efectos expirados
  limpiarEfectos() {
    this.efectos = this.efectos.filter(efecto => {
      if (efecto.turnos > 0) {
        efecto.turnos--;
        return true;
      }
      return false;
    });
  }

  // Método para aplicar modificadores
  aplicarModificador(nombre, valor) {
    if (!this.modificadores[nombre]) {
      this.modificadores[nombre] = 0;
    }
    this.modificadores[nombre] += valor;
  }

  // Método para obtener el valor de un modificador
  getModificador(nombre) {
    return this.modificadores[nombre] || 0;
  }

  // Método para aplicar una reliquia
  aplicarReliquia(reliquiaId) {
    this.reliquias.push(reliquiaId);
    // Aquí se aplicaría el efecto permanente de la reliquia
    switch(reliquiaId) {
      case 'reliquia_vida':
        this.hpMax += 5;
        this.hp += 5;
        break;
      case 'reliquia_energia':
        this.energiaMax += 1;
        break;
      case 'reliquia_oro':
        this.aplicarModificador('oro_bonus', 10);
        break;
    }
  }
}

module.exports = PartidaState;
