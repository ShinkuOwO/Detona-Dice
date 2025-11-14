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
        height: '100vh',
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      {/* Columna Izquierda: Jugadores y Acciones */}
      <div
        style={{
          flex: 1,
          paddingRight: '20px',
          borderRight: '2px solid var(--color-panel-border)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div>
          <h2 style={{ color: 'var(--color-accent-blue)', marginTop: 0 }}>
            SALA: {sala.codigoSala}
          </h2>
          <h3>Jugadores:</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {sala.jugadores.map((j) => (
              <li
                key={j.id}
                style={{
                  fontSize: '18px',
                  margin: '8px 0',
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
                    fontSize: '12px',
                  }}
                >
                  {j.listo ? '[LISTO]' : '[PENDIENTE]'}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Acciones */}
        <div style={{ marginTop: 'auto' }}>
          {!esHost && (
            <button
              onClick={handleListo}
              className="retro-button chunky-shadow"
              style={{
                backgroundColor: jugadorActual?.listo
                  ? 'var(--color-accent-green)'
                  : 'var(--color-panel-border)',
                color: jugadorActual?.listo
                  ? 'var(--text-dark)'
                  : 'var(--text-light)',
              }}
            >
              {jugadorActual?.listo ? 'NO LISTO' : '¡LISTO!'}
            </button>
          )}

          {esHost && (
            <button
              onClick={handleIniciar}
              className="retro-button retro-button-success chunky-shadow"
              style={{ minWidth: '220px' }}
            >
              COMENZAR PARTIDA
            </button>
          )}

          {!esHost && (
            <p
              style={{
                marginTop: '10px',
                fontSize: '12px',
                color: 'var(--text-dim)',
              }}
            >
              Espera a que el host inicie la partida.
            </p>
          )}
        </div>
      </div>

      {/* Columna Derecha: Chat */}
      <div
        style={{
          flex: 1,
          paddingLeft: '20px',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        <h3 style={{ color: 'var(--color-accent-blue)', marginTop: 0 }}>
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
            fontSize: '13px',
            backgroundColor: 'var(--color-panel-dark)',
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
        <form onSubmit={handleEnviarChat} className="chat-form">
            <input
              type="text"
              value={mensajeChat}
              onChange={(e) => setMensajeChat(e.target.value)}
              className="retro-input chunky-shadow"
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

export default LobbyScreen;
