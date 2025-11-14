import React from 'react';
import type { Dado } from '../contexts/GameContext';
import styles from './DadoComponent.module.css';

interface DadoProps {
  dado: Dado;
  isSelected: boolean;
  onClick: () => void;
  disabled: boolean;
  animationState?: 'none' | 'rolling' | 'flipping' | 'increasing'; // Different animation states
}

const DadoComponent: React.FC<DadoProps> = ({ dado, isSelected, onClick, disabled, animationState = 'none' }) => {
  // Clases según tipo y selección
  const dadoClasses = [
    styles.dado,
    dado.esCorrupto ? styles.dadoCorrupto : styles.dadoBase,
    isSelected ? styles.dadoSeleccionado : '',
    disabled ? styles.dadoDesactivado : '',
    animationState === 'rolling' ? styles.dadoRolling : '',
    animationState === 'flipping' ? styles.dadoFlipping : '',
    animationState === 'increasing' ? styles.dadoIncreasing : ''
  ].join(' ');

  // Assign a color based on the value of the die
  const getDadoColor = () => {
    if (dado.valor === null || dado.valor === 'CRÁNEO') return {};
    
    const numValue = Number(dado.valor);
    if (isNaN(numValue)) return {};
    
    // Define different colors for each face value (1-6)
    const colors: Record<number, { bgColor: string; textColor: string }> = {
      1: { bgColor: '#ffcccc', textColor: '#b30000' }, // Light red
      2: { bgColor: '#ccffcc', textColor: '#00600' }, // Light green
      3: { bgColor: '#ccccff', textColor: '#0000b3' }, // Light blue
      4: { bgColor: '#ffffcc', textColor: '#b3b300' }, // Light yellow
      5: { bgColor: '#ffccff', textColor: '#b300b3' }, // Light magenta
      6: { bgColor: '#ccffff', textColor: '#0066b3' }  // Light cyan
    };
    
    const color = colors[numValue] || { bgColor: '#f0f0f0', textColor: '#333' };
    return {
      backgroundColor: color.bgColor,
      color: color.textColor
    };
  };

  const mostrarValor = () => {
    if (dado.valor === null) return '?';
    if (dado.valor === 'CRÁNEO') return '💀'; // opcional, más claro que texto
    return dado.valor;
  };

  const handleClick = () => {
    if (disabled) return;
    onClick();
  };

  return (
    <div
      className={dadoClasses}
      onClick={handleClick}
      style={getDadoColor()}
    >
      {mostrarValor()}
    </div>
  );
};

export default DadoComponent;
