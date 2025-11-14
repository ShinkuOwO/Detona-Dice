import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import { socket } from '../socket';
import styles from './PanelDerecho.module.css';

const PanelDerecho: React.FC = () => {
  const { state } = useGame();
  const { carreraState, sala } = state;
  const [mensajeChat, setMensajeChat] = useState('');
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Enviar mensaje de chat
  const handleEnviarChat = (e: React.FormEvent) => {
    e.preventDefault();
    const limpio = mensajeChat.trim();
    if (!limpio) return;
    socket.emit('cliente:enviar_chat', { mensaje: limpio });
    setMensajeChat('');
  };

  // Auto-scroll al final del chat cuando lleguen nuevos mensajes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sala?.chat?.length]);

  // Ordenar carrera por mejor progreso (piso, luego HP)
  const carreraOrdenada = [...carreraState].sort(
    (a, b) => b.piso - a.piso || b.hp - a.hp
  );

  const haySala = !!sala;
  const mensajesChat = sala?.chat ?? [];

  return (
    <div className={styles.panelDerecho}>
      <h2 className={styles.tituloPanel}>Panel Derecho</h2>
      
      {/* Sección de Carrera */}
      <div>
        <h3 className={styles.carreraTitulo}>🏁 CARRERA EN VIVO</h3>

        {!haySala && (
          <p style={{ color: 'var(--text-dim)', fontSize: '14px' }}>
            Únete o crea una sala para ver la carrera.
          </p>
        )}

        {haySala && carreraOrdenada.length === 0 && (
          <p style={{ color: 'var(--text-dim)', fontSize: '14px' }}>
            Esperando a que el host inicie la partida...
          </p>
        )}

        {carreraOrdenada.length > 0 && (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {carreraOrdenada.map((j) => {
              const esEliminado = j.estado === 'eliminado';
              return (
                <li
                  key={j.jugadorId}
                  className={styles.jugadorCarrera}
                >
                  <div className={styles.nombreJugador}>
                    <strong>{j.nick}</strong>
                  </div>
                  <div className={styles.estadoJugador}>
                    <span className={esEliminado ? styles.estadoEliminado : styles.estadoVivo}>
                      {esEliminado ? 'ELIMINADO' : 'VIVO'}
                    </span>
                    <div className={styles.estadoInfo}>
                      Piso: <span style={{ color: 'var(--color-accent-yellow)' }}>{j.piso}</span> | HP: <span style={{ color: 'var(--color-accent-red)' }}>{j.hp}</span>
                    </div>
                  </div>
                  <div className={styles.barraProgreso}>
                    <div className={`${styles.barraProgresoLlena} ${esEliminado ? styles.barraProgresoLlenaEliminado : ''}`} style={{ width: `${(j.piso / 20) * 100}%` }}></div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <hr
        style={{
          width: '100%',
          borderColor: 'var(--color-panel-border)',
          margin: '10px 0',
        }}
      />

      {/* Sección de Chat */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
        }}
      >
        <h3 className={styles.chatTitulo}>💬 CHAT</h3>

        <div
          className="chat-window"
          style={{
            flex: 1,
            border: '1px solid var(--color-panel-border)',
            padding: '10px',
            overflowY: 'auto',
            marginBottom: '10px',
            fontSize: '13px',
            backgroundColor: 'var(--color-panel-dark)',
          }}
        >
          {mensajesChat.length === 0 && (
            <div className={styles.mensajeSistema}>
              No hay mensajes todavía. Escribe algo para romper el hielo.
            </div>
          )}

          {mensajesChat.map((m, i) => (
            <div key={i} className={styles.mensajeChat}>
              <div className={styles.mensajeChatRemitente}>{m.nick}:</div>
              <div className={styles.mensajeChatContenido}>{m.mensaje}</div>
            </div>
          ))}

          <div ref={chatEndRef} />
        </div>

        {/* Formulario de Chat */}
        <form onSubmit={handleEnviarChat} className={`chat-form ${styles.formularioChat}`}>
          <input
            type="text"
            value={mensajeChat}
            onChange={(e) => setMensajeChat(e.target.value)}
            className={`retro-input ${styles.inputChat}`}
            placeholder="Escribe un mensaje..."
          />
          <button type="submit" className={`retro-button ${styles.botonEnviar}`}>
            ENVIAR
          </button>
        </form>
      </div>
    </div>
  );
};

export default PanelDerecho;
