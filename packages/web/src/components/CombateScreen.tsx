import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { socket } from '../socket';
import DadoComponent from './DadoComponent';
import { useNotification } from '../contexts/NotificationContext';

// Helper functions to calculate game state info
const getMaxDadosSeleccionables = (partida: any) => {
  const dadosExtra = partida.getModificador ? partida.getModificador('dados_extra') : (partida.modificadores?.dados_extra || 0);
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
    return <div className="container-fluid">Cargando encuentro...</div>;
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
        const allDiceIds = [...dadosBase, ...dadosCorrupcion].map(d => d.id);
        allDiceIds.forEach(id => {
          delete newAnimating[id];
        });
        return newAnimating;
      });
    }, 60); // 600ms to match the animation duration
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

  // Calcular porcentaje para la barra de progreso del objetivo
  const objetivoPorcentaje = Math.min(100, (sumaSeleccionados / encuentroActual.objetivo) * 100);

  return (
    <div className="container-fluid py-4">
      <div className="row">
        {/* Zona superior */}
        <div className="col-12 mb-4">
          <div className="card-retro p-4 text-center border-animated-retro">
            <h2 className="text-retro-primary mb-2">{encuentroActual.nombre}</h2>
            <div className="d-flex justify-content-center align-items-center gap-3 mb-3">
              <h1 className="text-retro-warning mb-0">OBJETIVO: {encuentroActual.objetivo}+</h1>
              <span className="badge-retro badge-retro-primary fs-5">{sumaSeleccionados}/{encuentroActual.objetivo}</span>
            </div>
            <div className="progress-retro mb-3" style={{ height: '30px' }}>
              <div 
                className="progress-retro-bar" 
                role="progressbar" 
                style={{ width: `${objetivoPorcentaje}%` }}
              >
                {sumaSeleccionados >= encuentroActual.objetivo ? '¡OBJETIVO CUMPLIDO!' : `${faltan} FALTAN`}
              </div>
            </div>
            <p className="alert-retro alert-retro-info mb-2">{mensaje}</p>
            <div className="d-flex justify-content-center gap-3 mt-2">
              <span className="badge-retro badge-retro-danger">DADOS CORRUPTOS: {dadosCorrupcion.length}</span>
              <span className="badge-retro badge-retro-warning">CONSUMIBLES: {consumibles?.length || 0}</span>
            </div>
          </div>
        </div>

        {/* Zona central: dados + resumen */}
        <div className="col-12 mb-4">
          <div className="card-retro p-4">
            <div className="d-flex justify-content-center flex-wrap gap-3 mb-4" style={{ minHeight: '100px' }}>
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

            <div className="d-flex justify-content-between align-items-center bg-dark bg-opacity-25 p-3 rounded">
              <div>
                <span className="badge-retro badge-retro-secondary me-2">
                  DADOS SELECCIONADOS ({selectedDice.length}/{maxSeleccionables})
                </span>
                <span className="badge-retro badge-retro-info">
                  SUMA: {sumaSeleccionados}
                </span>
              </div>
              <div>
                {sumaSeleccionados >= encuentroActual.objetivo ? (
                  <span className="badge-retro badge-retro-success">¡CUMPLIDO!</span>
                ) : (
                  <span className="badge-retro badge-retro-warning">FALTAN {faltan}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Zona inferior: habilidades + acción + bolsa */}
        <div className="col-12">
          <div className="d-flex flex-column flex-lg-row gap-4">
            {/* Habilidades */}
            <div className="flex-fill">
              <h3 className="text-retro text-center mb-3">HABILIDADES</h3>
              <div className="card-retro p-3">
                <div className="d-flex flex-wrap gap-2 justify-content-center mb-3">
                  <button
                    className="btn-retro btn-retro-secondary flex-fill mx-1"
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
                    className="btn-retro btn-retro-secondary flex-fill mx-1"
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
                    className="btn-retro btn-retro-secondary flex-fill mx-1"
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
                      }, 60); // 600ms to match the animation duration
                    }}
                    disabled={selectedDice.length !== 1 || partidaState.energia < 1}
                    title="Relanzar Dado (cuesta 1 energía)"
                  >
                    [↻] Relanzar (1⚡)
                  </button>
                </div>
                <div className="text-center">
                  <span className="badge-retro badge-retro-primary fs-5 px-4 py-2">
                    ENERGÍA: {partidaState.energia}/{partidaState.energiaMax}
                  </span>
                </div>
              </div>
            </div>

            {/* Acción principal */}
              <div className="d-flex flex-column justify-content-center align-items-center px-3">
              <button
                onClick={partidaState.dadosLanzados ? handleConfirmarSeleccion : handleLanzarDados}
                disabled={botonPrincipalLabel !== 'LANZAR DADOS' && !seleccionCompleta}
                className={`btn-retro ${botonPrincipalLabel === 'LANZAR DADOS' ? 'btn-retro-primary' : 'btn-retro-danger'} fs-4 px-5 py-3 glow-retro`}
              >
                {botonPrincipalLabel}
              </button>
              <div className="mt-3 text-center w-100">
                <div className="progress-retro mb-2" style={{ height: '20px' }}>
                  <div 
                    className="progress-retro-bar" 
                    role="progressbar" 
                    style={{ width: `${(partidaState.hp / partidaState.hpMax) * 100}%` }}
                  >
                    HP: {partidaState.hp}/{partidaState.hpMax}
                  </div>
                </div>
                <div className="progress-retro" style={{ height: '20px' }}>
                  <div 
                    className="progress-retro-bar" 
                    role="progressbar" 
                    style={{ width: `${(partidaState.xp / partidaState.xpParaNivel) * 100}%` }}
                  >
                    XP: {partidaState.xp}/{partidaState.xpParaNivel}
                  </div>
                </div>
              </div>
            </div>

            {/* Bolsa */}
            <div className="flex-fill">
              <h3 className="text-retro text-center mb-3">BOLSA</h3>
              <div className="card-retro p-3 h-100 d-flex flex-column">
                <button
                  type="button"
                  onClick={() => setShowBag(true)}
                  className="btn-retro btn-retro-warning flex-fill mb-3 py-3"
                >
                  CONSUMIBLES ({consumibles?.length || 0})
                </button>
                {(!consumibles || consumibles.length === 0) && (
                  <p className="text-center text-muted fst-italic flex-fill d-flex align-items-center justify-content-center">
                    No tienes consumibles.
                  </p>
                )}
                <div className="mt-auto pt-2 border-top border-secondary">
                  <span className="badge-retro badge-retro-warning w-100 d-block">ORO: {partidaState.oro}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Bolsa */}
      {showBag && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setShowBag(false)}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content modal-content-retro">
              <div className="modal-header modal-header-retro d-flex justify-content-between align-items-center">
                <h5 className="modal-title text-retro">BOLSA DE CONSUMIBLES</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowBag(false)}></button>
              </div>
              <div className="modal-body bg-dark bg-opacity-25">
                {(!consumibles || consumibles.length === 0) && (
                  <p className="text-center fst-italic">No tienes consumibles.</p>
                )}
                {consumibles &&
                  consumibles.map((itemId, idx) => (
                    <div
                      key={`${itemId}-${idx}`}
                      className="d-flex justify-content-between align-items-center bg-dark bg-opacity-25 p-2 mb-2 rounded"
                    >
                      <span className="flex-fill">{itemId}</span>
                      <button
                        type="button"
                        className="btn-retro btn-retro-success ms-2"
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
        </div>
      )}
    </div>
  );
};

export default CombateScreen;
