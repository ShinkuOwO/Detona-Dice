import React from 'react';
import { useGame } from '../contexts/GameContext';
import { socket } from '../socket';

const ResultsScreen: React.FC = () => {
  const { state, dispatch } = useGame();
  const { resultadosFinales } = state;

  const handleVolverAlLobby = () => {
    // Avisamos al servidor que volvemos al lobby
    socket.emit('cliente:volver_al_lobby');
    // Limpiamos el estado de partida / resultados en el front
    dispatch({ type: 'RESETEAR_JUEGO' });
    // 'servidor:sala_actualizada' lo escucha App.tsx y actualiza la sala
  };

  const resultadosOrdenados = [...(resultadosFinales ?? [])].sort(
    (a, b) => b.piso - a.piso || b.hp - a.hp
  );

  return (
    <div
      className="retro-panel"
      style={{
        minHeight: '100vh',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
      }}
    >
      <h1 style={{ fontSize: '36px', color: 'var(--color-accent-yellow)', margin: 0 }}>
        RESULTADOS FINALES
      </h1>

      {resultadosOrdenados.length === 0 && (
        <p style={{ color: 'var(--text-dim)' }}>
          No hay resultados disponibles. (¿Se terminó correctamente la carrera?)
        </p>
      )}

      {resultadosOrdenados.length > 0 && (
        <ol style={{ fontSize: '20px', paddingLeft: '30px', margin: '10px 0' }}>
          {resultadosOrdenados.map((r, i) => (
            <li key={r.jugadorId} style={{ margin: '8px 0' }}>
              <strong>
                {i + 1}. {r.nick}
              </strong>{' '}
              — Piso:{' '}
              <span style={{ color: 'var(--color-accent-yellow)' }}>{r.piso}</span>{' '}
              (HP:{' '}
              <span style={{ color: 'var(--color-accent-red)' }}>
                {r.hp}
              </span>
              )
            </li>
          ))}
        </ol>
      )}

      <button
        onClick={handleVolverAlLobby}
        className="retro-button chunky-shadow"
        style={{ fontSize: '18px', padding: '12px 24px', marginTop: '10px' }}
      >
        VOLVER AL LOBBY
      </button>
    </div>
  );
};

export default ResultsScreen;
