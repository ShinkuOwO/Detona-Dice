import React from 'react';
import { useGame } from '../contexts/GameContext';
import { socket } from '../socket';
import styles from './PanelIzquierdo.module.css';

const PanelIzquierdo: React.FC = () => {
  const { state } = useGame();
  const { partidaState, nick } = state;

  if (!partidaState) {
    return (
      <div className={styles.panelIzquierdo}>
        <h2 className={styles.tituloPanel}>DETONA DICE</h2>
        <p style={{ color: 'var(--text-dim)' }}>Esperando partida...</p>
      </div>
    );
  }

  const { piso, nivel, reliquias, consumibles } = partidaState;

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

  return (
    <div className={styles.panelIzquierdo}>
      <h2 className={styles.tituloPanel}>{nick}</h2>
      
      <div className={styles.infoJugador}>
        <div className={styles.nombreJugador}>Piso {piso} · Nivel {nivel}</div>
        <div className={styles.estadoJugador}>
          <span style={{ color: estadoColor, textTransform: 'uppercase' }}>
            {estadoLabel}
          </span>
        </div>
      </div>


      {/* HABILIDADES */}
      <h3 className={styles.tituloPanel}>HABILIDADES</h3>
      <ul style={{ paddingLeft: '20px' }}>
        <li style={{ marginBottom: '4px', fontSize: '14px', color: 'var(--text-light)' }}>
          [+] Aumentar — <span style={{ color: 'var(--color-accent-blue)' }}>1⚡</span>
        </li>
        <li style={{ marginBottom: '4px', fontSize: '14px', color: 'var(--text-light)' }}>
          [⇄] Voltear — <span style={{ color: 'var(--color-accent-blue)' }}>2⚡</span>
        </li>
        <li style={{ marginBottom: '4px', fontSize: '14px', color: 'var(--text-light)' }}>
          [↻] Relanzar — <span style={{ color: 'var(--color-accent-blue)' }}>1⚡</span>
        </li>
      </ul>

      {/* RELIQUIAS */}
      <h3 className={styles.reliquiasTitulo}>RELIQUIAS ({reliquias.length})</h3>
      <div>
        {reliquias.length === 0 ? (
          <div className={styles.reliquiaItem}>Ninguna</div>
        ) : (
          reliquias.map((reliquia, idx) => (
            <div key={idx} className={styles.reliquiaItem}>
              {reliquia}
            </div>
          ))
        )}
      </div>

      {/* INVENTARIO DE CONSUMIBLES */}
      <h3 className={styles.inventarioTitulo}>INVENTARIO ({consumibles?.length || 0})</h3>
      <div>
        {(consumibles && consumibles.length > 0) ? (
          consumibles.map((itemId, idx) => (
            <div key={idx} className={styles.consumibleItem}>
              <span>{itemId}</span>
              <button
                className={`${styles.usarBtn} retro-button small chunky-shadow`}
                onClick={() => handleUsarConsumible(itemId)}
              >
                Usar
              </button>
            </div>
          ))
        ) : (
          <div className={styles.consumibleItem}>Vacío</div>
        )}
      </div>
    </div>
  );
};

export default PanelIzquierdo;
