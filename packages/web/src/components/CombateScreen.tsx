import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { socket } from '../socket';
import DadoComponent from './DadoComponent';

const CombateScreen: React.FC = () => {
  const { state } = useGame();
  const { partidaState } = state;
  const [selectedDice, setSelectedDice] = useState<string[]>([]);

  if (!partidaState || !partidaState.encuentroActual) {
    return <div>Cargando encuentro...</div>;
  }

  const { encuentroActual, dadosBase, dadosCorrupcion, mensaje } = partidaState;

  const allowSelection =
    partidaState.dadosLanzados && partidaState.estadoJuego === 'combate';

  const handleLanzarDados = () => {
    if (partidaState.dadosLanzados || partidaState.estadoJuego !== 'combate') return;
    setSelectedDice([]);
    socket.emit('cliente:lanzar_dados');
  };

  const handleSeleccionarDado = (dadoId: string) => {
    if (!allowSelection) return;
    if (selectedDice.includes(dadoId)) {
      setSelectedDice((prev) => prev.filter((id) => id !== dadoId));
    } else if (selectedDice.length < 2) {
      setSelectedDice((prev) => [...prev, dadoId]);
    }
  };

  const handleConfirmarSeleccion = () => {
    if (selectedDice.length !== 2) {
      return alert('Debes seleccionar exactamente 2 dados.');
    }
    socket.emit('cliente:seleccionar_dados', {
      dadoId1: selectedDice[0],
      dadoId2: selectedDice[1],
    });
    setSelectedDice([]);
  };

  const handleUsarHabilidad = (habilidadId: 'aumentar_dado' | 'voltear_dado' | 'relanzar_dado') => {
    if (!allowSelection) return;
    if (selectedDice.length !== 1) {
      return alert('Selecciona exactamente 1 dado para usar la habilidad.');
    }
    const dadoId = selectedDice[0];
    socket.emit('cliente:usar_habilidad', { habilidadId, dadoId });
  };

  const todosLosDados = [...dadosBase, ...dadosCorrupcion];

  return (
    <div className="combate-screen" style={{ padding: '20px', textAlign: 'center' }}>
      <h2>{encuentroActual.nombre}</h2>
      <h1>OBJETIVO: {encuentroActual.objetivo}+</h1>
      <p className="mensaje">{mensaje}</p>

      {/* Área de Dados */}
      <div className="dado-area">
        {todosLosDados.map((dado) => (
          <DadoComponent
            key={dado.id}
            dado={dado}
            disabled={!allowSelection}
            isSelected={selectedDice.includes(dado.id)}
            onClick={() => handleSeleccionarDado(dado.id)}
          />
        ))}
      </div>

      {/* Botones de Habilidad */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          marginTop: '10px',
        }}
      >
        <button
          className="retro-button small ability-btn"
          onClick={() => handleUsarHabilidad('aumentar_dado')}
          disabled={!allowSelection}
          title="Aumentar Dado (1 Energía)"
        >
          +
        </button>
        <button
          className="retro-button small ability-btn"
          onClick={() => handleUsarHabilidad('voltear_dado')}
          disabled={!allowSelection}
          title="Voltear Dado (2 Energía)"
        >
          ↕
        </button>
        <button
          className="retro-button small ability-btn"
          onClick={() => handleUsarHabilidad('relanzar_dado')}
          disabled={!allowSelection}
          title="Relanzar Dado (1 Energía)"
        >
          ⟳
        </button>
      </div>

      {/* Botones de Acción */}
      <div className="action-area">
        <button
          onClick={handleLanzarDados}
          disabled={partidaState.dadosLanzados || partidaState.estadoJuego !== 'combate'}
          className="retro-button danger chunky-shadow"
          style={{ fontSize: '20px', padding: '15px', minWidth: '200px', cursor: 'pointer' }}
        >
          {partidaState.dadosLanzados ? 'DADOS LANZADOS' : 'LANZAR DADOS'}
        </button>

        {selectedDice.length === 2 && (
          <button
            onClick={handleConfirmarSeleccion}
            className="retro-button success chunky-shadow"
          >
            CONFIRMAR SELECCIÓN
          </button>
        )}
      </div>
    </div>
  );
};

export default CombateScreen;
