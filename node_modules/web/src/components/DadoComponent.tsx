import React from 'react';
import type { Dado } from '../contexts/GameContext';
import TooltipInfo from './TooltipInfo';

interface DadoProps {
  dado: Dado;
  isSelected: boolean;
  onClick: () => void;
  disabled: boolean;
  animationState?: 'none' | 'rolling' | 'flipping' | 'increasing'; // Different animation states
}

const DadoComponent: React.FC<DadoProps> = ({ dado, isSelected, onClick, disabled, animationState = 'none' }) => {
  // Clases de Bootstrap con estilo retro
  let dadoClasses = `dado-retro ${isSelected ? 'dado-seleccionado glow-retro' : ''} ${dado.esCorrupto ? 'dado-corrupto' : ''}`;
  
  if (animationState === 'rolling') dadoClasses += ' shake-retro';
  if (animationState === 'increasing') dadoClasses += ' pulse-retro';
  if (animationState === 'flipping') dadoClasses += ' bounce-retro';

  const mostrarValor = () => {
    if (dado.valor === 'CRANEO') return '??'; // opcional, mas claro que texto
    return dado.valor;
  };

  const handleClick = () => {
    if (disabled) return;
    onClick();
  };

  // Crear texto informativo para el tooltip
  const tooltipText = `ID: ${dado.id} | Valor: ${dado.valor} | ${dado.esCorrupto ? 'Dado Corrupto' : 'Dado Normal'}`;

  return (
    <TooltipInfo content={tooltipText} position="top">
      <div
        className={dadoClasses}
        onClick={handleClick}
      >
        {mostrarValor()}
      </div>
    </TooltipInfo>
  );
};

export default DadoComponent;
