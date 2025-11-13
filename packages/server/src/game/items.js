// src/game/items.js

const POOL_ITEMS = [
  {
    id: 'pocion_pequena',
    nombre: 'Poción Pequeña',
    tipo: 'consumible',
    precio: 20,
    descripcion: 'Cura 8 HP cuando se usa.',
    usar(partida) {
      partida.hp = Math.min(partida.hp + 8, partida.hpMax);
    },
  },
  {
    id: 'amuleto_energia',
    nombre: 'Amuleto de Energía',
    tipo: 'reliquia',
    precio: 50,
    descripcion: '+1 Energía máxima permanente.',
    aplicarPasivo(partida) {
      partida.energiaMax += 1;
    },
  },
  {
    id: 'bolsa_oro',
    nombre: 'Bolsa Misteriosa',
    tipo: 'instantaneo',
    precio: 30,
    descripcion: 'Ganas 40 de Oro al comprar.',
    aplicarInstantaneo(partida) {
      partida.oro += 40;
    },
  },
];

function generarTienda(piso) {
  const poolMezclado = [...POOL_ITEMS].sort(() => 0.5 - Math.random());
  const items = poolMezclado.slice(0, 3); // 3 ítems en tienda
  return {
    tipo: 'normal',
    piso,
    items,
  };
}

function encontrarItemEnTienda(partida, itemId) {
  if (!partida.tiendaActual) return null;
  return partida.tiendaActual.items.find((item) => item.id === itemId) || null;
}

function comprarItem(partida, itemId) {
  const item = encontrarItemEnTienda(partida, itemId);
  if (!item) return { ok: false, error: 'Item no encontrado en tienda' };
  if (partida.oro < item.precio) return { ok: false, error: 'Oro insuficiente' };

  partida.oro -= item.precio;

  if (item.tipo === 'instantaneo' && item.aplicarInstantaneo) {
    item.aplicarInstantaneo(partida);
  } else if (item.tipo === 'reliquia') {
    partida.reliquias.push(item.id);
    if (item.aplicarPasivo) item.aplicarPasivo(partida);
  } else if (item.tipo === 'consumible') {
    partida.consumibles.push(item.id);
  }

  // opcional: quitar el ítem de la tienda
  partida.tiendaActual.items = partida.tiendaActual.items.filter((i) => i.id !== itemId);

  return { ok: true, item };
}

module.exports = {
  POOL_ITEMS,
  generarTienda,
  comprarItem,
};
