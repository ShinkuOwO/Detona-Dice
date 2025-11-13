import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import { socket } from '../socket';

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
    // Este div ya tiene 'retro-panel' desde GameRouter
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Sección de Carrera */}
      <div>
        <h4>🏁 CARRERA EN VIVO</h4>

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
                  style={{
                    margin: '6px 0',
                    fontSize: '14px',
                    color: esEliminado ? 'var(--text-dim)' : 'var(--text-light)',
                  }}
                >
                  <strong>{j.nick}</strong>
                  <div>
                    Piso:{' '}
                    <span
                      style={{
                        color: esEliminado
                          ? 'var(--text-dim)'
                          : 'var(--color-accent-yellow)',
                      }}
                    >
                      {j.piso}
                    </span>{' '}
                    | HP:{' '}
                    <span
                      style={{
                        color: esEliminado
                          ? '#555'
                          : 'var(--color-accent-red)',
                      }}
                    >
                      {j.hp}
                    </span>
                  </div>
                  {esEliminado && (
                    <div
                      style={{
                        fontSize: '12px',
                        color: 'var(--text-dim)',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                      }}
                    >
                      ELIMINADO
                    </div>
                  )}
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
        <h4>💬 CHAT</h4>

        <div
          className="chat-window"
          style={{
            flex: 1,
            border: '1px solid var(--color-panel-border)',
            padding: '10px',
            overflowY: 'auto',
            marginBottom: '10px',
            fontSize: '13px',
          }}
        >
          {mensajesChat.length === 0 && (
            <div style={{ color: 'var(--text-dim)' }}>
              No hay mensajes todavía. Escribe algo para romper el hielo.
            </div>
          )}

          {mensajesChat.map((m, i) => (
            <div key={i} style={{ marginBottom: '4px' }}>
              <strong>{m.nick}:</strong> {m.mensaje}
            </div>
          ))}

          <div ref={chatEndRef} />
        </div>

        {/* Formulario de Chat */}
        <form onSubmit={handleEnviarChat} className="chat-form">
          <input
            type="text"
            value={mensajeChat}
            onChange={(e) => setMensajeChat(e.target.value)}
            className="retro-input"
            placeholder="Escribe un mensaje..."
          />
          <button type="submit" className="retro-button chunky-shadow">
            ENVIAR
          </button>
        </form>
      </div>
    </div>
  );
};

export default PanelDerecho;
