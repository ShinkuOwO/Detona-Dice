import React from 'react';
import { useGame } from '../contexts/GameContext';
import { socket } from '../socket';
import { useNotification } from '../contexts/NotificationContext';

const SubirNivelScreen: React.FC = () => {
  const { state } = useGame();
  const { partidaState } = state;
  const { addNotification } = useNotification();

  // --- ARRAY DE COLORES PARA LAS MEJORAS ---
  // Usamos colores de recompensa (azul, verde, amarillo)
  const MEJORA_COLORS = [
      'var(--color-accent-blue)', 
      'var(--color-accent-green)', 
      'var(--color-accent-yellow)', 
      'var(--color-accent-red)', // Si hay más de 3, usa rojo
  ];

  if (!partidaState || !partidaState.opcionesMejora) {
    return <div>Cargando mejoras...</div>;
  }

  const { opcionesMejora, mensaje, oro } = partidaState;

  const handleElegir = (mejoraId: string) => {
    socket.emit('cliente:elegir_mejora_nivel', { mejoraId });
  };

  const handleReroll = () => {
    if (oro < 10) {
      addNotification('error', '¡Oro insuficiente para reroll!');
      return;
    }
    socket.emit('cliente:reroll_mejoras');
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginTop: '30px',
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>¡SUBISTE DE NIVEL!</h2>
      <p style={{ color: 'var(--text-dim)', minHeight: '24px' }}>{mensaje}</p>

      <h3>Elige una recompensa:</h3>
      
      <div style={buttonContainerStyle}>
        {/* Usamos el índice (index) para asignar un color único */}
        {opcionesMejora.map((opcion, index) => (
          <button
            key={opcion.id}
            onClick={() => handleElegir(opcion.id)}
            // --- USAMOS CLASES E INLINE STYLE DINÁMICO ---
            className="retro-button chunky-shadow"
            style={{ 
              minWidth: '150px', 
              padding: '30px',
              backgroundColor: MEJORA_COLORS[index % MEJORA_COLORS.length], // Color dinámico
              color: 'var(--text-dark)', // Texto oscuro para contraste
            }} 
          >
            {opcion.texto}
          </button>
        ))}
      </div>
      
      {/* Botón de Reroll (mismo estilo que en PactoScreen) */}
      <button 
        onClick={handleReroll} 
        className="retro-button small reroll-button chunky-shadow"
        style={{ marginTop: '30px' }}
      >
        Reroll (Cuesta 10 Oro)
      </button>
    </div>
  );
};

export default SubirNivelScreen;
