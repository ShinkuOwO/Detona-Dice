import React, { useEffect, useRef, useState } from 'react';
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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sala.chat.length]);

  return (
    <div className="lobby-shell">
      <header className="lobby-header">
        <div className="eyebrow">Sala</div>
        <div className="lobby-code">{sala.codigoSala}</div>
        <p className="lobby-sub">Comparte el código y alíneate con tu escuadrón antes de saltar al mapa.</p>
      </header>

      <div className="lobby-grid">
        <section className="lobby-card roster">
          <div className="card-head">
            <div>
              <p className="eyebrow">Tripulación</p>
              <h3>Estado de jugadores</h3>
            </div>
            <span className="chip chip-ghost">Host: {sala.jugadores.find((j) => j.id === sala.hostId)?.nick}</span>
          </div>
          <ul className="roster-list">
            {sala.jugadores.map((j) => (
              <li key={j.id} className={`roster-item ${j.listo ? 'ready' : 'pending'}`}>
                <div>
                  <span className="nick">{j.nick}</span>
                  {j.id === sala.hostId && <span className="pill mini">👑 Host</span>}
                </div>
                <span className={`status-dot ${j.listo ? 'ok' : 'wait'}`}>
                  {j.listo ? 'Listo' : 'Pendiente'}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="lobby-card actions">
          <div className="card-head">
            <div>
              <p className="eyebrow">Control</p>
              <h3>Listo para despegar</h3>
            </div>
            <span className="chip chip-amber">{sala.jugadores.filter((j) => j.listo).length}/{sala.jugadores.length} listos</span>
          </div>

          <div className="action-buttons">
            {!esHost && (
              <button
                onClick={handleListo}
                className={`retro-button chunky-shadow responsive-button ${jugadorActual?.listo ? 'retro-button-success' : ''}`}
              >
                {jugadorActual?.listo ? 'Cancelar listo' : 'Estoy listo'}
              </button>
            )}

            {esHost && (
              <button
                onClick={handleIniciar}
                className="retro-button retro-button-success chunky-shadow responsive-button"
              >
                Iniciar partida
              </button>
            )}
          </div>

          {!esHost && (
            <p className="helper-note">El host inicia la carrera cuando todos marcan listo.</p>
          )}
        </section>

        <section className="lobby-card chat">
          <div className="card-head">
            <div>
              <p className="eyebrow">Radio</p>
              <h3>Chat del lobby</h3>
            </div>
            <span className="chip chip-ghost">Retro feed</span>
          </div>

          <div className="chat-window">
            {sala.chat.length === 0 && <div className="empty-chat">No hay mensajes todavía.</div>}
            {sala.chat.map((msg, idx) => (
              <div key={idx} className="chat-line">
                <span className="author">{msg.nick}</span>
                <span className="message">{msg.mensaje}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleEnviarChat} className="chat-form">
            <input
              type="text"
              value={mensajeChat}
              onChange={(e) => setMensajeChat(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="retro-input chunky-shadow"
            />
            <button type="submit" className="retro-button chunky-shadow">
              Enviar
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default LobbyScreen;
