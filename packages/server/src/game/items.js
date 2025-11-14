// src/game/items.js

// Definición base de ítems
const POOL_ITEMS = [
  {
    id: 'pocion_pequena',
    nombre: 'Poción Pequeña',
    tipo: 'consumible',
    costoBase: 20,
    descripcion: 'Cura 8 HP.',
    usar(partida) {
      partida.hp = Math.min(partida.hp + 8, partida.hpMax);
    },
  },
  {
    id: 'pocion_grande',
    nombre: 'Poción Grande',
    tipo: 'consumible',
    costoBase: 35,
    descripcion: 'Cura 16 HP.',
    usar(partida) {
      partida.hp = Math.min(partida.hp + 16, partida.hpMax);
    },
  },
  {
    id: 'filtro_corrupcion',
    nombre: 'Filtro de Corrupción',
    tipo: 'consumible',
    costoBase: 40,
    descripcion: 'Elimina 1 dado corrupto (si existe).',
    usar(partida) {
      if (partida.dadosCorrupcion.length > 0) {
        partida.dadosCorrupcion.pop();
      }
    },
  },
  {
    id: 'amulet_anticraneo',
    nombre: 'Amuleto Anti-Cráneo',
    tipo: 'reliquia',
    costoBase: 50,
    descripcion: 'Reduce en 2 el daño por CRÁNEO.',
    aplicarReliquia(partida) {
      partida.aplicarModificador('reduccion_dano_craneo', 2);
    },
  },
  {
    id: 'bolsa_dados',
    nombre: 'Bolsa de Dados',
    tipo: 'reliquia',
    costoBase: 60,
    descripcion: '+1 dado base permanente.',
    aplicarReliquia(partida) {
      const nuevoId = `d-extra-${partida.dadosBase.length + 1}`;
      partida.dadosBase.push({
        id: nuevoId,
        valor: null,
        esCorrupto: false,
      });
    },
  },
  {
    id: 'reliquia_vida',
    nombre: 'Amuleto de Vida',
    tipo: 'reliquia',
    costoBase: 10,
    descripcion: '+5 HP Máximo',
    aplicarReliquia(partida) {
      partida.aplicarReliquia('reliquia_vida');
    },
  },
  {
    id: 'reliquia_energia',
    nombre: 'Cristal de Energía',
    tipo: 'reliquia',
    costoBase: 80,
    descripcion: '+1 Energía Máxima',
    aplicarReliquia(partida) {
      partida.aplicarReliquia('reliquia_energia');
    },
  },
  {
    id: 'reliquia_oro',
    nombre: 'Ídolo Dorado',
    tipo: 'reliquia',
    costoBase: 120,
    descripcion: '+10% Oro adicional',
    aplicarReliquia(partida) {
      partida.aplicarReliquia('reliquia_oro');
    },
  },
];

// Genera una tienda para el piso actual
function generarTienda(piso) {
  // La tienda ofrece 3 items aleatorios, con costo escalado
  const poolMezclado = [...POOL_ITEMS].sort(() => 0.5 - Math.random());
  const seleccion = poolMezclado.slice(0, 3);

  return seleccion.map((item) => ({
    id: item.id,
    nombre: item.nombre,
    tipo: item.tipo,
    descripcion: item.descripcion,
    costo: item.costoBase + piso * 3, // escalar por piso
  }));
}

// Compra de ítem desde la tienda
function comprarItem(partida, itemId) {
  if (!partida.tiendaActual) {
    return { ok: false, error: 'No hay tienda activa' };
  }

  const oferta = partida.tiendaActual.find((i) => i.id === itemId);
  if (!oferta) {
    return { ok: false, error: 'Item no disponible en esta tienda' };
  }

  if (partida.oro < oferta.costo) {
    return { ok: false, error: 'Oro insuficiente' };
  }

  partida.oro -= oferta.costo;

  const itemDef = POOL_ITEMS.find((i) => i.id === itemId);
  if (!itemDef) {
    return { ok: false, error: 'Item inválido' };
  }

  if (itemDef.tipo === 'consumible') {
    if (!Array.isArray(partida.consumibles)) {
      partida.consumibles = [];
    }
    partida.consumibles.push(itemDef.id);
  } else if (itemDef.tipo === 'reliquia') {
    if (!Array.isArray(partida.reliquias)) {
      partida.reliquias = [];
    }
    partida.reliquias.push(itemDef.id);
    if (typeof itemDef.aplicarReliquia === 'function') {
      itemDef.aplicarReliquia(partida);
    }
  }

  return { ok: true, item: oferta };
}

module.exports = {
  POOL_ITEMS,
  generarTienda,
  comprarItem,
};
