// ================== TIPOS BASE ==================

export type RarezaPacto = 'comun' | 'raro' | 'epico';

export interface PactoDef {
  id: string;
  nombre: string;
  poder: string;
  maldicion: string;
  rareza: RarezaPacto;
}

// Tipo de dado, adáptalo a tu modelo real
export type TipoDado = 'base' | 'corrupto' | 'bendito';

export interface Dado {
  id: string;
  valor: number;  // 1-6
  tipo: TipoDado;
}

// Ajusta JugadorState a tu modelo real
export interface JugadorState {
  nick: string;
  hpActual: number;
  hpMax: number;
  hpMaxBase: number;

  energiaActual: number;
  energiaMax: number;
  energiaMaxBase: number;

  pisoActual: number;
  oro: number;
  corrupcion: number;

  pactosActivos: string[];
  modsPactos: ModPactosAcumulados;
  estadoPactos: Record<string, EstadoPactoRuntime>;
}

// Mods acumulados por TODOS los pactos activos
export interface ModPactosAcumulados {
  bonusLanzamientoPlano: number;
  bonusSumaFinal: number;
  energiaMaxExtra: number;
  hpMaxMultiplicador: number;
  oroExtraPorPiso: number;
  corrupcionExtraPorPiso: number;
  seleccionDadosBaseExtra: number;
  reduceCostoVoltear: number;
  reduceCostoRelanzar: number;
  objetivoDelta: number;
  criticoDesdeValor: number | null;
  seleccionarSiempre3: boolean;
  noPuedeRelanzar: boolean;
  deshabilitarAumentar: boolean;
  deshabilitarVoltear: boolean;
}

// Estado runtime por pacto concreto
export interface EstadoPactoRuntime {
  combatesCompletados: number;
  revivirUsado: boolean;
  relanzarUsadoEsteCombate: boolean;
  usosBloqueadosRelanzarRestantes: number;
}

export interface EventoContexto {
  jugador: JugadorState;
  pisoActual: number;
}

// Interface de lógica por pacto
export interface PactoLogic {
  id: string;

  aplicarMods?(mods: ModPactosAcumulados, jugador: JugadorState): void;

  onInicioPiso?(ctx: EventoContexto): void;
  onFinPiso?(ctx: EventoContexto): void;
  onInicioCombate?(ctx: EventoContexto): void;
  onFinCombate?(ctx: EventoContexto & { exito: boolean }): void;
  onLanzarDados?(ctx: EventoContexto, dados: Dado[]): void;
  onEvaluarObjetivo?(
    ctx: EventoContexto,
    suma: number,
    objetivo: number
  ): { suma: number; objetivo: number };
  onUsarHabilidad?(
    ctx: EventoContexto,
    habilidadId: 'aumentar' | 'voltear' | 'relanzar'
  ): void;
  onAntesDeMorir?(ctx: EventoContexto): { evitarMuerte: boolean };
}

// ================== HELPERS ==================

function crearEstadoPactoDefault(): EstadoPactoRuntime {
  return {
    combatesCompletados: 0,
    revivirUsado: false,
    relanzarUsadoEsteCombate: false,
    usosBloqueadosRelanzarRestantes: 0,
  };
}

function getEstadoPacto(jugador: JugadorState, pactoId: string): EstadoPactoRuntime {
  if (!jugador.estadoPactos[pactoId]) {
    jugador.estadoPactos[pactoId] = crearEstadoPactoDefault();
  }
  return jugador.estadoPactos[pactoId];
}

// ================== LOGICA_PACTOS ==================

export const LOGICA_PACTOS: Record<string, PactoLogic> = {
  // ========= NIVEL 1 / COMUNES =========

  pacto_vidente: {
    id: 'pacto_vidente',
    aplicarMods(mods) {
      mods.bonusLanzamientoPlano += 2;
    },
    onInicioPiso({ jugador }) {
      jugador.hpMax = Math.max(1, jugador.hpMax - 1);
      if (jugador.hpActual > jugador.hpMax) {
        jugador.hpActual = jugador.hpMax;
      }
    },
  },

  pacto_eco: {
    id: 'pacto_eco',
    onLanzarDados({ jugador }, dados) {
      if (dados.length === 0) return;
      let max = dados[0];
      for (const d of dados) {
        if (d.valor > max.valor) max = d;
      }
      // Poder: dado más alto cuenta doble => lo puedes marcar de alguna forma
      // Aquí ejemplo: simplemente +max.valor a la suma via bonusSumaFinal
      // (más elegante: marcar flag en dado, pero esto es simple)
      jugador.modsPactos.bonusSumaFinal += max.valor;

      // Maldición: dado más bajo se convierte en corrupto
      let min = dados[0];
      for (const d of dados) {
        if (d.valor < min.valor) min = d;
      }
      min.tipo = 'corrupto';
    },
  },

  pacto_usurpador: {
    id: 'pacto_usurpador',
    aplicarMods(mods) {
      mods.energiaMaxExtra += 1;
    },
    onInicioPiso({ jugador }) {
      // -1 energía temporal al inicio del piso
      jugador.energiaActual = Math.max(0, jugador.energiaMax - 1);
    },
  },

  pacto_taimado: {
    id: 'pacto_taimado',
    onLanzarDados(_ctx, dados) {
      for (const d of dados) {
        if (d.valor === 1) d.valor = 3;
        if (d.valor === 6) d.tipo = 'corrupto';
      }
    },
  },

  pacto_filo_carmesí: {
    id: 'pacto_filo_carmesí',
    onFinCombate({ jugador, exito }) {
      if (exito) {
        // +1 daño garantizado al superar objetivo puede ser aplicado donde calculas daño;
        // aquí como ejemplo: curar negativo no aplica, mejor almacenar en mods
        jugador.modsPactos.bonusSumaFinal += 1;
      } else {
        jugador.hpActual = Math.max(0, jugador.hpActual - 1);
      }
    },
  },

  pacto_mentiroso: {
    id: 'pacto_mentiroso',
    aplicarMods(mods) {
      mods.seleccionDadosBaseExtra += 1; // pasarás de 2 a 3
    },
    // Maldición: al seleccionar 3, el más alto se vuelve corrupto
    // Esto lo puedes aplicar en tu lógica de "confirmar selección", usando este pacto.
  },

  pacto_avaricia: {
    id: 'pacto_avaricia',
    aplicarMods(mods) {
      mods.oroExtraPorPiso += 10;
      mods.corrupcionExtraPorPiso += 1;
    },
  },

  pacto_titan: {
    id: 'pacto_titan',
    aplicarMods(mods) {
      // +5 HP máx lo puedes aplicar directamente al jugador al aceptar el pacto,
      // o manejarlo aquí con un campo hpMaxExtra, pero para no romper el diseño,
      // usaremos el multiplicador más adelante.
      // Aquí ejemplo sencillo: aumenta base fuera de mods.
      // mods.hpMaxMultiplicador *= 1; // lo de HP extra hazlo en aceptarPacto si quieres.
    },
    // Maldición: Aumentar cuesta +1 energía.
    // Lo aplicas cuando calcules el coste de la habilidad:
    // costo = base + (tiene pacto_titan ? 1 : 0)
  },

  pacto_sombra: {
    id: 'pacto_sombra',
    onInicioPiso({ jugador }) {
      // Poder: empezar con un dado bendito de valor 4
      // Esto lo aplicas donde generes dados iniciales de piso.
      // Maldición: también 1 dado corrupto
      // Igual: lo aplicas al crear dados del piso.
    },
  },

  pacto_cruel: {
    id: 'pacto_cruel',
    aplicarMods(mods) {
      // reduceCostoRelanzar muy alto para que quede 0
      mods.reduceCostoRelanzar += 999;
    },
    onInicioCombate({ jugador }) {
      const st = getEstadoPacto(jugador, 'pacto_cruel');
      st.relanzarUsadoEsteCombate = false;
    },
    onUsarHabilidad({ jugador }, habilidadId) {
      if (habilidadId === 'relanzar') {
        const st = getEstadoPacto(jugador, 'pacto_cruel');
        st.relanzarUsadoEsteCombate = true;
      }
    },
    onFinCombate({ jugador }) {
      const st = getEstadoPacto(jugador, 'pacto_cruel');
      if (st.relanzarUsadoEsteCombate) {
        jugador.hpActual = Math.max(0, jugador.hpActual - 2);
      }
    },
  },

  // ========= NIVEL 2 / RAROS =========

  pacto_abismo: {
    id: 'pacto_abismo',
    aplicarMods(mods) {
      mods.bonusSumaFinal += 3;
    },
    onInicioPiso({ jugador }) {
      jugador.corrupcion += 2;
    },
  },

  pacto_cronista: {
    id: 'pacto_cronista',
    onInicioCombate({ jugador }) {
      const st = getEstadoPacto(jugador, 'pacto_cronista');
      st.usosBloqueadosRelanzarRestantes = 2; // los 2 primeros relanzar bloqueados
    },
    onUsarHabilidad({ jugador }, habilidadId) {
      const st = getEstadoPacto(jugador, 'pacto_cronista');
      if (habilidadId === 'relanzar' && st.usosBloqueadosRelanzarRestantes > 0) {
        // aquí deberías impedir realmente el uso de relanzar
        // ejemplo: marcar un flag de error en la respuesta del servidor.
        st.usosBloqueadosRelanzarRestantes--;
      }
    },
    onFinCombate({ jugador }) {
      const st = getEstadoPacto(jugador, 'pacto_cronista');
      st.combatesCompletados++;
      if (st.combatesCompletados % 3 === 0) {
        jugador.energiaActual = Math.min(jugador.energiaMax, jugador.energiaActual + 1);
      }
    },
  },

  pacto_destino_invertido: {
    id: 'pacto_destino_invertido',
    aplicarMods(mods) {
      mods.reduceCostoVoltear += 1; // Voltear -1 energía (de 2 a 1)
    },
    onLanzarDados(_ctx, dados) {
      for (const d of dados) {
        if (d.valor % 2 === 0) {
          d.valor = Math.max(1, d.valor - 1);
        }
      }
    },
  },

  pacto_ritual_prohibido: {
    id: 'pacto_ritual_prohibido',
    onFinPiso({ jugador }) {
      // Poder: reliquia aleatoria → hazlo en tu sistema de reliquias
      // Maldición: cada reliquia obtenida te inflige 1 corrupción
      jugador.corrupcion += 1;
    },
  },

  pacto_coleccionista: {
    id: 'pacto_coleccionista',
    aplicarMods(mods) {
      // +1 dado base permanente → manejado en el generador de dados
      // Maldición: el dado extra es corrupto → también en el generador
      mods.seleccionDadosBaseExtra += 0; // aquí no hace falta tocar nada más
    },
  },

  pacto_renacido: {
    id: 'pacto_renacido',
    onLanzarDados(_ctx, dados) {
      for (const d of dados) {
        if (d.valor === 6) {
          d.tipo = 'corrupto';
        }
      }
    },
    onAntesDeMorir({ jugador }) {
      const st = getEstadoPacto(jugador, 'pacto_renacido');
      if (!st.revivirUsado) {
        st.revivirUsado = true;
        jugador.hpActual = 1;
        return { evitarMuerte: true };
      }
      return { evitarMuerte: false };
    },
  },

  pacto_preparador: {
    id: 'pacto_preparador',
    onInicioCombate({ jugador }) {
      jugador.energiaActual = Math.min(
        jugador.energiaMax + 1,
        jugador.energiaMax + 1
      );
      const st = getEstadoPacto(jugador, 'pacto_preparador');
      st.usosBloqueadosRelanzarRestantes = 0; // reutilizamos campo, o crea otro
    },
    onUsarHabilidad({ jugador }, habilidadId) {
      const st = getEstadoPacto(jugador, 'pacto_preparador');
      if (!st.relanzarUsadoEsteCombate) {
        // primera habilidad usada cuesta +1 energía
        // Asegúrate de aplicar esto donde calculas el coste real
        st.relanzarUsadoEsteCombate = true;
        jugador.energiaActual = Math.max(0, jugador.energiaActual - 1);
      }
    },
  },

  pacto_frio_eterno: {
    id: 'pacto_frio_eterno',
    aplicarMods(mods) {
      mods.criticoDesdeValor = 5;
    },
    onLanzarDados({ jugador }, dados) {
      for (const d of dados) {
        if (d.valor === 1) {
          jugador.hpActual = Math.max(0, jugador.hpActual - 1);
        }
      }
    },
  },

  pacto_faro_oscuro: {
    id: 'pacto_faro_oscuro',
    aplicarMods(mods) {
      mods.objetivoDelta -= 2;
    },
    onFinCombate({ jugador, exito }) {
      if (!exito) {
        jugador.hpActual = Math.max(0, jugador.hpActual - 2);
      }
    },
  },

  pacto_sangre_eterna: {
    id: 'pacto_sangre_eterna',
    onInicioCombate({ jugador }) {
      // -2 HP temporal al inicio del combate
      jugador.hpActual = Math.max(0, jugador.hpActual - 2);
    },
    onFinCombate({ jugador, exito }) {
      if (exito) {
        jugador.hpActual = Math.min(jugador.hpMax, jugador.hpActual + 2);
      }
    },
  },

  // ========= NIVEL 3 / EPICOS =========

  pacto_infierno_glorioso: {
    id: 'pacto_infierno_glorioso',
    aplicarMods(mods) {
      mods.criticoDesdeValor = 4;
    },
    onInicioPiso({ jugador }) {
      jugador.corrupcion += 3;
    },
  },

  pacto_vacio_viviente: {
    id: 'pacto_vacio_viviente',
    aplicarMods(mods) {
      mods.seleccionarSiempre3 = true;
    },
    onFinCombate({ jugador, exito }) {
      if (exito) {
        jugador.corrupcion += 1;
      } else {
        jugador.corrupcion += 1;
      }
    },
  },

  pacto_oraculo_silencioso: {
    id: 'pacto_oraculo_silencioso',
    aplicarMods(mods) {
      mods.noPuedeRelanzar = true;
    },
    // Poder de ver los próximos 3 dados se implementa en tu UI y lógica de tirada;
    // aquí no se aplica nada numérico directamente.
  },

  pacto_maquina_perfecta: {
    id: 'pacto_maquina_perfecta',
    // Poder: Aumentar suma +3 → úsalo en la lógica de la habilidad
    // Maldición: Aumentar cuesta 3 energía → también en la lógica de coste
  },

  pacto_reina_dados: {
    id: 'pacto_reina_dados',
    onEvaluarObjetivo(_ctx, suma, objetivo) {
      // Poder: dado más bajo se convierte en 6 (ideal hacerlo antes, aquí simulamos)
      // Para simplificar, subimos un poco la suma:
      const sumaMod = suma + 3;
      return { suma: sumaMod, objetivo };
    },
    onLanzarDados(_ctx, dados) {
      // Maldición: dado más alto se vuelve corrupto
      if (dados.length === 0) return;
      let max = dados[0];
      for (const d of dados) {
        if (d.valor > max.valor) max = d;
      }
      max.tipo = 'corrupto';
    },
  },

  pacto_corazon_gris: {
    id: 'pacto_corazon_gris',
    aplicarMods(mods) {
      mods.hpMaxMultiplicador *= 0.6; // -40% HP máx
    },
    onAntesDeMorir({ jugador }) {
      if (jugador.hpActual <= 0 && jugador.hpMax > 1) {
        jugador.hpActual = 1;
        return { evitarMuerte: true };
      }
      return { evitarMuerte: false };
    },
  },

  pacto_eclipse: {
    id: 'pacto_eclipse',
    aplicarMods(mods) {
      mods.energiaMaxExtra += 4;
    },
    onInicioCombate({ jugador }) {
      jugador.hpActual = Math.max(0, jugador.hpActual - 2);
    },
  },

  pacto_engullidor: {
    id: 'pacto_engullidor',
    onFinCombate({ jugador, exito }) {
      if (!exito) return;
      const st = getEstadoPacto(jugador, 'pacto_engullidor');
      st.combatesCompletados++;
      if (st.combatesCompletados % 3 === 0) {
        // Dar reliquia legendaria → hazlo en tu sistema de reliquias
      }
      // Maldición: en cada combate, 1 dado base se vuelve corrupto
      // Hazlo en la lógica de generación de dados del combate.
    },
  },

  pacto_atlas_caido: {
    id: 'pacto_atlas_caido',
    aplicarMods(mods) {
      // Objetivo se reduce a la mitad en la comprobación;
      // lo manejamos en onEvaluarObjetivo
    },
    onEvaluarObjetivo(_ctx, suma, objetivo) {
      const objetivoMitad = Math.ceil(objetivo / 2);
      return { suma, objetivo: objetivoMitad };
    },
  },

  pacto_caos_absoluto: {
    id: 'pacto_caos_absoluto',
    onLanzarDados(_ctx, dados) {
      for (const d of dados) {
        if (d.tipo === 'corrupto') {
          d.valor = 6;
        }
      }
    },
    onInicioPiso({ jugador }) {
      // +2 dados corruptos por piso → manejado al generar dados del piso
    },
  },
};

// ================== EJEMPLO DE RE-CALCULO DE MODS ==================

export function recalcularModsPactos(jugador: JugadorState) {
  const mods: ModPactosAcumulados = {
    bonusLanzamientoPlano: 0,
    bonusSumaFinal: 0,
    energiaMaxExtra: 0,
    hpMaxMultiplicador: 1,
    oroExtraPorPiso: 0,
    corrupcionExtraPorPiso: 0,
    seleccionDadosBaseExtra: 0,
    reduceCostoVoltear: 0,
    reduceCostoRelanzar: 0,
    objetivoDelta: 0,
    criticoDesdeValor: null,
    seleccionarSiempre3: false,
    noPuedeRelanzar: false,
    deshabilitarAumentar: false,
    deshabilitarVoltear: false,
  };

  for (const pactoId of jugador.pactosActivos) {
    const logic = LOGICA_PACTOS[pactoId];
    if (logic?.aplicarMods) {
      logic.aplicarMods(mods, jugador);
    }
  }

  jugador.modsPactos = mods;

  // Aplicar efectos derivados básicos
  jugador.hpMax = Math.floor(jugador.hpMaxBase * mods.hpMaxMultiplicador);
  if (jugador.hpActual > jugador.hpMax) {
    jugador.hpActual = jugador.hpMax;
  }
  jugador.energiaMax = jugador.energiaMaxBase + mods.energiaMaxExtra;
}
