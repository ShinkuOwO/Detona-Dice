import React from 'react';
import { useGame } from '../contexts/GameContext';

const EspectadorScreen: React.FC = () => {
  const { state } = useGame();
  const { partidaState } = state;
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>HAS SIDO ELIMINADO</h1>
      <p>Ahora eres un espectador.</p>
      <p>Puedes seguir usando el chat y viendo la carrera.</p>
      <p style={{ color: '#aaa', minHeight: '24px' }}>{partidaState?.mensaje}</p>
    </div>
  );
};

export default EspectadorScreen;