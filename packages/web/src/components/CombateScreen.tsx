import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { socket } from '../socket';
import DadoComponent from './DadoComponent';
import styles from './CombateScreen.module.css';

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
    <div className={styles.combateScreen}>
      <h2 className={styles.encuentroNombre}>{encuentroActual.nombre}</h2>
      <h1 className={styles.objetivo}>OBJETIVO: {encuentroActual.objetivo}+</h1>
      <p className={styles.mensaje}>{mensaje}</p>

      {/* Barra superior de info rápida */}
      <div className={styles.infoBar}>
        <span>ENERGÍA: {partidaState.energia} / {partidaState.energiaMax}</span>
        <span>DADOS CORRUPTOS: {dadosCorrupcion.length}</span>
        <span>CONSUMIBLES: {consumibles?.length || 0}</span>
      </div>

      {/* Área de Dados */}
      <div className={styles.dadoArea}>
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
      <div className={styles.actionArea}>
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
        <div className={styles.bolsaPanel}>
          {(!consumibles || consumibles.length === 0) && (
            <p className={styles.bolsaVacia}>No tienes consumibles.</p>
          )}
          {consumibles &&
            consumibles.map((itemId, idx) => (
              <div
                key={`${itemId}-${idx}`}
                className={styles.itemConsumible}
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
