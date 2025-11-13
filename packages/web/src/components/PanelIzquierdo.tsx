import React from 'react';
import { useGame } from '../contexts/GameContext';

const PanelIzquierdo: React.FC = () => {
  const { state } = useGame();
  const { partidaState, nick } = state;

  if (!partidaState) {
    return (
      <div style={{ padding: '15px' }}>
        <h3>DETONA DICE</h3>
        <p style={{ color: 'var(--text-dim)' }}>Esperando partida...</p>
      </div>
    );
  }

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
    combate: 'var(--color-accent-red)',
    mapa: 'var(--color-accent-blue)',
    subiendo_nivel: 'var(--color-accent-green)',
    evento_pacto: '#b84dff',
    tienda: 'var(--color-accent-yellow)',
    eliminado: 'var(--text-dim)',
  };

  const estadoLabel =
    estadoLabelMap[partidaState.estadoJuego] ?? partidaState.estadoJuego;

  const estadoColor =
    estadoColorMap[partidaState.estadoJuego] ?? 'var(--text-light)';

  // === Estilos rápidos ===
  const section: React.CSSProperties = {
    marginBottom: '16px',
  };

  const list: React.CSSProperties = {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  };

  const item: React.CSSProperties = {
    marginBottom: '4px',
    fontSize: '14px',
    color: 'var(--text-light)',
  };

  const dim: React.CSSProperties = {
    ...item,
    color: 'var(--text-dim)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      
      {/* --- HEADER DEL PANEL --- */}
      <div style={{ ...section, textAlign: 'center' }}>
        <h3 style={{ margin: 0, color: 'var(--color-accent-yellow)' }}>
          {nick}
        </h3>

        <div
          style={{
            marginTop: '6px',
            fontSize: '12px',
            color: 'var(--text-dim)',
          }}
        >
          Piso{' '}
          <span style={{ color: 'var(--color-accent-yellow)' }}>
            {partidaState.piso}
          </span>{' '}
          ·{' '}
          <span style={{ color: estadoColor, textTransform: 'uppercase' }}>
            {estadoLabel}
          </span>
        </div>
      </div>

      <hr style={{ borderColor: 'var(--color-panel-border)', margin: '8px 0' }} />

      {/* --- HABILIDADES DE DADO --- */}
      <div style={section}>
        <h4 style={{ marginBottom: '8px' }}>HABILIDADES</h4>
        <ul style={list}>
          <li style={item}>
            [+] Aumentar — <span style={{ color: 'var(--color-accent-blue)' }}>1⚡</span>
          </li>
          <li style={item}>
            [⇄] Voltear — <span style={{ color: 'var(--color-accent-blue)' }}>2⚡</span>
          </li>
          <li style={item}>
            [↻] Relanzar — <span style={{ color: 'var(--color-accent-blue)' }}>1⚡</span>
          </li>
        </ul>
      </div>

      <hr style={{ borderColor: 'var(--color-panel-border)', margin: '8px 0' }} />

      {/* --- PACTOS --- */}
      <div style={section}>
        <h4 style={{ marginBottom: '8px' }}>
          PACTOS ({partidaState.pactosHechos.length})
        </h4>
        <ul style={list}>
          {partidaState.pactosHechos.length === 0 && (
            <li style={dim}>Ninguno</li>
          )}
          {partidaState.pactosHechos.map((_p, i) => (
            <li
              key={i}
              style={{
                ...item,
                color: 'var(--color-accent-red)',
                fontWeight: 'bold',
              }}
            >
              +1 Dado de Corrupción
            </li>
          ))}
        </ul>
      </div>

      <hr style={{ borderColor: 'var(--color-panel-border)', margin: '8px 0' }} />

      {/* --- RELIQUIAS --- */}
      <div style={{ ...section, marginBottom: 0, flex: 1 }}>
        <h4 style={{ marginBottom: '8px' }}>
          RELIQUIAS ({partidaState.reliquias.length})
        </h4>
        <ul style={list}>
          {partidaState.reliquias.length === 0 && <li style={dim}>Ninguna</li>}
          {/* futuro: mapear reliquias */}
        </ul>
      </div>
    </div>
  );
};

export default PanelIzquierdo;
