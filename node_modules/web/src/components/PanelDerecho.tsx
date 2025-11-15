import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import { socket } from '../socket';

const PanelDerecho: React.FC = () => {
  const { state } = useGame();
  const { carreraState, sala } = state;
  const [mensajeChat, setMensajeChat] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

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
    <div className="h-100 d-flex flex-column">
      {/* Sección de Carrera */}
      <div className="mb-3 flex-grow-1 overflow-auto">
        <h5 className="text-retro text-center mb-2">🏁 CARRERA EN VIVO</h5>

        {!haySala && (
          <p className="text-center text-muted fst-italic">
            Únete o crea una sala para ver la carrera.
          </p>
        )}

        {haySala && carreraOrdenada.length === 0 && (
          <p className="text-center text-muted fst-italic">
            Esperando a que el host inicie la partida...
          </p>
        )}

        {carreraOrdenada.length > 0 && (
          <div className="d-flex flex-column gap-2">
            {carreraOrdenada.map((j) => {
              const esEliminado = j.estado === 'eliminado';
              const posicion = carreraOrdenada.findIndex(item => item.jugadorId === j.jugadorId) + 1;
              
              return (
                <div
                  key={j.jugadorId}
                  className={`card-retro p-2 ${esEliminado ? 'bg-dark bg-opacity-50' : ''}`}
                >
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <div className="d-flex align-items-center gap-2">
                      <span className={`badge ${posicion === 1 ? 'bg-warning text-dark' : posicion === 2 ? 'bg-secondary' : posicion === 3 ? 'bg-danger' : 'bg-info'}`}>
                        {posicion}
                      </span>
                      <strong className={esEliminado ? 'text-danger' : 'text-light'}>{j.nick}</strong>
                    </div>
                    <span className={`badge ${esEliminado ? 'badge-retro-danger' : 'badge-retro-success'}`}>
                      {esEliminado ? 'ELIMINADO' : 'VIVO'}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between text-sm">
                    <span className="text-warning">Piso: {j.piso}</span>
                    <span className="text-danger">HP: {j.hp}</span>
                  </div>
                  <div className="progress-retro mt-1" style={{ height: '8px' }}>
                    <div 
                      className={`progress-retro-bar ${esEliminado ? 'bg-danger' : 'bg-warning'}`} 
                      role="progressbar" 
                      style={{ width: `${Math.min(100, (j.piso / 20) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <hr className="border-retro" />

      {/* Sección de Chat */}
      <div className="flex-grow-1 d-flex flex-column">
        <h5 className="text-retro text-center mb-2">💬 CHAT</h5>

        <div
          className="flex-grow-1 border rounded p-2 mb-2 overflow-auto"
          style={{ fontSize: '0.8rem', backgroundColor: '#2c3e50' }}
        >
          {mensajesChat.length === 0 && (
            <div className="text-center text-muted fst-italic py-2">
              No hay mensajes todavía. Escribe algo para romper el hielo.
            </div>
          )}

          {mensajesChat.map((m, i) => (
            <div key={i} className="mb-1 p-1 bg-dark bg-opacity-25 rounded">
              <div className="fw-bold text-info">{m.nick}:</div>
              <div>{m.mensaje}</div>
              <small className="text-muted">{new Date(m.timestamp).toLocaleTimeString()}</small>
            </div>
          ))}

          <div ref={chatEndRef} />
        </div>

        {/* Formulario de Chat */}
        <form onSubmit={handleEnviarChat} className="d-flex gap-2">
          <input
            type="text"
            value={mensajeChat}
            onChange={(e) => setMensajeChat(e.target.value)}
            className="form-control flex-grow-1"
            placeholder="Escribe un mensaje..."
          />
          <button type="submit" className="btn-retro btn-retro-primary btn-sm">
            ENVIAR
          </button>
        </form>
      </div>
    </div>
  );
};

export default PanelDerecho;
