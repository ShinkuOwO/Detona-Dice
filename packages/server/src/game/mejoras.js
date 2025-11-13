const POOL_MEJORAS = [
  { id: 'hp_max_5', texto: '+5 HP Máximo', aplicar: (p) => { p.hpMax += 5; p.hp += 5; } },
  { id: 'energia_max_1', texto: '+1 Energía Máxima', aplicar: (p) => { p.energiaMax += 1; } },
  { id: 'oro_50', texto: 'Gana 50 Oro', aplicar: (p) => { p.oro += 50; } },
  { id: 'curar_10', texto: 'Cura 10 HP', aplicar: (p) => { p.hp = Math.min(p.hp + 10, p.hpMax); } },
];

const POOL_PACTOS = [
  { id: 'pacto_energia', texto: '+1 Energía Máxima (+1 Corrupción)', aplicar: (p) => { p.energiaMax += 1; } },
  { id: 'pacto_oro_100', texto: 'Gana 100 Oro (+1 Corrupción)', aplicar: (p) => { p.oro += 100; } },
  { id: 'pacto_hp_max_10', texto: '+10 HP Máximo (+1 Corrupción)', aplicar: (p) => { p.hpMax += 10; p.hp += 10; } },
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
  generarOpciones,
  aplicarMejora,
};
