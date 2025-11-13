// game/map.js

function calcularXPParaNivel(nivel) {
  return 100 + (nivel * 25);
}

function calcularXPporEncuentro(tipo, pisoActual) {
  switch (tipo) {
    case 'normal': return 10 + (pisoActual * 2);
    case 'elite':  return 30 + (pisoActual * 3);
    case 'jefe':   return 100;
    default:       return 10 + (pisoActual * 2);
  }
}

function calcularObjetivoPiso(pisoActual) {
  return 5 + Math.floor(pisoActual / 2);
}

function generarEncuentro(piso, tipoNodo = 'normal') {
  let tipo = tipoNodo;

  // Forzar jefe/élite en ciertos pisos
  if (piso % 10 === 0 && tipo !== 'jefe') {
    tipo = 'jefe';
  } else if (piso % 5 === 0 && tipo !== 'elite' && tipo !== 'jefe') {
    tipo = 'elite';
  }

  const objetivo = calcularObjetivoPiso(piso);
  let danoFallo;
  let danoCranio;
  let recompensaOro;

  switch (tipo) {
    case 'elite':
      danoFallo = 3;
      danoCranio = 3;
      recompensaOro = 25 + Math.floor(piso / 2);
      break;
    case 'jefe':
      danoFallo = 5;
      danoCranio = 5;
      recompensaOro = 100;
      break;
    default: // normal
      danoFallo = 1;
      danoCranio = 2;
      recompensaOro = 10 + Math.floor(piso / 2);
  }

  return {
    nombre: `${tipo.charAt(0).toUpperCase() + tipo.slice(1)} Piso ${piso}`,
    tipo,
    objetivo,
    recompensaOro,
    recompensaXp: calcularXPporEncuentro(tipo, piso),
    danoFallo,
    danoCranio,
  };
}

/**
 * Genera el mapa de nodos para un piso.
 * 
 * @param {number} piso
 * @param {Object} [opciones]
 * @param {string[]} [opciones.excluirTipos] Lista de tipos a NO incluir (ej: ['tienda']).
 */
function generarMapa(piso, opciones = {}) {
  const { excluirTipos = [] } = opciones;

  // Pool base
  const basePool = [
    { id: `c-${piso}`, tipo: 'combate',       texto: 'Combate Normal' },
    { id: `e-${piso}`, tipo: 'elite',         texto: 'Combate Élite' },
    { id: `p-${piso}`, tipo: 'evento_pacto',  texto: 'Evento Misterioso' },
    { id: `t-${piso}`, tipo: 'tienda',        texto: 'Tienda' },
  ];

  // Filtrar tipos excluidos (por ejemplo, tienda o evento_pacto)
  const poolNodos = basePool.filter(
    (nodo) => !excluirTipos.includes(nodo.tipo)
  );

  // Siempre intentamos tener al menos un combate
  const nodoCombate =
    poolNodos.find((n) => n.tipo === 'combate') ||
    basePool.find((n) => n.tipo === 'combate');

  let opcionesNodos = [nodoCombate];

  // Nodos "especiales" (no combate) disponibles tras filtro
  const especiales = poolNodos.filter((n) => n.tipo !== 'combate');

  // Piso de tienda (cada 4) -> Combate + Tienda (si no está excluida)
  if (piso % 4 === 0) {
    const tienda = especiales.find((n) => n.tipo === 'tienda');
    if (tienda) {
      opcionesNodos = [nodoCombate, tienda];
    } else {
      // Si tienda está excluida o no existe, al menos combate + otro especial si hay
      if (especiales[0]) opcionesNodos = [nodoCombate, especiales[0]];
      else opcionesNodos = [nodoCombate];
    }
  }
  // Piso de élite/evento (cada 5) -> Élite + Evento (si están disponibles)
  else if (piso % 5 === 0) {
    const elite =
      poolNodos.find((n) => n.tipo === 'elite') || nodoCombate;
    const evento = especiales.find((n) => n.tipo === 'evento_pacto');

    opcionesNodos = [elite];
    if (evento) {
      opcionesNodos.push(evento);
    } else if (especiales.length > 0) {
      // si el evento está excluido, al menos elite + otro especial
      opcionesNodos.push(especiales[0]);
    }
  }
  // Piso normal -> Combate + 1 especial aleatorio si existe
  else {
    if (especiales.length > 0) {
      const mezclados = [...especiales].sort(() => 0.5 - Math.random());
      opcionesNodos.push(mezclados[0]);
    }
  }

  // Limpiar posibles undefined y mezclar el orden final
  const nodosFinal = opcionesNodos
    .filter(Boolean)
    .sort(() => 0.5 - Math.random());

  return {
    piso,
    nodos: nodosFinal,
    nodoActual: null,
  };
}

module.exports = {
  generarEncuentro,
  generarMapa,
  calcularXPParaNivel,
};
