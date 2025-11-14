const { PACTOS } = require('../data/pactos');

// Convertir los pactos del nuevo formato al formato que usa el juego actualmente
const POOL_PACTOS = PACTOS.map(pacto => ({
  id: pacto.id,
  texto: `${pacto.nombre}: ${pacto.poder} ${pacto.maldicion}`,
  aplicar: crearFuncionAplicarPacto(pacto.id),
  rareza: pacto.rareza
}));

const POOL_MEJORAS = [
  { id: 'hp_max_5', texto: '+5 HP Máximo', aplicar: (p) => { p.hpMax += 5; p.hp += 5; } },
  { id: 'energia_max_1', texto: '+1 Energía Máxima', aplicar: (p) => { p.energiaMax += 1; } },
  { id: 'oro_50', texto: 'Gana 50 Oro', aplicar: (p) => { p.oro += 50; } },
  { id: 'curar_10', texto: 'Cura 10 HP', aplicar: (p) => { p.hp = Math.min(p.hp + 10, p.hpMax); } },
  { id: 'dados_extra_1', texto: 'Seleccionar 3 dados', aplicar: (p) => { p.aplicarModificador('dados_extra', 1); } },
  { id: 'aumentar_reroll_gratuito', texto: 'Un reroll gratuito por piso', aplicar: (p) => { p.aplicarModificador('reroll_gratuito', 1); } },
  { id: 'ganar_hp_por_objetivo', texto: 'Ganar 1 HP por cada objetivo cumplido', aplicar: (p) => { p.aplicarModificador('hp_por_victoria', 1); } },
];

function generarOpciones(pool) {
  const poolMezclado = [...pool].sort(() => 0.5 - Math.random());
  return poolMezclado.slice(0, 3);
}

function aplicarMejora(partida, mejoraId) {
  const mejora =
    POOL_MEJORAS.find((m) => m.id === mejoraId) ||
    POOL_PACTOS.find((p) => p.id === mejoraId);

  if (!mejora) return false;
  mejora.aplicar(partida);
  return true;
}

// Función que crea la función de aplicación específica para cada pacto
function crearFuncionAplicarPacto(idPacto) {
  switch(idPacto) {
    case 'pacto_vidente':
      return (p) => {
        p.aplicarModificador('ventaja_lanzamiento', 2); // +2 a todos los lanzamientos
        p.aplicarModificador('penalidad_piso_hp', 1); // Cada piso pierde 1 HP
      };
    case 'pacto_eco':
      return (p) => {
        p.aplicarModificador('dado_mas_alto_doble', 1); // El dado más alto cuenta doble
        p.aplicarModificador('dado_mas_bajo_corromper', 1); // El dado más bajo se vuelve corrupto
      };
    case 'pacto_usurpador':
      return (p) => {
        p.energiaMax += 1; // +1 energía máxima
        p.aplicarModificador('energia_inicio_temporal', -1); // Empieza cada piso con -1 energía temporal
      };
    case 'pacto_taimado':
      return (p) => {
        p.aplicarModificador('convertir_uno_tres', 1); // Los 1 se convierten en 3
        p.aplicarModificador('convertir_seis_corrupto', 1); // Los 6 se convierten en dados corruptos
      };
    case 'pacto_filo_carmesí':
      return (p) => {
        p.aplicarModificador('dano_garantizado', 1); // +1 de daño garantizado al superar objetivo
        p.aplicarModificador('hp_por_fallo', -1); // Pierde 1 HP si falla el objetivo
      };
    case 'pacto_mentiroso':
      return (p) => {
        p.aplicarModificador('dados_extra', 1); // Puedes seleccionar 3 dados
        p.aplicarModificador('dados_tres_alto_corromper', 1); // Al seleccionar 3 dados, el más alto se vuelve corrupto
      };
    case 'pacto_avaricia':
      return (p) => {
        p.aplicarModificador('oro_por_piso', 10); // +10 de oro al terminar cada piso
        p.aplicarModificador('corrupcion_por_piso', 1); // +1 de corrupción permanente por piso
      };
    case 'pacto_titan':
      return (p) => {
        p.hpMax += 5; // +5 HP máximo
        p.aplicarModificador('aumentar_costo_extra', 1); // Aumentar cuesta +1 energía
      };
    case 'pacto_sombra':
      return (p) => {
        // Comienza cada piso con un dado bendito de valor 4
        // Esto se manejaría en la inicialización del piso
        p.aplicarModificador('dado_bendito_inicio', 1);
        // También comienza con 1 dado corrupto
        p.aplicarModificador('dado_corrupto_inicio', 1);
      };
    case 'pacto_cruel':
      return (p) => {
        p.aplicarModificador('relanzar_costo_cero', 1); // Relanzar cuesta 0 energía
        p.aplicarModificador('dano_relanzar_combate', 2); // Pierde 2 HP si usa Relanzar al menos una vez por combate
      };
    case 'pacto_abismo':
      return (p) => {
        p.aplicarModificador('bonus_suma_final', 3); // +3 a la suma final
        p.aplicarModificador('corrupcion_inicio_piso', 2); // Gana 2 de corrupción al iniciar cada piso
      };
    case 'pacto_cronista':
      return (p) => {
        p.aplicarModificador('energia_cada_tres_turnos', 1); // Cada 3 turnos, gana +1 energía
        p.aplicarModificador('relanzar_deshabilitado_inicio', 2); // Los 2 primeros usos de Relanzar están deshabilitados
      };
    case 'pacto_destino_invertido':
      return (p) => {
        p.aplicarModificador('voltear_costo_uno', 1); // Voltear cuesta 1 energía en lugar de 2
        p.aplicarModificador('dados_pares_menos_uno', 1); // Todos los dados pares pierden -1 valor al lanzarse
      };
    case 'pacto_ritual_prohibido':
      return (p) => {
        p.aplicarModificador('reliquia_fin_piso', 1); // Obtiene una reliquia aleatoria al final de cada piso
        p.aplicarModificador('corrupcion_por_reliquia', 1); // Cada reliquia obtenida inflige 1 de corrupción
      };
    case 'pacto_coleccionista':
      return (p) => {
        // +1 dado base permanente
        const { crearDadoBase } = require('../game/dice');
        const nuevoId = `d-extra-${Date.now()}`;
        // Esto se aplicaría en la inicialización
        p.aplicarModificador('dados_base_extra', 1);
        // El dado adicional es corrupto para siempre
        p.aplicarModificador('dados_base_extra_corrupto', 1);
      };
    case 'pacto_renacido':
      return (p) => {
        p.aplicarModificador('revivir_una_vez', 1); // Revive con 1 HP una vez por partida
        p.aplicarModificador('seis_corrupcion', 1); // Resultados de 6 se convierten en corrupción
      };
    case 'pacto_preparador':
      return (p) => {
        p.aplicarModificador('energia_inicio_maxima_extra', 1); // Empieza cada combate con energía máxima +1 temporal
        p.aplicarModificador('primera_habilidad_costo_extra', 1); // Primera habilidad cuesta +1 energía extra
      };
    case 'pacto_frio_eterno':
      return (p) => {
        p.aplicarModificador('cinco_seis_criticos', 1); // Resultados 5 y 6 cuentan como críticos
        p.aplicarModificador('dano_uno_directo', 1); // Resultados de 1 infligen 1 daño directo
      };
    case 'pacto_faro_oscuro':
      return (p) => {
        p.aplicarModificador('objetivo_menor', 2); // Objetivo numérico del combate baja en 2 puntos
        p.aplicarModificador('dano_fallo_combate', 2); // Pierde 2 HP cada vez que falla un combate
      };
    case 'pacto_sangre_eterna':
      return (p) => {
        p.aplicarModificador('curar_por_objetivo', 2); // Recupera 2 HP al superar objetivo
        p.aplicarModificador('hp_inicio_combate_temporal', -2); // Inicia cada combate con -2 HP temporal
      };
    case 'pacto_infierno_glorioso':
      return (p) => {
        p.aplicarModificador('cuatro_mas_criticos', 1); // Todos los lanzamientos de 4+ se consideran críticos
        p.aplicarModificador('corrupcion_inicio_piso', 3); // Empieza cada piso con 3 de corrupción
      };
    case 'pacto_vacio_viviente':
      return (p) => {
        p.aplicarModificador('seleccionar_tres_dados', 1); // Puede seleccionar siempre 3 dados
        p.aplicarModificador('corrupcion_fin_combate', 1); // Gana +1 de corrupción permanente al final de cada combate
      };
    case 'pacto_oraculo_silencioso':
      return (p) => {
        p.aplicarModificador('ver_proximos_dados', 3); // Ve previsualizados los valores de los próximos 3 dados
        p.aplicarModificador('relanzar_deshabilitado', 1); // No puede usar la habilidad Relanzar
      };
    case 'pacto_maquina_perfecta':
      return (p) => {
        p.aplicarModificador('aumentar_valor', 3); // Aumentar ahora suma +3 al dado objetivo
        p.aplicarModificador('aumentar_costo', 3); // Aumentar cuesta 3 de energía
      };
    case 'pacto_reina_dados':
      return (p) => {
        p.aplicarModificador('dado_mas_bajo_seis', 1); // Dado más bajo siempre se convierte en 6
        p.aplicarModificador('dado_mas_alto_corromper', 1); // Dado más alto se convierte en corrupto
      };
    case 'pacto_corazon_gris':
      return (p) => {
        p.aplicarModificador('no_morir_un_hp', 1); // No puede morir si tiene más de 1 HP
        const reduccion = Math.floor(p.hpMax * 0.4); // 40% de HP máximo
        p.hpMax = Math.max(1, p.hpMax - reduccion);
        p.hp = Math.min(p.hp, p.hpMax); // Asegurar que no tenga más HP del máximo
      };
    case 'pacto_eclipse':
      return (p) => {
        p.energiaMax += 4; // +4 energía máxima
        p.aplicarModificador('dano_inicio_turno', 2); // Pierde 2 HP al inicio de cada turno de combate
      };
    case 'pacto_engullidor':
      return (p) => {
        p.aplicarModificador('reliquia_cada_tres_combates', 1); // Cada 3 combates completados obtiene una reliquia legendaria
        p.aplicarModificador('dado_base_aleatorio_corromper', 1); // En cada combate, 1 dado base aleatorio se convierte en corrupto
      };
    case 'pacto_atlas_caido':
      return (p) => {
        p.aplicarModificador('objetivo_mitad_suficiente', 1); // Cumple el objetivo si alcanza al menos la mitad del valor requerido
        p.aplicarModificador('aumentar_voltear_deshabilitado', 1); // No puede usar Aumentar ni Voltear
      };
    case 'pacto_caos_absoluto':
      return (p) => {
        p.aplicarModificador('dados_corruptos_seis', 1); // Todos los dados corruptos cuentan como si fueran 6
        p.aplicarModificador('dados_corruptos_por_piso', 2); // Gana +2 dados corruptos adicionales por piso
      };
    default:
      return (p) => {}; // Pacto no reconocido, no hacer nada
  }
}

module.exports = {
  POOL_MEJORAS,
  POOL_PACTOS,
  generarOpciones,
  aplicarMejora,
};
