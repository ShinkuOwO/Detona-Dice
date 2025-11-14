// src/game/map.js

// Escalado de XP
function calcularXPParaNivel(nivel) {
  return 100 + nivel * 35; // sube un poco más fuerte
}

function calcularXPporEncuentro(tipo, pisoActual) {
  switch (tipo) {
    case 'normal':
      return 10 + pisoActual * 3;
    case 'elite':
      return 40 + pisoActual * 4;
    case 'jefe':
      return 120 + pisoActual * 5;
    default:
      return 10 + pisoActual * 3;
  }
}

// Escalado del objetivo
function calcularObjetivoPiso(pisoActual, tipo = 'normal') {
  let base = 6 + pisoActual; // antes era 5 + piso/2

  if (tipo === 'elite') base += 3;
  if (tipo === 'jefe') base += 5;

  return base;
}

function generarEncuentro(piso, tipoNodo = 'normal', numDadosCorrupcion = 0) {
  let tipo = tipoNodo;

  // Forzar jefe en pisos clave
  if (piso % 10 === 0 && tipo !== 'jefe') tipo = 'jefe';
  else if (piso % 5 === 0 && tipo !== 'elite' && tipo !== 'jefe') tipo = 'elite';

  const objetivo = calcularObjetivoPiso(piso, tipo);

  let danoFallo;
  let danoCranio;
  let recompensaOro;

  switch (tipo) {
    case 'elite':
      danoFallo = 3 + Math.floor(piso / 4);
      danoCranio = 4 + Math.floor(piso / 3);
      recompensaOro = 35 + Math.floor(piso * 1.5);
      break;

    case 'jefe':
      danoFallo = 5 + Math.floor(piso / 3);
      danoCranio = 8 + Math.floor(piso / 2); // muy peligroso
      recompensaOro = 100 + piso * 3;
      break;

    default:
      danoFallo = 1 + Math.floor(piso / 5);
      danoCranio = 2 + Math.floor(piso / 4);
      recompensaOro = 12 + Math.floor(piso * 1.2);
  }

  // Corrupción extra: cada dado corrupto aumenta daño de cráneo
  const danoExtraPorCorrupcion = numDadosCorrupcion > 0 ? numDadosCorrupcion : 0;

  return {
    nombre: `${tipo.charAt(0).toUpperCase() + tipo.slice(1)} Piso ${piso}`,
    tipo,
    objetivo,
    recompensaOro,
    recompensaXp: calcularXPporEncuentro(tipo, piso),
    danoFallo,
    danoCranio: danoCranio + danoExtraPorCorrupcion,
  };
}

// Probabilidades base de nodos aleatorios (sin pisos especiales)
const PESOS_NODOS = {
  combate: 0.5,
  elite: 0.15,
  evento_pacto: 0.2,
  tienda: 0.15,
};

function elegirTipoNodoAleatorio() {
  const r = Math.random();
  let acumulado = 0;

  for (const [tipo, peso] of Object.entries(PESOS_NODOS)) {
    acumulado += peso;
    if (r <= acumulado) return tipo;
  }
  return 'combate';
}

function generarMapa(piso, numCorr = 0) {
  const nodos = [];

  // COMBATE SIEMPRE
  nodos.push({
    id: `c-${piso}`,
    tipo: 'combate',
    texto: 'Combate',
  });

  // PROBABILIDADES MODERNAS
  const roll = Math.random();

  // Jefe cada 10 pisos
  if (piso % 10 === 0) {
    nodos.push({
      id: `j-${piso}`,
      tipo: 'elite',
      texto: 'Jefe / Élite',
    });
  } else {
    // 20% evento
    if (roll < 0.2) {
      nodos.push({
        id: `p-${piso}`,
        tipo: 'evento_pacto',
        texto: 'Evento Misterioso',
      });
    }
    // 10% tienda
    else if (roll < 0.3) {
      nodos.push({
        id: `t-${piso}`,
        tipo: 'tienda',
        texto: 'Tienda',
      });
    }
    // 20% elite si tienes corrupción alta
    else if (roll < 0.5 && numCorr >= 2) {
      nodos.push({
        id: `e-${piso}`,
        tipo: 'elite',
        texto: 'Élite',
      });
    } 
    // default: combate extra
    else {
      nodos.push({
        id: `c2-${piso}`,
        tipo: 'combate',
        texto: 'Combate',
      });
    }
  }

  return {
    piso,
    nodos: nodos.sort(() => 0.5 - Math.random()),
    nodoActual: null,
  };
}


module.exports = {
  generarEncuentro,
  generarMapa,
  calcularXPParaNivel,
};
