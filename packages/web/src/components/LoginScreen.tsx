import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { socket } from '../socket';

const LoginScreen: React.FC = () => {
  const { dispatch } = useGame();
  const [nick, setNick] = useState('');
  const [codigoSala, setCodigoSala] = useState('');

  const handleCrearSala = () => {
    if (nick.trim() === '') return alert('Por favor, introduce un nick');
    dispatch({ type: 'SET_NICK', payload: nick });
    socket.emit('cliente:crear_sala', { nick });
  };

  const handleUnirseSala = () => {
    if (nick.trim() === '' || codigoSala.trim() === '') return alert('Introduce un nick Y un código de sala');
    dispatch({ type: 'SET_NICK', payload: nick });
    socket.emit('cliente:unirse_sala', { nick, codigoSala: codigoSala.toUpperCase() });
  };

  // Estilos en línea para el layout de esta pantalla
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '20px',
    gap: '20px',
  };

  return (
    <div style={containerStyle}>
      {/* Puedes reemplazar esto con tu logo pixelado */}
      <h1 style={{ fontSize: '64px', color: 'white', textShadow: '4px 4px 0px #000' }}>
        DETONA DICE
      </h1>
      
      <input
        type="text"
        placeholder="INTRODUCE TU NICK"
        value={nick}
        onChange={(e) => setNick(e.target.value)}
        maxLength={15}
        className="retro-input chunky-shadow" // <-- CLASES AÑADIDAS
      />
      
      <button 
        onClick={handleCrearSala} 
        className="retro-button chunky-shadow" // <-- CLASES AÑADIDAS
      >
        CREAR SALA
      </button>

      <div style={{ margin: '20px 0', borderTop: `2px solid var(--color-accent-red)`, width: '50%' }}></div>

      <input
        type="text"
        placeholder="CÓDIGO DE SALA"
        value={codigoSala}
        onChange={(e) => setCodigoSala(e.target.value)}
        maxLength={6}
        className="retro-input chunky-shadow" // <-- CLASES AÑADIDAS
      />
      
      <button 
        onClick={handleUnirseSala} 
        className="retro-button danger chunky-shadow" // <-- CLASES AÑADIDAS
      >
        UNIRSE A SALA
      </button>
    </div>
  );
};

export default LoginScreen;