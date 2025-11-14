import React from 'react';
import { useGame } from '../contexts/GameContext';
import styles from './Header.module.css';

const Header: React.FC = () => {
  const { state } = useGame();
  const { partidaState } = state;

  // Mantener altura fija aunque no haya partida
  if (!partidaState) {
    return (
      <header className={styles.header}>
        <h1 className={styles.titulo}>Detona Dice</h1>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '10px 20px',
            height: '70px',
            fontSize: '16px',
            color: 'var(--text-dim)',
          }}
        >
          Esperando partida…
        </div>
      </header>
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
    <header className={styles.header}>
      <h1 className={styles.titulo}>Detona Dice</h1>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          padding: '8px 16px',
          height: '70px',
          fontSize: '16px',
          gap: '16px',
        }}
      >
        {/* PISO */}
        <div>
          <span style={{ color: 'var(--color-accent-yellow)' }}>▲</span>{' '}
          <strong>PISO</strong>{' '}
          <span style={{ color: 'var(--color-accent-yellow)' }}>{piso}</span>
        </div>

        {/* HP (con barra) */}
        <div style={{ minWidth: '160px' }}>
          <div>
            <span style={{ color: 'var(--color-accent-red)' }}>♥</span>{' '}
            <strong>HP</strong>{' '}
            <span style={{ color: 'var(--color-accent-red)' }}>
              {hp}/{hpMax}
            </span>
          </div>
          <div className="status-bar">
            <div
              className={
                'status-bar-fill hp-fill' + (hpIsLow ? ' hp-low' : '')
              }
              style={{ width: `${hpPercent}%` }}
            />
          </div>
        </div>

        {/* ENERGÍA (con barra) */}
        <div style={{ minWidth: '160px' }}>
          <div>
            <span style={{ color: 'var(--color-accent-blue)' }}>⚡</span>{' '}
            <strong>ENERGÍA</strong>{' '}
            <span style={{ color: 'var(--color-accent-blue)' }}>
              {energia}/{energiaMax}
            </span>
          </div>
          <div className="status-bar">
            <div
              className="status-bar-fill energy-fill"
              style={{ width: `${energiaPercent}%` }}
            />
          </div>
        </div>

        {/* ORO */}
        <div>
          <span style={{ color: 'var(--color-accent-yellow)' }}>💰</span>{' '}
          <strong>ORO</strong>{' '}
          <span style={{ color: 'var(--color-accent-yellow)' }}>{oro} G</span>
        </div>

        {/* NIVEL + XP (con barra) */}
        <div style={{ minWidth: '220px' }}>
          <div>
            <span style={{ color: 'var(--color-accent-green)' }}>★</span>{' '}
            <strong>NIVEL {nivel}</strong>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
            {xp}/{xpParaNivel} XP
          </div>
          <div className="status-bar">
            <div
              className="status-bar-fill xp-fill"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
