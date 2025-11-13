import React from 'react';
import { useGame } from '../contexts/GameContext';
import { socket } from '../socket';

const PactoScreen: React.FC = () => {
  const { state } = useGame();
  const { partidaState } = state;

  // --- ARRAY DE COLORES PARA LOS PACTOS ---
  // Estos colores deben coincidir con tus variables en App.css
  const PACTO_COLORS = [
      'var(--color-accent-yellow)', // Ojo: Se convierte en un color brillante para el botón
      'var(--color-accent-green)',
      'var(--color-accent-blue)',
      'var(--color-accent-red)',
  ];

  if (!partidaState || !partidaState.opcionesPacto) {
    return <div>Cargando pacto...</div>;
  }

  const { opcionesPacto, mensaje, oro } = partidaState;

  const handleElegir = (pactoId: string) => {
    socket.emit('cliente:aceptar_pacto', { pactoId });
  };
  
  const handleReroll = () => {
    if (oro < 10) {
      return alert('¡Oro insuficiente para reroll!');
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
      <h2>EVENTO MISTERIOSO</h2>
      <p style={{ color: 'var(--text-dim)', minHeight: '24px' }}>{mensaje}</p>
      <h3 style={{color: 'var(--color-accent-red)'}}>Se te ofrece poder, a un costo...</h3>
      
      <div style={buttonContainerStyle}>
        {/* Usamos el índice (index) para asignar un color único */}
        {opcionesPacto.map((opcion, index) => ( 
          <button
            key={opcion.id}
            onClick={() => handleElegir(opcion.id)}
            className="retro-button chunky-shadow"
            style={{ 
              minWidth: '150px', 
              padding: '30px',
              // --- APLICACIÓN DEL COLOR DINÁMICO ---
              backgroundColor: PACTO_COLORS[index % PACTO_COLORS.length],
              color: 'var(--text-dark)', // Aseguramos que el texto sea legible (negro/oscuro)
              border: `2px solid var(--color-panel-border)`,
            }} 
          >
            {opcion.texto}
          </button>
        ))}
      </div>
      
      <button 
        onClick={handleReroll} 
        className="retro-button small reroll-button chunky-shadow"
        style={{ marginTop: '30px' }}
      >
        Reroll (Cuesta 10 Oro) - Tienes: {oro}
      </button>
    </div>
  );
};

export default PactoScreen;