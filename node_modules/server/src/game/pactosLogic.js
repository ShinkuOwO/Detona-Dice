const { crearDadoCorrupcion } = require('./dice');

// Definición de tipos (usando comentarios para documentación)
/*
interface EventoContexto {
  jugador: PartidaState;
  pisoActual: number;
  combateId?: string;
}

interface PactoLogic {
  id: string;
  aplicarMods?(mods: ModPactosAcumulados, jugador: PartidaState): void;
  onInicioPiso?(ctx: EventoContexto): void;
  onFinPiso?(ctx: EventoContexto): void;
  onInicioCombate?(ctx: EventoContexto): void;
  onFinCombate?(ctx: EventoContexto & { exito: boolean }): void;
  onLanzarDados?(ctx: EventoContexto, dados: Dado[]): void;
  onModificarDado?(ctx: EventoContexto, dado: Dado): void;
  onEvaluarObjetivo?(ctx: EventoContexto, suma: number, objetivo: number): { suma: number; objetivo: number };
  onUsarHabilidad?(ctx: EventoContexto, habilidadId: 'aumentar' | 'voltear' | 'relanzar'): void;
  onAntesDeMorir?(ctx: EventoContexto): { evitarMuerte: boolean };
}
*/

// Mapa de lógica de pactos
const LOGICA_PACTOS = {
  pacto_vidente: {
    id: 'pacto_vidente',
    aplicarMods(mods) {
      mods.bonusLanzamientoPlano += 2;
    },
    onInicioPiso({ jugador }) {
      // Aplicar penalidad: pierdes 1 HP permanente por piso
      jugador.hpMax = Math.max(1, jugador.hpMax - 1);
      jugador.hp = Math.min(jugador.hp, jugador.hpMax);
    },
  },

  pacto_avaricia: {
    id: 'pacto_avaricia',
    aplicarMods(mods) {
      mods.oroExtraPorPiso += 10;
      mods.corrupcionExtraPorPiso += 1;
    },
  },

  pacto_cruel: {
    id: 'pacto_cruel',
    aplicarMods(mods) {
      // Relanzar cuesta 0 energía (usamos un valor alto para reducir el costo a 0)
      mods.reduceCostoRelanzar = 999; // Esto hará que el costo sea 0
    },
    onInicioCombate({ jugador }) {
      if (!jugador.estadoPactos['pacto_cruel']) {
        jugador.estadoPactos['pacto_cruel'] = {
          combatesCompletados: 0,
          revivirUsado: false,
          relanzarUsadoEsteCombate: false,
        };
      }
      jugador.estadoPactos['pacto_cruel'].relanzarUsadoEsteCombate = false;
    },
    onUsarHabilidad({ jugador }, habilidadId) {
      if (habilidadId === 'relanzar') {
        jugador.estadoPactos['pacto_cruel'].relanzarUsadoEsteCombate = true;
      }
    },
    onFinCombate({ jugador }) {
      const st = jugador.estadoPactos['pacto_cruel'];
      if (st && st.relanzarUsadoEsteCombate) {
        jugador.hp = Math.max(0, jugador.hp - 2);
      }
    },
  },

  pacto_renacido: {
    id: 'pacto_renacido',
    onLanzarDados({ jugador }, dados) {
      // No implementamos aquí la conversión de 6 a corrupción porque eso se maneja
      // en la evaluación de dados individuales, no en el lanzamiento general
    },
    onAntesDeMorir({ jugador }) {
      const st = jugador.estadoPactos['pacto_renacido'];
      if (st && !st.revivirUsado) {
        st.revivirUsado = true;
        jugador.hp = 1;
        return { evitarMuerte: true };
      }
      return { evitarMuerte: false };
    },
  },

  pacto_mentiroso: {
    id: 'pacto_mentiroso',
    aplicarMods(mods) {
      mods.seleccionarSiempre3 = true;
    },
  },

  pacto_destino_invertido: {
    id: 'pacto_destino_invertido',
    aplicarMods(mods) {
      // Voltear cuesta 1 energía en lugar de 2 (reduce costo en 1)
      mods.reduceCostoVoltear = -1;
    },
    // TODO: Implementar efecto "Todos tus dados pares pierden -1 valor al lanzarse"
    // Este efecto se aplicaría en onLanzarDados
    onLanzarDados({ jugador }, dados) {
      if (jugador.modsPactos.dadosParesMenosUno) {
        dados.forEach(dado => {
          if (typeof dado.valor === 'number' && dado.valor % 2 === 0 && dado.valor > 1) {
            dado.valor -= 1;
          }
        });
      }
    },
  },

  pacto_faro_oscuro: {
    id: 'pacto_faro_oscuro',
    aplicarMods(mods) {
      mods.objetivoDelta -= 2;
    },
  },

  pacto_vacio_viviente: {
    id: 'pacto_vacio_viviente',
    aplicarMods(mods) {
      mods.seleccionarSiempre3 = true;
    },
    onFinCombate({ jugador }) {
      // Al final de cada combate gana +1 de corrupción permanente
      const nuevoDado = crearDadoCorrupcion(`dc-${(jugador.dadosCorrupcion?.length || 0) + 1}`);
      if (!Array.isArray(jugador.dadosCorrupcion)) {
        jugador.dadosCorrupcion = [];
      }
      jugador.dadosCorrupcion.push(nuevoDado);
    },
  },

  pacto_oraculo_silencioso: {
    id: 'pacto_oraculo_silencioso',
    aplicarMods(mods) {
      mods.noPuedeRelanzar = true;
    },
  },

  pacto_atlas_caido: {
    id: 'pacto_atlas_caido',
    aplicarMods(mods) {
      mods.deshabilitarAumentar = true;
      mods.deshabilitarVoltear = true;
    },
  },

  pacto_corazon_gris: {
    id: 'pacto_corazon_gris',
    aplicarMods(mods) {
      // No puedes morir si tienes más de 1 HP (no bajas de 1 HP)
      // Pero tu HP máximo se reduce un 40%
      mods.hpMaxMultiplicador = 0.6;
    },
  },

  pacto_eclipse: {
    id: 'pacto_eclipse',
    aplicarMods(mods) {
      mods.energiaMaxExtra += 4;
    },
    onInicioCombate({ jugador }) {
      // Pierde 2 HP al inicio de cada turno de combate
      jugador.hp = Math.max(1, jugador.hp - 2);
    },
  },

  pacto_caos_absoluto: {
    id: 'pacto_caos_absoluto',
    // Todos tus dados corruptos cuentan como si fueran 6
    // Este efecto se manejaría en la evaluación de dados
    onEvaluarDados({ jugador }, dados) {
      // Esta función se llamaría cuando se evalúan los dados seleccionados
      // y haría que los dados corruptos valgan 6
      return dados.map(dado => {
        if (dado.esCorrupto && typeof dado.valor === 'number' && dado.valor !== 'CRÁNEO') {
          return { ...dado, valor: 6 };
        }
        return dado;
      });
    },
  },

  pacto_sangre_eterna: {
    id: 'pacto_sangre_eterna',
    onInicioCombate({ jugador }) {
      // Inicia cada combate con -2 HP temporal
      jugador.hp = Math.max(1, jugador.hp - 2);
    },
    onFinCombate({ jugador, exito }) {
      // Recupera 2 HP al superar objetivo
      if (exito) {
        jugador.hp = Math.min(jugador.hpMax, jugador.hp + 2);
      }
    },
  },

  pacto_titan: {
    id: 'pacto_titan',
    aplicarMods(mods) {
      // +5 HP máximo
      // Este efecto se aplicaría al aceptar el pacto, no como modificador
      // que se recalcule constantemente
    },
    // Aplicar efecto al aceptar el pacto
    onAceptar({ jugador }) {
      jugador.hpMax += 5;
      jugador.hp += 5;
    },
  },

  pacto_abismo: {
    id: 'pacto_abismo',
    aplicarMods(mods) {
      mods.bonusSumaFinal += 3;
    },
    onInicioPiso({ jugador }) {
      // Gana 2 de corrupción al iniciar cada piso
      for (let i = 0; i < 2; i++) {
        const nuevoDado = crearDadoCorrupcion(`dc-${(jugador.dadosCorrupcion?.length || 0) + 1}`);
        if (!Array.isArray(jugador.dadosCorrupcion)) {
          jugador.dadosCorrupcion = [];
        }
        jugador.dadosCorrupcion.push(nuevoDado);
      }
    },
  },

  pacto_infierno_glorioso: {
    id: 'pacto_infierno_glorioso',
    onLanzarDados({ jugador }, dados) {
      // Todos los lanzamientos de 4+ se consideran críticos (se duplican)
      dados.forEach(dado => {
        if (typeof dado.valor === 'number' && dado.valor >= 4) {
          // Este efecto se aplicaría en la evaluación, no en el lanzamiento
          // Marcamos que este dado es crítico
          dado.esCritico = true;
        }
      });
    },
    onInicioPiso({ jugador }) {
      // Empieza cada piso con 3 de corrupción
      for (let i = 0; i < 3; i++) {
        const nuevoDado = crearDadoCorrupcion(`dc-${(jugador.dadosCorrupcion?.length || 0) + 1}`);
        if (!Array.isArray(jugador.dadosCorrupcion)) {
          jugador.dadosCorrupcion = [];
        }
        jugador.dadosCorrupcion.push(nuevoDado);
      }
    },
  },

  pacto_maquina_perfecta: {
    id: 'pacto_maquina_perfecta',
    // Aumentar ahora suma +3 al dado objetivo, pero cuesta 3 de energía
    // Este efecto se manejaría en la lógica de habilidades
  },

  pacto_ritual_prohibido: {
    id: 'pacto_ritual_prohibido',
    onFinPiso({ jugador }) {
      // Obtiene una reliquia aleatoria al final de cada piso
      // Y cada reliquia obtenida te inflige 1 de corrupción
      // Esta lógica se implementaría en el sistema de reliquias
    },
  },

  pacto_engullidor: {
    id: 'pacto_engullidor',
    onInicioCombate({ jugador }) {
      // En cada combate, 1 dado base aleatorio se convierte en corrupto
      if (Array.isArray(jugador.dadosBase) && jugador.dadosBase.length > 0) {
        const indiceAleatorio = Math.floor(Math.random() * jugador.dadosBase.length);
        const dadoBase = jugador.dadosBase[indiceAleatorio];
        // Convertir el dado base en corrupto
        const nuevoDadoCorrupto = crearDadoCorrupcion(`dc-${(jugador.dadosCorrupcion?.length || 0) + 1}`);
        nuevoDadoCorrupto.valor = dadoBase.valor; // Mantener el valor
        jugador.dadosCorrupcion.push(nuevoDadoCorrupto);
        // Remover el dado base original
        jugador.dadosBase.splice(indiceAleatorio, 1);
      }
    },
  },

  // Pactos restantes con implementación básica para inicializar correctamente
  pacto_eco: {
    id: 'pacto_eco',
    // Efecto: cada turno, tu dado más alto cuenta doble
    // Maldición: tu dado más bajo se convierte en corrupto
  },

  pacto_usurpador: {
    id: 'pacto_usurpador',
    aplicarMods(mods) {
      mods.energiaMaxExtra += 1;
    },
  },

  pacto_taimado: {
    id: 'pacto_taimado',
    // Efecto: Los resultados de 1 se convierten en 3
    // Maldición: Los resultados de 6 se convierten en dados corruptos
  },

  pacto_filo_carmesí: {
    id: 'pacto_filo_carmesí',
    // Efecto: +1 de daño garantizado al superar el objetivo
    // Maldición: Pierdes 1 HP si fallas el objetivo
  },

  pacto_sombra: {
    id: 'pacto_sombra',
    onInicioPiso({ jugador }) {
      // Comienza cada piso con un dado bendito de valor 4
      // Y también comienza con 1 dado corrupto
    },
  },

  pacto_cronista: {
    id: 'pacto_cronista',
    onInicioCombate({ jugador }) {
      // Cada 3 turnos, gana +1 energía
      // Lógica de turnos se implementaría en otro lugar
    },
  },

  pacto_frio_eterno: {
    id: 'pacto_frio_eterno',
    // Efecto: Los resultados 5 y 6 cuentan como críticos (se duplican en la suma)
    // Maldición: Los resultados de 1 te infligen 1 daño directo
  },

  pacto_coleccionista: {
    id: 'pacto_coleccionista',
    // Efecto: +1 dado base permanente
    // Maldición: El dado adicional es corrupto para siempre
  },

  pacto_preparador: {
    id: 'pacto_preparador',
    // Efecto: Empieza cada combate con energía máxima +1 temporal
    // Maldición: La primera habilidad que uses en cada combate cuesta +1 energía extra
  },

  pacto_reina_dados: {
    id: 'pacto_reina_dados',
    // Efecto: Tu dado más bajo siempre se convierte en 6 al resolver la tirada
    // Maldición: Tu dado más alto se convierte en corrupto
  },
};

module.exports = {
  LOGICA_PACTOS,
};
