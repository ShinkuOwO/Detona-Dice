import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { socket } from '../socket';
import DadoComponent from './DadoComponent';
import styles from './CombateScreen.module.css';
import { useNotification } from '../contexts/NotificationContext';

// Helper functions to calculate game state info
const getMaxDadosSeleccionables = (partida: any) => {
  const dadosExtra = partida.getModificador('dados_extra') || 0;
  return 2 + dadosExtra; // Por defecto se pueden seleccionar 2 dados, más los dados extra de las reliquias
};

const getSumaSeleccionados = (partida: any, selectedDice: string[]) => {
  const todosLosDados = [...partida.dadosBase, ...partida.dadosCorrupcion];
  const dadosSeleccionados = todosLosDados.filter(d => selectedDice.includes(d.id));
  return dadosSeleccionados.reduce((sum, dado) => sum + (dado.valor || 0), 0);
};

const CombateScreen: React.FC = () => {
  const { state } = useGame();
  const { partidaState } = state;
  const [selectedDice, setSelectedDice] = useState<string[]>([]);
  const [showBag, setShowBag] = useState(false);
  const [animatingDice, setAnimatingDice] = useState<Record<string, 'rolling' | 'flipping' | 'increasing'>>({});
  const { addNotification } = useNotification();

  if (!partidaState || !partidaState.encuentroActual) {
    return <div>Cargando encuentro...</div>;
  }

  const { encuentroActual, dadosBase, dadosCorrupcion, mensaje, consumibles } = partidaState;

  const allowSelection = partidaState.dadosLanzados && partidaState.estadoJuego === 'combate';
  const maxSeleccionables = getMaxDadosSeleccionables(partidaState);
  const sumaSeleccionados = getSumaSeleccionados(partidaState, selectedDice);
  const faltan = Math.max(0, encuentroActual.objetivo - sumaSeleccionados);
  const seleccionCompleta = selectedDice.length === maxSeleccionables;

  const allDiceIds = [...dadosBase, ...dadosCorrupcion].map(d => d.id);

  const handleLanzarDados = () => {
    if (partidaState.dadosLanzados) return;
    setSelectedDice([]);
    
    // Trigger rolling animation for all dice
    const animationState: Record<string, 'rolling'> = {};
    allDiceIds.forEach(id => {
      animationState[id] = 'rolling';
    });
    setAnimatingDice(prev => ({ ...prev, ...animationState }));
    
    // Emit the socket event after a short delay to allow animation to start
    setTimeout(() => {
      socket.emit('cliente:lanzar_dados');
    }, 300); // 300ms to allow animation to play
    
    // Remove the animation classes after animation completes
    setTimeout(() => {
      setAnimatingDice(prev => {
        const newAnimating = { ...prev };
        allDiceIds.forEach(id => {
          delete newAnimating[id];
        });
        return newAnimating;
      });
    }, 600); // 600ms to match the animation duration
  };

  const handleSeleccionarDado = (dadoId: string) => {
    if (!allowSelection) return;
    if (selectedDice.includes(dadoId)) {
      setSelectedDice((prev) => prev.filter((id) => id !== dadoId));
    } else if (selectedDice.length < maxSeleccionables) {
      setSelectedDice((prev) => [...prev, dadoId]);
    }
  };

  const handleConfirmarSeleccion = () => {
    if (selectedDice.length !== maxSeleccionables) {
      addNotification('error', `Debes seleccionar exactamente ${maxSeleccionables} dados para confirmar.`);
      return;
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

  const botonPrincipalLabel = (() => {
    if (!partidaState.dadosLanzados) return 'LANZAR DADOS';
    if (!seleccionCompleta) return `ELIGE ${maxSeleccionables} DADOS`;
    return 'CONFIRMAR SELECCIÓN';
  })();

  return (
    <div className={styles.combateScreen}>
      {/* Zona superior */}
      <section className={styles.combateTop}>
        <div className={styles.encuentroInfo}>
          <h2>{encuentroActual.nombre}</h2>
          <h1 className={styles.objetivo}>OBJETIVO: {encuentroActual.objetivo}+</h1>
          <p className={styles.mensajeTurno}>{mensaje}</p>
          <div className={styles.tagsMods}>
            <span>DADOS CORRUPTOS: {dadosCorrupcion.length}</span>
            <span>CONSUMIBLES: {consumibles?.length || 0}</span>
            {/* Más tags de pactos/mods si quieres */}
          </div>
        </div>
      </section>

      {/* Zona central: dados + resumen */}
      <section className={styles.combateMiddle}>
        <div className={styles.dadosRow}>
          {[...dadosBase, ...dadosCorrupcion].map((dado) => {
            // Determine animation state for this die
            const animationState = animatingDice[dado.id] || 
              (partidaState.dadosLanzados && !dado.valor ? 'rolling' : 'none');
            
            return (
              <DadoComponent
                key={dado.id}
                dado={dado}
                disabled={!allowSelection}
                isSelected={selectedDice.includes(dado.id)}
                animationState={animationState}
                onClick={() => handleSeleccionarDado(dado.id)}
              />
            );
          })}
        </div>

        <div className={styles.resumenSeleccion}>
          <span>
            DADOS SELECCIONADOS ({selectedDice.length}/{maxSeleccionables})
          </span>
          <span>
            SUMA: {sumaSeleccionados} / OBJETIVO: {encuentroActual.objetivo}
            {' '}
            {sumaSeleccionados >= encuentroActual.objetivo
              ? '✓ CUMPLIDO'
              : ` · FALTAN ${faltan}`}
          </span>
        </div>
      </section>

      {/* Zona inferior: habilidades + acción + bolsa */}
      <section className={styles.combateBottom}>
        {/* Habilidades */}
        <div className={styles.habilidadesColumn}>
          <h3>HABILIDADES</h3>
          <div className={styles.habilidadesList}>
            <button
              className={`${styles.abilityBtn} retro-button chunky-shadow`}
              onClick={() => {
                if (selectedDice.length !== 1) return;
                // Trigger the increasing animation for the selected die
                setAnimatingDice(prev => ({
                  ...prev,
                  [selectedDice[0]]: 'increasing'
                }));
                
                // After a short delay, emit the socket event
                setTimeout(() => {
                  socket.emit('cliente:usar_habilidad', { habilidadId: 'aumentar_dado', dadoId: selectedDice[0] });
                }, 300); // 300ms to allow animation to play
                
                // Remove the animation class after animation completes
                setTimeout(() => {
                  setAnimatingDice(prev => {
                    const newAnimating = { ...prev };
                    delete newAnimating[selectedDice[0]];
                    return newAnimating;
                  });
                }, 600); // 600ms to match the animation duration
              }}
              disabled={selectedDice.length !== 1 || partidaState.energia < 1}
              title="Aumentar Dado (+1 al valor, cuesta 1 energía)"
            >
              [+] Aumentar (1⚡)
            </button>
            <button
              className={`${styles.abilityBtn} retro-button chunky-shadow`}
              onClick={() => {
                if (selectedDice.length !== 1) return;
                // Trigger the flipping animation for the selected die
                setAnimatingDice(prev => ({
                  ...prev,
                  [selectedDice[0]]: 'flipping'
                }));
                
                // After a short delay, emit the socket event
                setTimeout(() => {
                  socket.emit('cliente:usar_habilidad', { habilidadId: 'voltear_dado', dadoId: selectedDice[0] });
                }, 300); // 300ms to allow animation to play
                
                // Remove the animation class after animation completes
                setTimeout(() => {
                  setAnimatingDice(prev => {
                    const newAnimating = { ...prev };
                    delete newAnimating[selectedDice[0]];
                    return newAnimating;
                  });
                }, 600); // 600ms to match the animation duration
              }}
              disabled={selectedDice.length !== 1 || partidaState.energia < 2}
              title="Voltear Dado (7 - valor, cuesta 2 energía)"
            >
              [⇄] Voltear (2⚡)
            </button>
            <button
              className={`${styles.abilityBtn} retro-button chunky-shadow`}
              onClick={() => {
                if (selectedDice.length !== 1) return;
                // Trigger the rolling animation for the selected die
                setAnimatingDice(prev => ({
                  ...prev,
                  [selectedDice[0]]: 'rolling'
                }));
                
                // After a short delay, emit the socket event
                setTimeout(() => {
                  socket.emit('cliente:usar_habilidad', { habilidadId: 'relanzar_dado', dadoId: selectedDice[0] });
                }, 300); // 300ms to allow animation to play
                
                // Remove the animation class after animation completes
                setTimeout(() => {
                  setAnimatingDice(prev => {
                    const newAnimating = { ...prev };
                    delete newAnimating[selectedDice[0]];
                    return newAnimating;
                  });
                }, 600); // 600ms to match the animation duration
              }}
              disabled={selectedDice.length !== 1 || partidaState.energia < 1}
              title="Relanzar Dado (cuesta 1 energía)"
            >
              [↻] Relanzar (1⚡)
            </button>
          </div>
          <div className={styles.energiaInfo}>
            ENERGÍA: {partidaState.energia}/{partidaState.energiaMax}
          </div>
        </div>

        {/* Acción principal */}
        <div className={styles.accionColumn}>
          <button
            onClick={partidaState.dadosLanzados ? handleConfirmarSeleccion : handleLanzarDados}
            disabled={botonPrincipalLabel !== 'LANZAR DADOS' && !seleccionCompleta}
            className="retro-button retro-button-danger chunky-shadow responsive-button accionPrincipal"
            style={{ fontSize: '18px', padding: '12px 20px', minWidth: '150px', cursor: 'pointer' }}
          >
            {botonPrincipalLabel}
          </button>
        </div>

        {/* Bolsa */}
        <div className={styles.bolsaColumn}>
          <button
            type="button"
            onClick={() => setShowBag(true)}
            className="retro-button chunky-shadow"
          >
            BOLSA ({consumibles?.length || 0})
          </button>
          {(!consumibles || consumibles.length === 0) && (
            <p className={styles.bolsaVacia}>No tienes consumibles.</p>
          )}
        </div>
      </section>

      {/* Modal de Bolsa */}
      {showBag && (
        <div className={styles.modalOverlay} onClick={() => setShowBag(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>BOLSA DE CONSUMIBLES</h3>
              <button className={`${styles.closeButton} retro-button`} onClick={() => setShowBag(false)}>X</button>
            </div>
            <div className={styles.modalBody}>
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
                      className="retro-button retro-button-small chunky-shadow"
                      onClick={() => {
                        handleUsarConsumible(itemId);
                        setShowBag(false); // Close the modal after using an item
                      }}
                    >
                      USAR
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CombateScreen;
