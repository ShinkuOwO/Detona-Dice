// src/game/items.js

// Definición base de ítems
const POOL_ITEMS = [
  // Consumibles
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
    id: 'dado_calavera',
    nombre: 'Dado Calavera',
    tipo: 'consumible',
    costoBase: 50,
    descripcion: 'Convierte un dado normal en un dado corrupto con valor 8.',
    usar(partida) {
      // Buscar un dado normal para convertirlo
      const dadoNormalIndex = partida.dadosBase.findIndex(d => !d.esCorrupto);
      if (dadoNormalIndex !== -1) {
        const dadoNormal = partida.dadosBase[dadoNormalIndex];
        const nuevoDado = {
          id: `dc-${partida.dadosCorrupcion.length + 1}`,
          valor: 8,
          esCorrupto: true
        };
        partida.dadosBase.splice(dadoNormalIndex, 1);
        partida.dadosCorrupcion.push(nuevoDado);
      }
    },
  },
  {
    id: 'dado_bendito',
    nombre: 'Dado Bendito',
    tipo: 'consumible',
    costoBase: 60,
    descripcion: 'Rellena la energía al máximo.',
    usar(partida) {
      partida.energia = partida.energiaMax;
    },
  },

  // Reliquias
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
  {
    id: 'reliquia_dados_extra',
    nombre: 'Guanteletes de Dados',
    tipo: 'reliquia',
    costoBase: 10,
    descripcion: 'Permite seleccionar hasta 3 dados en combate.',
    aplicarReliquia(partida) {
      partida.aplicarModificador('dados_extra', 1);
    },
  },
  {
    id: 'reliquia_energia_plus',
    nombre: 'Batería Mística',
    tipo: 'reliquia',
    costoBase: 90,
    descripcion: '+2 Energía Máxima',
    aplicarReliquia(partida) {
      partida.energiaMax += 2;
    },
  },
  {
    id: 'reliquia_cambio_dados',
    nombre: 'Caja de Dados',
    tipo: 'reliquia',
    costoBase: 150,
    descripcion: 'Permite cambiar dados corruptos por normales.',
    aplicarReliquia(partida) {
      partida.aplicarModificador('cambio_dados', 1);
    },
  },
  {
    id: 'reliquia_ventaja',
    nombre: 'Ojo de Horus',
    tipo: 'reliquia',
    costoBase: 200,
    descripcion: 'Reduce el objetivo del enemigo en 2.',
    aplicarReliquia(partida) {
      partida.aplicarModificador('ventaja_objetivo', -2);
    },
  },
  {
    id: 'reliquia_rescate',
    nombre: 'Amuleto de Rescate',
    tipo: 'reliquia',
    costoBase: 180,
    descripcion: 'Revive con 1 HP si mueres.',
    aplicarReliquia(partida) {
      partida.aplicarModificador('revivir', 1);
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
