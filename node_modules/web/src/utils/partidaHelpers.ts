import type { PartidaState } from '../contexts/GameContext';

/**
 * Helper functions para calcular valores derivados en el frontend
 * basados en el estado de la partida recibido del servidor
 */

export function getMaxDadosSeleccionables(partida: PartidaState): number {
  const dadosExtra = partida.modificadores['dados_extra'] || 0;
  return 2 + dadosExtra; // Por defecto se pueden seleccionar 2 dados, más los dados extra de las reliquias
}

export function getModificadorObjetivo(partida: PartidaState): number {
  return partida.modificadores['ventaja_objetivo'] || 0;
}

export function getPuedeRevivir(partida: PartidaState): boolean {
  const revivir = partida.modificadores['revivir'] || 0;
  return revivir > 0;
}

export function getDadosACambiar(partida: PartidaState): number {
  return partida.modificadores['cambio_dados'] || 0;
}

/**
 * Función para actualizar los valores derivados en el estado de la partida
 * que debe ser llamada cuando se recibe una actualización del servidor
 */
export function actualizarValoresDerivados(partida: PartidaState): PartidaState {
  return {
    ...partida,
    maxDadosSeleccionables: getMaxDadosSeleccionables(partida),
    modificadorObjetivo: getModificadorObjetivo(partida),
    puedeRevivir: getPuedeRevivir(partida),
    dadosACambiar: getDadosACambiar(partida)
  };
}
