import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import { socket } from '../socket';

const LobbyScreen: React.FC = () => {
  const { state } = useGame();
  const { sala } = state;
  const [mensajeChat, setMensajeChat] = useState('');
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  if (!sala) {
    return (
      <div
        className="retro-panel"
        style={{ padding: '20px', minHeight: '100vh' }}
      >
        Cargando sala...
      </div>
    );
  }

  const esHost = sala.hostId === socket.id;
  const jugadorActual = sala.jugadores.find((j) => j.id === socket.id);

  const handleListo = () => {
    const nuevoEstado = !jugadorActual?.listo;
    socket.emit('cliente:marcar_listo', { estaListo: nuevoEstado });
  };

  const handleIniciar = () => {
    socket.emit('cliente:iniciar_partida');
  };

  const handleEnviarChat = (e: React.FormEvent) => {
    e.preventDefault();
    const limpio = mensajeChat.trim();
    if (!limpio) return;
    socket.emit('cliente:enviar_chat', { mensaje: limpio });
    setMensajeChat('');
  };

  // Auto-scroll del chat al final
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sala.chat.length]);

  return (
    // Contenedor principal del lobby
    <div
      className="retro-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        padding: '15px',
        boxSizing: 'border-box',
      }}
    >
      {/* Encabezado de la sala */}
      <div style={{ marginBottom: '15px' }}>
        <h2 style={{ color: 'var(--color-accent-blue)', margin: '0 0 10px 0', fontSize: '1.5em' }}>
          SALA: {sala.codigoSala}
        </h2>
      </div>

      {/* Contenido principal: jugadores y chat */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        flex: 1,
        overflow: 'hidden'
      }}>
        {/* Sección de jugadores */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          border: '2px solid var(--color-panel-border)',
          borderRadius: '8px',
          padding: '10px',
          backgroundColor: 'var(--color-panel-dark)'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: 'var(--color-accent-blue)' }}>Jugadores:</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1, overflowY: 'auto' }}>
            {sala.jugadores.map((j) => (
              <li
                key={j.id}
                style={{
                  fontSize: '16px',
                  margin: '6px 0',
                  padding: '5px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  color: j.listo
                    ? 'var(--color-accent-green)'
                    : 'var(--text-dim)',
                }}
              >
                {j.nick}
                {j.id === sala.hostId ? ' (Host) 👑' : ''}
                {' — '}
                <span
                  style={{
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontSize: '11px',
                  }}
                >
                  {j.listo ? '[LISTO]' : '[PENDIENTE]'}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Acciones */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          gap: '15px',
          padding: '10px',
          flexWrap: 'wrap'
        }}>
          {!esHost && (
            <button
              onClick={handleListo}
              className="retro-button chunky-shadow responsive-button"
              style={{
                backgroundColor: jugadorActual?.listo
                  ? 'var(--color-accent-green)'
                  : 'var(--color-panel-border)',
                color: jugadorActual?.listo
                  ? 'var(--text-dark)'
                  : 'var(--text-light)',
                flex: '0 0 auto',
                minWidth: '120px'
              }}
            >
              {jugadorActual?.listo ? 'NO LISTO' : '¡LISTO!'}
            </button>
          )}

          {esHost && (
            <button
              onClick={handleIniciar}
              className="retro-button retro-button-success chunky-shadow responsive-button"
              style={{ minWidth: '150px' }}
            >
              COMENZAR PARTIDA
            </button>
          )}

          {!esHost && (
            <p
              style={{
                margin: '0',
                fontSize: '12px',
                color: 'var(--text-dim)',
                textAlign: 'center'
              }}
            >
              Espera a que el host inicie la partida.
            </p>
          )}
        </div>

        {/* Chat */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          border: '2px solid var(--color-panel-border)',
          borderRadius: '8px',
          padding: '10px',
          backgroundColor: 'var(--color-panel-dark)'
        }}>
          <h3 style={{ color: 'var(--color-accent-blue)', margin: '0 10px 0', fontSize: '1.2em' }}>
            💬 Chat del Lobby
          </h3>

          {/* Ventana de Chat */}
          <div
            className="chat-window"
            style={{
              flex: 1,
              border: '1px solid var(--color-panel-border)',
              padding: '10px',
              overflowY: 'auto',
              marginBottom: '10px',
              fontSize: '12px',
              backgroundColor: 'var(--color-background)',
            }}
          >
            {sala.chat.length === 0 && (
              <div style={{ color: 'var(--text-dim)' }}>
                No hay mensajes todavía.
              </div>
            )}

            {sala.chat.map((m, i) => (
              <div key={i} style={{ marginBottom: '4px' }}>
                <strong>{m.nick}:</strong> {m.mensaje}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Formulario de Chat */}
          <form onSubmit={handleEnviarChat} className="chat-form" style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={mensajeChat}
              onChange={(e) => setMensajeChat(e.target.value)}
              className="retro-input chunky-shadow responsive-input"
              placeholder="Escribe un mensaje..."
              style={{ flex: 1, margin: 0 }}
            />
            <button type="submit" className="retro-button chunky-shadow responsive-button">
              ENVIAR
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LobbyScreen;
