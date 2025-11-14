// Pactos Nivel 1
const POOL_PACTOS_NIVEL_1 = [
  { 
    id: 'pacto_vidente', 
    texto: 'Pacto del Vidente: +2 a todos tus lanzamientos. Cada piso pierdes 1 HP permanente.', 
    aplicar: (p) => { 
      p.aplicarModificador('ventaja_lanzamiento', 2); // +2 a todos los lanzamientos
      p.aplicarModificador('penalidad_piso_hp', 1); // Cada piso pierde 1 HP
    } 
  },
  { 
    id: 'pacto_caos', 
    texto: 'Pacto del Caos: Relanzar cuesta 0 energía. Cada combate ganas +1 dado corrupto.', 
    aplicar: (p) => { 
      p.aplicarModificador('relanzar_costo_cero', 1); // Relanzar cuesta 0 energía
      p.aplicarModificador('dado_corrupcion_victoria', 1); // +1 dado corrupto por victoria
    } 
  },
  { 
    id: 'pacto_ladron_almas', 
    texto: 'Pacto del Ladrón de Almas: +1 energía máxima. Pierdes 1 XP por piso.', 
    aplicar: (p) => { 
      p.energiaMax += 1;
      p.aplicarModificador('penalidad_piso_xp', 1); // Pierde 1 XP por piso
    } 
  },
  { 
    id: 'pacto_espejo_roto', 
    texto: 'Pacto del Espejo Roto: Tu primer dado siempre es 6. Tus dados pares se vuelven corruptos.', 
    aplicar: (p) => { 
      p.aplicarModificador('primer_dado_seis', 1); // El primer dado siempre es 6
      p.aplicarModificador('dados_pares_corrompidos', 1); // Los dados pares se vuelven corruptos
    } 
  },
];

// Pactos Nivel 2
const POOL_PACTOS_NIVEL_2 = [
  { 
    id: 'herencia_demoniaca', 
    texto: 'Herencia Demoníaca: +3 a la suma final. Empiezas cada combate con 2 corrupción.', 
    aplicar: (p) => { 
      p.aplicarModificador('bonus_suma_final', 3); // +3 a la suma final
      // Empieza cada combate con 2 dados corruptos (esto se aplicaría en cada nuevo combate)
    } 
  },
  { 
    id: 'regalo_vacio', 
    texto: 'Regalo del Vacío: Puedes seleccionar 3 dados. Tu HP máximo baja un 20%.', 
    aplicar: (p) => { 
      p.aplicarModificador('dados_extra', 1); // Permite seleccionar 3 dados
      const reduccion = Math.floor(p.hpMax * 0.2); // 20% de HP máximo
      p.hpMax -= reduccion;
      p.hp = Math.min(p.hp, p.hpMax); // Asegurar que no tenga más HP del máximo
    } 
  },
];

// Combinar todos los pactos
const POOL_PACTOS = [
  ...POOL_PACTOS_NIVEL_1,
  ...POOL_PACTOS_NIVEL_2
];

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

module.exports = {
  POOL_MEJORAS,
  POOL_PACTOS,
  POOL_PACTOS_NIVEL_1,
  POOL_PACTOS_NIVEL_2,
  generarOpciones,
  aplicarMejora,
};
