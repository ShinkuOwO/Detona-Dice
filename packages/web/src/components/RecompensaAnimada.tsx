import React, { useEffect, useState } from 'react';

interface RecompensaAnimadaProps {
  tipo: 'oro' | 'xp' | 'nivel' | 'victoria';
  cantidad: number;
  posicion?: { x: number; y: number };
}

const RecompensaAnimada: React.FC<RecompensaAnimadaProps> = ({ tipo, cantidad, posicion }) => {
  const [visible, setVisible] = useState(true);
  const [claseAnimacion, setClaseAnimacion] = useState('');

  useEffect(() => {
    // Iniciar la animación
    setClaseAnimacion('animate__animated animate__bounceIn');
    
    // Ocultar después de la animación
    const timer = setTimeout(() => {
      setClaseAnimacion('animate__animated animate__fadeOutUp');
      setTimeout(() => {
        setVisible(false);
      }, 500);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  const getEstiloRecompensa = () => {
    switch(tipo) {
      case 'oro':
        return {
          background: 'linear-gradient(45deg, #FFD700, #FFA500)',
          border: '2px solid #DAA520',
          color: '#000'
        };
      case 'xp':
        return {
          background: 'linear-gradient(45deg, #4169E1, #1E90FF)',
          border: '2px solid #00008B',
          color: '#FFF'
        };
      case 'nivel':
        return {
          background: 'linear-gradient(45deg, #32CD32, #00FF00)',
          border: '2px solid #228B22',
          color: '#000'
        };
      case 'victoria':
        return {
          background: 'linear-gradient(45deg, #FF6347, #FF4500)',
          border: '2px solid #B22222',
          color: '#FFF',
          fontSize: '1.5rem'
        };
      default:
        return {};
    }
  };

  const getTextoRecompensa = () => {
    switch(tipo) {
      case 'oro': return `+${cantidad} ORO`;
      case 'xp': return `+${cantidad} XP`;
      case 'nivel': return `¡NIVEL ${cantidad}!`;
      case 'victoria': return `¡VICTORIA!`;
      default: return '';
    }
  };

  return (
    <div 
      className={`position-fixed ${claseAnimacion} d-flex align-items-center justify-content-center p-2 rounded-3 fw-bold text-white shadow-lg`}
      style={{
        ...getEstiloRecompensa(),
        top: posicion ? `${posicion.y}px` : '20px',
        left: posicion ? `${posicion.x}px` : '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        pointerEvents: 'none',
        minWidth: '150px',
        textAlign: 'center'
      }}
    >
      {getTextoRecompensa()}
    </div>
  );
};

export default RecompensaAnimada;
