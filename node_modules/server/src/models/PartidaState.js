const { generarMapa } = require('../game/map');

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

    // Tipos de estados de juego segun especificación
    // 'combate' | 'subiendo_nivel' | 'evento_pacto' | 'tienda' | 'mapa' | 'eliminado'
    // Ajustando para que coincida con la especificación: 'combate' | 'subir_nivel' | 'pacto' | 'tienda' | 'mapa' | 'fin_partida'
    this.estadoJuego = 'mapa'; // Cambiado a 'mapa' para que coincida con el inicio de la partida
    this.nivel = 1;
    this.xp = 0;
    this.xpParaNivel = 100;

    this.dadosBase = [];
    this.dadosCorrupcion = [];
    
    // Inicializar dados base en el constructor
    const { crearDadoBase } = require('../game/dice');
    this.dadosBase = [crearDadoBase('d1'), crearDadoBase('d2')];

    // ya existían o las mantienes:
    this.reliquias = [];
    this.pactosHechos = [];
    this.habilidadesActivas = [];

    this.mapaActual = generarMapa(this.piso);
    this.encuentroActual = null;

    this.opcionesMejora = [];
    this.opcionesPacto = [];

    this.puntuacion = 100;
    this.objetivoEncuentro = 5;
    this.historial = [];
    this.efectos = [];
    this.pactos = [];
    this.mensaje = 'Bienvenido a Detona Dice!';

    // --- NUEVO: tienda / items ---
    this.tiendaActual = null;    // { piso, tipo, items: [...] }
    this.consumibles = [];  // ids de ítems consumibles
    this.modificadores = {};     
    // this.reliquias ya existe y se reutiliza

    // --- NUEVO: Sistema de pactos con lógica ---
    this.pactosActivos = [];                           // IDs de pactos
    this.modsPactos = this.crearModsPactosIniciales(); // derivados
    this.estadoPactos = {};                            // runtime por pacto
  }

  // Crear la estructura inicial de modificadores de pactos
  crearModsPactosIniciales() {
    return {
      bonusLanzamientoPlano: 0,      // ej. +2 a todos los dados
      bonusSumaFinal: 0,             // ej. +3 a la suma al evaluar objetivo
      energiaMaxExtra: 0,            // ej. +1 energía máx de pactos
      hpMaxMultiplicador: 1,         // ej. 0.6 para -40% HP máx
      oroExtraPorPiso: 0,            // ej. +10 oro por piso
      corrupcionExtraPorPiso: 0,     // ej. +1 corr por piso
      seleccionDadosBaseExtra: 0,    // ej. +1 dado seleccionable
      reduceCostoVoltear: 0,         // ej. -1 energía de coste
      reduceCostoRelanzar: 0,        // ej. -1 energía de coste
      objetivoDelta: 0,              // ej. -2 al objetivo del encuentro
      criticoDesdeValor: null,       // ej. 4 → 4+ es crítico
      // flags
      seleccionarSiempre3: false,
      noPuedeRelanzar: false,
      deshabilitarAumentar: false,
      deshabilitarVoltear: false,
    };
  }

  // Inicializar estado runtime para un pacto específico
  inicializarEstadoPacto(pactoId) {
      this.estadoPactos[pactoId] = {
        combatesCompletados: 0,
        revivirUsado: false,
        relanzarUsadoEsteCombate: false,
      };
  }

  // Recalcular modificadores de pactos basados en los pactos activos
  recalcularModsPactos() {
    const nuevosMods = this.crearModsPactosIniciales();

    for (const pactoId of this.pactosActivos) {
      // Aquí se aplicarían las funciones de modificación de cada pacto
      // Temporalmente aplicamos lógica básica basada en el ID del pacto
      switch(pactoId) {
        case 'pacto_vidente':
          nuevosMods.bonusLanzamientoPlano += 2;
          break;
        case 'pacto_avaricia':
          nuevosMods.oroExtraPorPiso += 10;
          nuevosMods.corrupcionExtraPorPiso += 1;
          break;
        case 'pacto_titan':
          nuevosMods.energiaMaxExtra += 1;
          break;
        case 'pacto_abismo':
          nuevosMods.bonusSumaFinal += 3;
          break;
        case 'pacto_mentiroso':
          nuevosMods.seleccionarSiempre3 = true;
          break;
        case 'pacto_cruel':
          nuevosMods.reduceCostoRelanzar += 99; // truco para que quede en 0
          break;
        case 'pacto_destino_invertido':
          nuevosMods.reduceCostoVoltear += 1; // Voltear cuesta 1 en lugar de 2 (reduce en 1)
          break;
        case 'pacto_faro_oscuro':
          nuevosMods.objetivoDelta -= 2;
          break;
        case 'pacto_vacio_viviente':
          nuevosMods.seleccionarSiempre3 = true;
          break;
        case 'pacto_oraculo_silencioso':
          nuevosMods.noPuedeRelanzar = true;
          break;
        case 'pacto_atlas_caido':
          nuevosMods.deshabilitarAumentar = true;
          nuevosMods.deshabilitarVoltear = true;
          break;
        case 'pacto_corazon_gris':
          nuevosMods.hpMaxMultiplicador = 0.6; // 60% de HP máximo
          break;
        case 'pacto_eclipse':
          nuevosMods.energiaMaxExtra += 4;
          break;
        case 'pacto_maquina_perfecta':
          // Ajuste especial que se manejaría en la lógica de habilidades
          break;
        case 'pacto_caos_absoluto':
          // Efecto especial que se manejaría en la evaluación de dados
          break;
        default:
          // Otros pactos que no tienen modificadores directos
          break;
      }
    }

    this.modsPactos = nuevosMods;

    // Aplicar efectos "permanentes" derivados
    this.energiaMax = 3 + this.modsPactos.energiaMaxExtra; // Base es 3
    // HP máximo se ajusta manteniendo proporción actual
    const proporcionVida = this.hp / this.hpMax;
    this.hpMax = Math.max(1, Math.floor(20 * this.modsPactos.hpMaxMultiplicador)); // Base es 20
    this.hp = Math.max(1, Math.floor(this.hpMax * proporcionVida)); // Mantener proporción
  }

  // Aceptar un nuevo pacto
  aceptarPacto(pactoId) {
    if (!this.pactosActivos.includes(pactoId)) {
      this.pactosActivos.push(pactoId);
    }

    // Inicializar estado runtime
    if (!this.estadoPactos[pactoId]) {
      this.inicializarEstadoPacto(pactoId);
    }

    // Recalcular mods acumulados
    this.recalcularModsPactos();
  }

  // Hook para cuando inicia un piso
  onInicioPiso() {
    // Aplicar efectos generales por piso
    this.oro += this.modsPactos.oroExtraPorPiso;
    // Aumentar corrupción por piso
    for (let i = 0; i < this.modsPactos.corrupcionExtraPorPiso; i++) {
      const nuevoDado = require('../game/dice').crearDadoCorrupcion(`dc-${(this.dadosCorrupcion?.length || 0) + 1}`);
      if (!Array.isArray(this.dadosCorrupcion)) {
        this.dadosCorrupcion = [];
      }
      this.dadosCorrupcion.push(nuevoDado);
    }

      // Permitir que cada pacto individual aplique efectos al inicio del piso
    for (const pactoId of this.pactosActivos) {
      const { LOGICA_PACTOS } = require('../game/pactosLogic');
      const logicaPacto = LOGICA_PACTOS[pactoId];
      if (logicaPacto && logicaPacto.onInicioPiso) {
        logicaPacto.onInicioPiso({ jugador: this, pisoActual: this.piso });
      }
    }
  }

  // Hook para cuando finaliza un piso
  onFinPiso() {
    for (const pactoId of this.pactosActivos) {
      const { LOGICA_PACTOS } = require('../game/pactosLogic');
      const logicaPacto = LOGICA_PACTOS[pactoId];
      if (logicaPacto && logicaPacto.onFinPiso) {
        logicaPacto.onFinPiso({ jugador: this, pisoActual: this.piso });
      }
    }
  }

  // Hook para cuando inicia un combate
  onInicioCombate() {
    for (const pactoId of this.pactosActivos) {
      const { LOGICA_PACTOS } = require('../game/pactosLogic');
      const logicaPacto = LOGICA_PACTOS[pactoId];
      if (logicaPacto && logicaPacto.onInicioCombate) {
        logicaPacto.onInicioCombate({ jugador: this });
      }
    }
  }

  // Hook para cuando finaliza un combate
  onFinCombate(exito) {
    for (const pactoId of this.pactosActivos) {
      const { LOGICA_PACTOS } = require('../game/pactosLogic');
      const logicaPacto = LOGICA_PACTOS[pactoId];
      if (logicaPacto && logicaPacto.onFinCombate) {
        logicaPacto.onFinCombate({ jugador: this, exito: exito });
      }
    }
  }

  // Hook para cuando se lanzan dados
  onLanzarDados(dados) {
    for (const pactoId of this.pactosActivos) {
      const { LOGICA_PACTOS } = require('../game/pactosLogic');
      const logicaPacto = LOGICA_PACTOS[pactoId];
      if (logicaPacto && logicaPacto.onLanzarDados) {
        logicaPacto.onLanzarDados({ jugador: this }, dados);
      }
    }

    // Aplicar bonus plano de lanzamientos:
    if (this.modsPactos.bonusLanzamientoPlano !== 0) {
      for (const d of dados) {
        if (typeof d.valor === 'number') {
          d.valor += this.modsPactos.bonusLanzamientoPlano;
          if (d.valor < 1) d.valor = 1;
          if (d.valor > 6) d.valor = 6;
        }
      }
    }

    return dados;
  }

  // Hook para evaluar objetivo
  evaluarObjetivo(sumaBase, objetivoBase) {
    let suma = sumaBase + this.modsPactos.bonusSumaFinal;
    let objetivo = objetivoBase + this.modsPactos.objetivoDelta;

    for (const pactoId of this.pactosActivos) {
      const { LOGICA_PACTOS } = require('../game/pactosLogic');
      const logicaPacto = LOGICA_PACTOS[pactoId];
      if (logicaPacto && logicaPacto.onEvaluarObjetivo) {
        const res = logicaPacto.onEvaluarObjetivo({ jugador: this }, suma, objetivo);
        suma = res.suma;
        objetivo = res.objetivo;
      }
    }

    const exito = suma >= objetivo;
    return { exito, sumaFinal: suma, objetivoFinal: objetivo };
  }

  // Hook para usar habilidad
  onUsarHabilidad(habilidadId) {
    for (const pactoId of this.pactosActivos) {
      const { LOGICA_PACTOS } = require('../game/pactosLogic');
      const logicaPacto = LOGICA_PACTOS[pactoId];
      if (logicaPacto && logicaPacto.onUsarHabilidad) {
        logicaPacto.onUsarHabilidad({ jugador: this }, habilidadId);
      }
    }
  }

  // Hook para antes de morir
  onAntesDeMorir() {
    for (const pactoId of this.pactosActivos) {
      const { LOGICA_PACTOS } = require('../game/pactosLogic');
      const logicaPacto = LOGICA_PACTOS[pactoId];
      if (logicaPacto && logicaPacto.onAntesDeMorir) {
        const resultado = logicaPacto.onAntesDeMorir({ jugador: this });
        if (resultado && resultado.evitarMuerte) {
          return { evitarMuerte: true };
        }
      }
    }
    return { evitarMuerte: false };
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

  // Método para obtener el número máximo de dados que se pueden seleccionar considerando pactos y modificadores
  getMaxDadosSeleccionables() {
    const dadosExtra = this.getModificador('dados_extra') || 0;
    const pactoDadosExtra = this.modsPactos.seleccionDadosBaseExtra || 0;
    const pactoSiempre3 = this.modsPactos.seleccionarSiempre3 ? 1 : 0;
    
    // Si el pacto es seleccionar siempre 3 dados, se aplica eso
    if (this.modsPactos.seleccionarSiempre3) {
      return 3;
    }
    
    return 2 + dadosExtra + pactoDadosExtra + pactoSiempre3; // Por defecto se pueden seleccionar 2 dados, más los dados extra de las reliquias y pactos
  }

  // Método para ajustar el objetivo del enemigo considerando pactos y modificadores
  getModificadorObjetivo() {
    const modificadorBase = this.getModificador('ventaja_objetivo') || 0;
    return modificadorBase + this.modsPactos.objetivoDelta;
  }

  // Método para verificar si el jugador revive al morir
  puedeRevivir() {
    // Verificar si tiene el modificador de revivir normal
    const revivir = this.getModificador('revivir') || 0;
    if (revivir > 0) {
      this.aplicarModificador('revivir', -1); // Disminuir el contador de revivir
      return { puedeRevivir: true, tipoRevivir: 'normal' };
    }
    
    // Verificar si tiene la reliquia "Corazón Profano" que revivifica sin reliquias
    const revivirSinReliquias = this.getModificador('revivir_sin_reliquias') || 0;
    if (revivirSinReliquias > 0) {
      // Revivir sin reliquias significa que se pierden todas las reliquias
      this.reliquias = [];
      this.modificadores = {}; // Limpiar todos los modificadores de reliquias
      return { puedeRevivir: true, tipoRevivir: 'sin_reliquias' };
    }
    
    return { puedeRevivir: false, tipoRevivir: null };
  }

  // Método para cambiar dados corruptos por normales
  cambiarDadoCorrupto() {
    const puedeCambiar = this.getModificador('cambio_dados') || 0;
    if (puedeCambiar > 0 && this.dadosCorrupcion.length > 0) {
      const dadoCorrupto = this.dadosCorrupcion.pop(); // Remover un dado corrupto
      const nuevoDado = {
        id: `d-${this.dadosBase.length + 1}`,
        valor: null,
        esCorrupto: false
      };
      this.dadosBase.push(nuevoDado); // Agregar un dado normal
      this.aplicarModificador('cambio_dados', -1); // Disminuir el contador de cambios
      return true;
    }
    return false;
  }

  // Método para serializar el estado para enviar al cliente
  serializarParaCliente() {
    return {
      piso: this.piso,
      hp: this.hp,
      hpMax: this.hpMax,
      oro: this.oro,
      energia: this.energia,
      energiaMax: this.energiaMax,
      dadosLanzados: this.dadosLanzados,
      estadoJuego: this.estadoJuego,
      nivel: this.nivel,
      xp: this.xp,
      xpParaNivel: this.xpParaNivel,
      dadosBase: this.dadosBase,
      dadosCorrupcion: this.dadosCorrupcion,
      mapaActual: this.mapaActual,
      encuentroActual: this.encuentroActual,
      opcionesMejora: this.opcionesMejora,
      opcionesPacto: this.opcionesPacto,
      mensaje: this.mensaje,
      tiendaActual: this.tiendaActual,
      consumibles: this.consumibles,
      reliquias: this.reliquias,
      pactosHechos: this.pactosHechos,
      maxDadosSeleccionables: this.getMaxDadosSeleccionables(),
      modificadorObjetivo: this.getModificadorObjetivo(),
      puedeRevivir: this.puedeRevivir().puedeRevivir, // Solo enviar el booleano al cliente
      dadosACambiar: this.getModificador('cambio_dados') || 0,
      modificadores: this.modificadores
    };
  }

  // Eliminando métodos duplicados ya que existen arriba
  // No se necesita redefinir getModificador y aplicarModificador
}

module.exports = PartidaState;


