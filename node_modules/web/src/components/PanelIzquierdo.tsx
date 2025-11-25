import React from 'react';
import { useGame } from '../contexts/GameContext';
import { socket } from '../socket';
import DadoComponent from './DadoComponent';

const PanelIzquierdo: React.FC = () => {
  const { state } = useGame();
  const { partidaState, nick } = state;

  if (!partidaState) {
    return (
      <div className="h-100 d-flex flex-column">
        <h3 className="text-retro-primary mb-3">DETONA DICE</h3>
        <p className="text-center text-muted">Esperando partida...</p>
      </div>
    );
  }

  const { piso, nivel, reliquias, consumibles, dadosBase, dadosCorrupcion } = partidaState;

  const handleUsarConsumible = (itemId: string) => {
    socket.emit('cliente:usar_consumible', { itemId });
  };

  // === Estado de juego simplificado ===
  const estadoLabelMap: Record<string, string> = {
    combate: 'COMBATE',
    mapa: 'MAPA',
    subiendo_nivel: 'SUBIDA DE NIVEL',
    evento_pacto: 'PACTO',
    tienda: 'TIENDA',
    eliminado: 'ELIMINADO',
  };

  const estadoColorMap: Record<string, string> = {
    combate: '#f44336',
    mapa: '#2196f3',
    subiendo_nivel: '#4caf50',
    evento_pacto: '#b84dff',
    tienda: '#ff9800',
    eliminado: '#6c757d',
  };

  const estadoLabel =
    estadoLabelMap[partidaState.estadoJuego] ?? partidaState.estadoJuego;

  const estadoColor =
    estadoColorMap[partidaState.estadoJuego] ?? '#e0e0e0';

  return (
    <div className="h-100 d-flex flex-column">
      <div className="mb-3">
        <h4 className="text-retro-primary mb-2">{nick}</h4>
        <div className="d-flex justify-content-between mb-2">
          <span className="badge-retro badge-retro-warning">Piso {piso}</span>
          <span className="badge-retro badge-retro-success">Nivel {nivel}</span>
        </div>
        <div className="text-center mb-2" style={{ color: estadoColor, textTransform: 'uppercase', fontWeight: 'bold' }}>
          {estadoLabel}
        </div>
      </div>

      {/* DADOS */}
      <div className="mb-3">
        <h5 className="text-retro text-center mb-2">TUS DADOS</h5>
        <div className="d-flex flex-wrap justify-content-center gap-2">
          {dadosBase.map((dado) => (
            <DadoComponent
              key={dado.id}
              dado={dado}
              isSelected={false}
              onClick={() => {}}
              disabled={true}
              animationState="none"
            />
          ))}
          {dadosCorrupcion.map((dado) => (
            <DadoComponent
              key={dado.id}
              dado={dado}
              isSelected={false}
              onClick={() => {}}
              disabled={true}
              animationState="none"
            />
          ))}
        </div>
      </div>

      {/* RESUMEN */}
      <div className="mb-3">
        <div className="card-retro p-3 text-center">
          <div className="fw-bold">Accion principal</div>
          <div className="text-muted" style={{ fontSize: '0.9rem' }}>
            Gestiona energia y habilidades en el tablero central para mantener esta columna limpia.
          </div>
        </div>
      </div>

      {/* RELIQUIAS */}
      <div className="mb-3">
        <h5 className="text-retro text-center mb-2">RELIQUIAS ({reliquias.length})</h5>
        <div className="d-flex flex-wrap gap-2 justify-content-center">
          {reliquias.length === 0 ? (
            <div className="text-center text-muted fst-italic">Ninguna</div>
          ) : (
            reliquias.map((reliquia, idx) => (
              <span key={idx} className="badge-retro badge-retro-info" style={{fontSize: '0.8rem'}}>
                {reliquia}
              </span>
            ))
          )}
        </div>
      </div>

      {/* INVENTARIO DE CONSUMIBLES */}
      <div>
        <h5 className="text-retro text-center mb-2">INVENTARIO ({consumibles?.length || 0})</h5>
        <div className="d-flex flex-column gap-2 max-h-100 overflow-auto">
          {(consumibles && consumibles.length > 0) ? (
            consumibles.map((itemId, idx) => (
              <div key={idx} className="d-flex justify-content-between align-items-center card-retro p-2">
                <span className="flex-grow-1 me-2">{itemId}</span>
                <button
                  className="btn-retro btn-retro-sm btn-retro-success"
                  onClick={() => handleUsarConsumible(itemId)}
                >
                  Usar
                </button>
              </div>
            ))
          ) : (
            <div className="text-center text-muted fst-italic">Vacío</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PanelIzquierdo;
