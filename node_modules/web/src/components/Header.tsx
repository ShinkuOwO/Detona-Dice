import React from 'react';
import { useGame } from '../contexts/GameContext';

const Header: React.FC = () => {
  const { state } = useGame();
  const { partidaState, nick } = state;

  // Mantener altura fija aunque no haya partida
  if (!partidaState) {
    return (
      <div className="d-flex justify-content-between align-items-center w-100 px-3 py-2">
        <h3 className="text-retro-primary mb-0">DETONA DICE</h3>
        <div className="text-center text-warning">
          <p className="mb-0">Esperando partida...</p>
        </div>
        <div className="text-end">
          <span className="badge-retro badge-retro-info">{nick || 'JUGADOR'}</span>
        </div>
      </div>
    );
  }

  const { piso, hp, hpMax, oro, energia, energiaMax, nivel, xp, xpParaNivel } =
    partidaState;

  const hpPercent = Math.max(0, Math.min(100, (hp / hpMax) * 100));
  const energiaPercent = Math.max(
    0,
    Math.min(100, (energia / energiaMax) * 100)
  );
  const xpPercent = Math.max(0, Math.min(100, (xp / xpParaNivel) * 100));

  const hpIsLow = hp / hpMax <= 0.25; // para animación de peligro

  return (
    <div className="d-flex justify-content-between align-items-center w-100 px-3 py-2">
      <h3 className="text-retro-primary mb-0">DETONA DICE</h3>
      
      <div className="d-flex align-items-center gap-4">
        {/* PISO */}
        <div className="text-center">
          <div className="text-warning fw-bold">PISO</div>
          <div className="text-warning fs-4">{piso}</div>
        </div>

        {/* HP (con barra) */}
        <div style={{ minWidth: '140px' }}>
          <div className="d-flex justify-content-between">
            <span className="text-danger">♥ HP</span>
            <span className="text-danger">{hp}/{hpMax}</span>
          </div>
          <div className="progress-retro" style={{ height: '10px' }}>
            <div
              className="progress-retro-bar"
              style={{ width: `${hpPercent}%`, backgroundColor: hpIsLow ? '#ff444' : '#4CAF50' }}
            />
          </div>
        </div>

        {/* ENERGÍA (con barra) */}
        <div style={{ minWidth: '140px' }}>
          <div className="d-flex justify-content-between">
            <span className="text-primary">⚡ ENERGÍA</span>
            <span className="text-primary">{energia}/{energiaMax}</span>
          </div>
          <div className="progress-retro" style={{ height: '10px' }}>
            <div
              className="progress-retro-bar"
              style={{ width: `${energiaPercent}%`, backgroundColor: '#2196F3' }}
            />
          </div>
        </div>

        {/* ORO */}
        <div className="text-center">
          <div className="text-warning fw-bold">ORO</div>
          <div className="text-warning fs-4">{oro}G</div>
        </div>

        {/* NIVEL + XP (con barra) */}
        <div style={{ minWidth: '160px' }}>
          <div className="d-flex justify-content-between">
            <span className="text-success">★ NIVEL {nivel}</span>
          </div>
          <div className="d-flex justify-content-between text-muted" style={{ fontSize: '0.8rem' }}>
            <span>{xp}</span>
            <span>{xpParaNivel} XP</span>
          </div>
          <div className="progress-retro" style={{ height: '10px' }}>
            <div
              className="progress-retro-bar"
              style={{ width: `${xpPercent}%`, backgroundColor: '#4CAF50' }}
            />
          </div>
        </div>
      </div>
      
      <div className="text-end">
        <span className="badge-retro badge-retro-info">{nick || 'JUGADOR'}</span>
      </div>
    </div>
  );
};

export default Header;
