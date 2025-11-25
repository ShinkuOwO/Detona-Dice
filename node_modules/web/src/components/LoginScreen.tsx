import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { socket } from '../socket';
import { useNotification } from '../contexts/NotificationContext';

const LoginScreen: React.FC = () => {
  const { dispatch } = useGame();
  const [nick, setNick] = useState('');
  const [codigoSala, setCodigoSala] = useState('');
  const { addNotification } = useNotification();

  const handleCrearSala = () => {
    if (nick.trim() === '') {
      addNotification('error', 'Por favor, introduce un nick');
      return;
    }
    dispatch({ type: 'SET_NICK', payload: nick });
    socket.emit('cliente:crear_sala', { nick });
  };

  const handleUnirseSala = () => {
    if (nick.trim() === '' || codigoSala.trim() === '') {
      addNotification('error', 'Introduce un nick Y un código de sala');
      return;
    }
    dispatch({ type: 'SET_NICK', payload: nick });
    socket.emit('cliente:unirse_sala', { nick, codigoSala: codigoSala.toUpperCase() });
  };

  return (
    <div className="landing-shell">
      <section className="landing-hero">
        <div className="badge-row">
          <span className="logo-badge pixel-border">Roguelike en tiempo real</span>
          <span className="glow-badge">Modo online</span>
        </div>
        <h1 className="logo-title">Detona Dice</h1>
        <p className="hero-tagline">
          Dados que explotan, pactos peligrosos y partidas en simultáneo. Entra, arma tu build y
          corre más rápido que tus rivales antes de que el mapa te trague.
        </p>

        <div className="balatro-showcase">
          <div className="balatro-card prime">
            <div className="card-top">
              <span className="card-label">Bendito</span>
              <span className="card-rank">x2</span>
            </div>
            <div className="card-body">
              <div className="pixel-dice dice-bendito">
                <span className="pip" />
                <span className="pip" />
                <span className="pip" />
                <span className="pip" />
                <span className="pip" />
              </div>
              <p className="card-text">Duplica tu combo si mantienes viva la llama sagrada.</p>
            </div>
            <div className="card-footer">
              <span className="card-tag">+Energía</span>
              <span className="card-tag soft">Mejoras baratas</span>
            </div>
          </div>

          <div className="balatro-card ghost">
            <div className="card-top">
              <span className="card-label">Corrupto</span>
              <span className="card-rank">☠</span>
            </div>
            <div className="card-body">
              <div className="pixel-dice dice-corrupto">
                <span className="pip" />
                <span className="pip" />
                <span className="pip" />
                <span className="pip" />
                <span className="pip" />
                <span className="pip" />
              </div>
              <p className="card-text">Riesgo permanente, recompensas absurdas. ¿Lo tomas?</p>
            </div>
            <div className="card-footer">
              <span className="card-tag warning">Pacto</span>
              <span className="card-tag">Loot extra</span>
            </div>
          </div>
        </div>

        <div className="highlight-pills">
          <span className="pill">⚡  Acciones en tiempo real</span>
          <span className="pill">🎲  Dados benditos, normales y corruptos</span>
          <span className="pill">💀  Pactos con riesgo permanente</span>
          <span className="pill">🛒  Tienda y subida de nivel</span>
        </div>

        <ul className="feature-list">
          <li>
            <span className="feature-icon">➜</span> Lanza 3 dados, combina 2 y alcanza el objetivo.
          </li>
          <li>
            <span className="feature-icon">➜</span> Usa energía para mejorar, relanzar o voltear.
          </li>
          <li>
            <span className="feature-icon">➜</span> Compra items, acepta pactos y escala pisos.
          </li>
          <li>
            <span className="feature-icon">➜</span> Gana siendo el último en pie o el más alto.
          </li>
        </ul>
      </section>

      <section className="landing-card">
        <div className="form-grid">
          <h2>Entra a la partida</h2>

          <label className="field-label" htmlFor="nick-input">Nick</label>
          <input
            id="nick-input"
            type="text"
            placeholder="Introduce tu nick"
            value={nick}
            onChange={(e) => setNick(e.target.value)}
            maxLength={15}
            className="retro-input chunky-shadow responsive-input"
          />

          <div className="button-stack">
            <button
              onClick={handleCrearSala}
              className="retro-button chunky-shadow responsive-button"
            >
              Crear sala
            </button>
            <button
              onClick={handleUnirseSala}
              className="retro-button retro-button-danger chunky-shadow responsive-button"
            >
              Unirse con código
            </button>
          </div>

          <hr className="divider-accent" />

          <label className="field-label" htmlFor="codigo-sala">Código de sala</label>
          <input
            id="codigo-sala"
            type="text"
            placeholder="Ej: ZXQ123"
            value={codigoSala}
            onChange={(e) => setCodigoSala(e.target.value)}
            maxLength={6}
            className="retro-input chunky-shadow responsive-input"
          />

          <p className="helper-note">Comparte el código con tu squad o genera uno nuevo al crear sala.</p>
          <p className="login-footer">Tip: mantén tu nick corto para que encaje mejor en el HUD.</p>
        </div>
      </section>
    </div>
  );
};

export default LoginScreen;
