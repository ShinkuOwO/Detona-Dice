import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { socket } from '../socket';
import DadoComponent from './DadoComponent';

const CombateScreen: React.FC = () => {
  const { state } = useGame();
  const { partidaState } = state;
  const [selectedDice, setSelectedDice] = useState<string[]>([]);
  const [showBag, setShowBag] = useState(false);

  if (!partidaState || !partidaState.encuentroActual) {
    return <div>Cargando encuentro...</div>;
  }

  const { encuentroActual, dadosBase, dadosCorrupcion, mensaje, consumibles } =
    partidaState;

  const allowSelection = partidaState.dadosLanzados && partidaState.estadoJuego === 'combate';

  const handleLanzarDados = () => {
    if (partidaState.dadosLanzados) return;
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

  const handleUsarConsumible = (itemId: string) => {
    socket.emit('cliente:usar_consumible', { itemId });
  };

  const todosLosDados = [...dadosBase, ...dadosCorrupcion];

  return (
    <div className="combate-screen" style={{ padding: '20px', textAlign: 'center' }}>
      <h2>{encuentroActual.nombre}</h2>
      <h1>OBJETIVO: {encuentroActual.objetivo}+</h1>
      <p className="mensaje">{mensaje}</p>

      {/* Barra superior de info rápida */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '30px',
          marginBottom: '10px',
          fontSize: '14px',
          color: 'var(--text-dim)',
        }}
      >
        <span>ENERGÍA: {partidaState.energia} / {partidaState.energiaMax}</span>
        <span>DADOS CORRUPTOS: {dadosCorrupcion.length}</span>
        <span>CONSUMIBLES: {consumibles?.length || 0}</span>
      </div>

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

      {/* Acciones principales */}
      <div className="action-area">
        <button
          onClick={handleLanzarDados}
          disabled={partidaState.dadosLanzados}
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

        {/* Botón de bolsa */}
        <button
          type="button"
          onClick={() => setShowBag((prev) => !prev)}
          className="retro-button chunky-shadow"
        >
          BOLSA ({consumibles?.length || 0})
        </button>
      </div>

      {/* Panel de Bolsa (simple dropdown) */}
      {showBag && (
        <div
          style={{
            marginTop: '15px',
            padding: '10px',
            border: '2px solid var(--color-panel-border)',
            backgroundColor: 'var(--color-panel-dark)',
            maxWidth: '400px',
            marginInline: 'auto',
            textAlign: 'left',
          }}
        >
          {(!consumibles || consumibles.length === 0) && (
            <p style={{ color: 'var(--text-dim)' }}>No tienes consumibles.</p>
          )}
          {consumibles &&
            consumibles.map((itemId, idx) => (
              <div
                key={`${itemId}-${idx}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '5px',
                  fontSize: '12px',
                }}
              >
                <span>{itemId}</span>
                <button
                  type="button"
                  className="retro-button small"
                  onClick={() => handleUsarConsumible(itemId)}
                >
                  USAR
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default CombateScreen;
