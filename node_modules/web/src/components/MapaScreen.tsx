import React from 'react';
import { useGame } from '../contexts/GameContext';
import { socket } from '../socket';

const MapaScreen: React.FC = () => {
  const { state } = useGame();
  const { partidaState } = state;

  // Si no hay partida o no estamos en mapa, mostramos algo neutro
  if (!partidaState || partidaState.estadoJuego !== 'mapa') {
    return <div>Generando mapa...</div>;
  }

  const { mapaActual, mensaje } = partidaState;

  if (!mapaActual) {
    return <div>Generando mapa...</div>;
  }

  const handleElegirNodo = (nodoId: string) => {
  if (partidaState?.mapaActual?.nodoActual) return; // ya hay nodo elegido
  socket.emit('cliente:elegir_nodo_mapa', { nodoId });
};

  const screenStyle: React.CSSProperties = {
    padding: '20px',
    textAlign: 'center',
  };

  const messageStyle: React.CSSProperties = {
    color: 'var(--text-dim)',
    minHeight: '24px',
    fontStyle: 'italic',
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginTop: '30px',
    flexWrap: 'wrap',
  };

  const getButtonClass = (tipo: string, isSelected: boolean) => {
    let base = 'retro-button chunky-shadow';

    if (tipo === 'elite') base = 'retro-button danger chunky-shadow';
    if (tipo === 'tienda') base = 'retro-button success chunky-shadow';
    // evento_pacto podría tener su propia clase púrpura si la defines

    // Si este nodo es el elegido, podrías añadir algún modificador
    if (isSelected) {
      base += ' selected-nodo'; // si luego quieres estilizarlo en CSS
    }

    return base;
  };

  return (
    <div style={screenStyle}>
      <h2>PISO {mapaActual.piso}</h2>
      <p style={messageStyle}>{mensaje}</p>

      <h3>Elige tu próximo camino:</h3>

      <div style={buttonContainerStyle}>
        {mapaActual.nodos.map((nodo) => {
          const isSelected = mapaActual.nodoActual === nodo.id;

          return (
            <button
              key={nodo.id}
              onClick={() => handleElegirNodo(nodo.id)}
              className={getButtonClass(nodo.tipo, isSelected)}
              style={{ minWidth: '170px', padding: '25px' }}
              disabled={!!mapaActual.nodoActual && !isSelected} // solo clic antes de elegir
            >
              {/* Si quieres reactivar los iconos temáticos, puedes descomentar esto */}
              {/* {nodo.tipo === 'combate' && '⚔️ '}
              {nodo.tipo === 'elite' && '🔥 '}
              {nodo.tipo === 'evento_pacto' && '❓ '}
              {nodo.tipo === 'tienda' && '💰 '} */}
              {nodo.texto}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MapaScreen;
