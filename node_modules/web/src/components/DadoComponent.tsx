import React from 'react';
import type { Dado } from '../contexts/GameContext';

interface DadoProps {
  dado: Dado;
  isSelected: boolean;
  onClick: () => void;
  disabled: boolean;
}

const DadoComponent: React.FC<DadoProps> = ({ dado, isSelected, onClick, disabled }) => {
  // Estilo dinámico básico
  const estiloDado: React.CSSProperties = {
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  };

  // Clases según tipo y selección
  const dadoClasses = [
    'dado',
    dado.esCorrupto ? 'corrupto' : 'base',
    isSelected ? 'selected' : '',
  ]
    .filter(Boolean)
    .join(' ');

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
      style={estiloDado}
      onClick={handleClick}
    >
      {mostrarValor()}
    </div>
  );
};

export default DadoComponent;
