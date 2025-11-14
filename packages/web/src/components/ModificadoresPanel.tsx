import React from 'react';
import type { PartidaState } from '../contexts/GameContext';

interface ModificadoresPanelProps {
  partidaState: PartidaState | null;
}

const ModificadoresPanel: React.FC<ModificadoresPanelProps> = ({ partidaState }) => {
  if (!partidaState) {
    return (
      <div className="card-retro p-3 mb-3">
        <h5 className="text-retro text-center">MODIFICADORES ACTIVOS</h5>
        <p className="text-muted text-center">No hay partida activa</p>
      </div>
    );
  }

  // Obtener modificadores activos
  const modificadores = partidaState.modificadores || {};
  const pactosActivos = partidaState.pactosHechos || [];
  const dadosExtra = modificadores.dados_extra || 0;
  const ventajaObjetivo = modificadores.ventaja_objetivo || 0;
  const oroBonus = modificadores.oro_bonus || 0;

  return (
    <div className="card-retro p-3 mb-3 border-animated-retro">
      <h5 className="text-retro-primary text-center mb-3">MODIFICADORES ACTIVOS</h5>
      
      <div className="row g-2">
        <div className="col-6 col-md-4 col-lg-3">
          <div className="card bg-dark bg-opacity-25 h-100">
            <div className="card-body p-2">
              <h6 className="card-title text-warning">Dados Extra</h6>
              <p className="card-text text-center fs-5">{dadosExtra > 0 ? `+${dadosExtra}` : dadosExtra}</p>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-4 col-lg-3">
          <div className="card bg-dark bg-opacity-25 h-100">
            <div className="card-body p-2">
              <h6 className="card-title text-info">Ventaja Objetivo</h6>
              <p className="card-text text-center fs-5">{ventajaObjetivo > 0 ? `+${ventajaObjetivo}` : ventajaObjetivo}</p>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-4 col-lg-3">
          <div className="card bg-dark bg-opacity-25 h-10">
            <div className="card-body p-2">
              <h6 className="card-title text-success">Bonus Oro</h6>
              <p className="card-text text-center fs-5">{oroBonus}%</p>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-4 col-lg-3">
          <div className="card bg-dark bg-opacity-25 h-100">
            <div className="card-body p-2">
              <h6 className="card-title text-danger">Pactos Activos</h6>
              <p className="card-text text-center fs-5">{pactosActivos.length}</p>
            </div>
          </div>
        </div>
      </div>
      
      {pactosActivos.length > 0 && (
        <div className="mt-3">
          <h6 className="text-retro-warning">Pactos Activos:</h6>
          <div className="d-flex flex-wrap gap-2">
            {pactosActivos.map((pactoId, index) => (
              <span key={index} className="badge-retro badge-retro-danger text-truncate" style={{ maxWidth: '100%' }}>
                {pactoId}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModificadoresPanel;
