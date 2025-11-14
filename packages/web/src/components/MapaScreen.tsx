import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { socket } from '../socket';

const MapaScreen: React.FC = () => {
  const { state } = useGame();
  const { partidaState } = state;
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

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

  const handleOpenNodeModal = (nodoId: string) => {
    if (partidaState?.mapaActual?.nodoActual) return; // ya hay nodo elegido
    setSelectedNode(nodoId);
  };

  const handleConfirmNodeSelection = () => {
    if (selectedNode) {
      handleElegirNodo(selectedNode);
      setSelectedNode(null);
    }
  };

  const handleCloseModal = () => {
    setSelectedNode(null);
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

    if (tipo === 'combate') base = 'retro-button chunky-shadow';
    if (tipo === 'elite') base = 'retro-button retro-button-danger chunky-shadow';
    if (tipo === 'evento_pacto') base = 'retro-button retro-button-purple chunky-shadow';
    if (tipo === 'tienda') base = 'retro-button retro-button-success chunky-shadow';

    // Si este nodo es el elegido, podrías añadir algún modificador
    if (isSelected) {
      base += ' selected-nodo'; // si luego quieres estilizarlo en CSS
    }

    return base;
  };

  return (
    <div style={screenStyle}>
      <h2 style={{ fontSize: '1.8em', marginBottom: '10px' }}>PISO {mapaActual.piso}</h2>
      <p style={messageStyle}>{mensaje}</p>

      <h3 style={{ fontSize: '1.3em', margin: '15px 0' }}>Elige tu próximo camino:</h3>

      <div style={buttonContainerStyle}>
        {mapaActual.nodos.map((nodo) => {
          const isSelected = mapaActual.nodoActual === nodo.id;

          return (
            <button
              key={nodo.id}
              onClick={() => handleOpenNodeModal(nodo.id)}
              className={`${getButtonClass(nodo.tipo, isSelected)} responsive-button`}
              style={{ 
                minWidth: '150px', 
                padding: '20px 10px', 
                fontSize: '14px',
                margin: '5px'
              }}
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

      {/* Modal de selección de nodo */}
      {selectedNode && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>¿ESTÁS SEGURO?</h3>
              <button className="close-button retro-button" onClick={handleCloseModal}>X</button>
            </div>
            <div className="modal-body">
              <p>¿Quieres elegir este camino?</p>
              <div className="modal-actions">
                <button className="retro-button retro-button-danger chunky-shadow responsive-button" onClick={handleCloseModal}>
                  CANCELAR
                </button>
                <button className="retro-button retro-button-success chunky-shadow responsive-button" onClick={handleConfirmNodeSelection}>
                  CONFIRMAR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapaScreen;
