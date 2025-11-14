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
    } else if (selectedDice.length < partidaState.getMaxDadosSeleccionables()) {
      setSelectedDice((prev) => [...prev, dadoId]);
    }
  };

  const handleConfirmarSeleccion = () => {
    const maxDados = partidaState.getMaxDadosSeleccionables();
    if (selectedDice.length < 2 || selectedDice.length > maxDados) {
      return alert(`Debes seleccionar entre 2 y ${maxDados} dados.`);
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
            isLanzando={partidaState.dadosLanzados && !dado.valor} // Mostrar animación si los dados están lanzándose pero aún no tienen valor
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

      {/* Habilidades */}
      {partidaState.dadosLanzados && (
        <div className={styles.habilidadesArea}>
          <h3>HABILIDADES</h3>
          <div className={styles.habilidadesBotones}>
            <button
              className={`${styles.abilityBtn} retro-button chunky-shadow`}
              onClick={() => socket.emit('cliente:usar_habilidad', { habilidadId: 'aumentar_dado', dadoId: selectedDice[0] })}
              disabled={selectedDice.length !== 1 || partidaState.energia < 1}
              title="Aumentar Dado (+1 al valor, cuesta 1 energía)"
            >
              [+] Aumentar
            </button>
            <button
              className={`${styles.abilityBtn} retro-button chunky-shadow`}
              onClick={() => socket.emit('cliente:usar_habilidad', { habilidadId: 'voltear_dado', dadoId: selectedDice[0] })}
              disabled={selectedDice.length !== 1 || partidaState.energia < 2}
              title="Voltear Dado (7 - valor, cuesta 2 energía)"
            >
              [⇄] Voltear
            </button>
            <button
              className={`${styles.abilityBtn} retro-button chunky-shadow`}
              onClick={() => socket.emit('cliente:usar_habilidad', { habilidadId: 'relanzar_dado', dadoId: selectedDice[0] })}
              disabled={selectedDice.length !== 1 || partidaState.energia < 1}
              title="Relanzar Dado (cuesta 1 energía)"
            >
              [↻] Relanzar
            </button>
          </div>
        </div>
      )}

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
