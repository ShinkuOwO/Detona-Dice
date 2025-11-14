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

function generarMapa(piso) {
  const nodos = [];

  // Piso de jefe → no hay mapa, el frontend puede usar solo el combate forzado
  if (piso % 10 === 0) {
    return {
      piso,
      nodos: [
        {
          id: `j-${piso}`,
          tipo: 'jefe',
          texto: 'JEFE DEL PISO',
        },
      ],
      nodoActual: null,
    };
  }

  // Piso de tienda garantizada cada 4 (pero no en jefe)
  const pisoDeTienda = piso % 4 === 0;
  const pisoDeElite = piso % 5 === 0;

  if (pisoDeElite) {
    // Élite o Evento
    nodos.push(
      {
        id: `e-${piso}`,
        tipo: 'elite',
        texto: 'Combate Élite',
      },
      {
        id: `p-${piso}`,
        tipo: 'evento_pacto',
        texto: 'Evento Misterioso',
      },
    );
  } else if (pisoDeTienda) {
    // Combate o Tienda
    nodos.push(
      {
        id: `c-${piso}`,
        tipo: 'combate',
        texto: 'Combate Normal',
      },
      {
        id: `t-${piso}`,
        tipo: 'tienda',
        texto: 'Tienda',
      },
    );
  } else {
    // Caso general: 2–3 caminos con al menos 1 combate
    nodos.push({
      id: `c-${piso}`,
      tipo: 'combate',
      texto: 'Combate Normal',
    });

    const numExtras = Math.random() < 0.6 ? 2 : 1;
    for (let i = 0; i < numExtras; i++) {
      const tipo = elegirTipoNodoAleatorio();
      nodos.push({
        id: `${tipo[0]}-${piso}-${i}`,
        tipo,
        texto:
          tipo === 'elite'
            ? 'Combate Élite'
            : tipo === 'evento_pacto'
              ? 'Evento Misterioso'
              : tipo === 'tienda'
                ? 'Tienda'
                : 'Combate Normal',
      });
    }
  }

  // Mezclar orden
  nodos.sort(() => 0.5 - Math.random());

  return {
    piso,
    nodos,
    nodoActual: null,
  };
}

module.exports = {
  generarEncuentro,
  generarMapa,
  calcularXPParaNivel,
};
