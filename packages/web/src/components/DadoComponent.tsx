import React from 'react';
import type { Dado } from '../contexts/GameContext';
import styles from './DadoComponent.module.css';

interface DadoProps {
  dado: Dado;
  isSelected: boolean;
  onClick: () => void;
  disabled: boolean;
  isLanzando?: boolean; // Nueva propiedad para indicar si el dado está en animación
}

const DadoComponent: React.FC<DadoProps> = ({ dado, isSelected, onClick, disabled, isLanzando = false }) => {
  // Clases según tipo y selección
  const dadoClasses = [
    styles.dado,
    dado.esCorrupto ? styles.dadoCorrupto : styles.dadoBase,
    isSelected ? styles.dadoSeleccionado : '',
    disabled ? styles.dadoDesactivado : '',
    isLanzando ? styles.dadoLanzando : ''
  ].join(' ');

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
    >
      {mostrarValor()}
    </div>
  );
};

export default DadoComponent;
