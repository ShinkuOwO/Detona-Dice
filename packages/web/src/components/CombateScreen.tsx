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
    return <div className="d-flex justify-content-center align-items-center h-100">Cargando encuentro...</div>;
  }

  const { encuentroActual, dadosBase, dadosCorrupcion, mensaje, consumibles } = partidaState;

  const allowSelection = partidaState.dadosLanzados && partidaState.estadoJuego === 'combate';
  const maxSeleccionables = getMaxDadosSeleccionables(partidaState);
  const sumaSeleccionados = getSumaSeleccionados(partidaState, selectedDice);
  const faltan = Math.max(0, encuentroActual.objetivo - sumaSeleccionados);
  const seleccionCompleta = selectedDice.length === maxSeleccionables;
  const energiaLabel = `${partidaState.energia}/${partidaState.energiaMax}`;
  const rondaLabel = `Ronda ${partidaState.rondaActual ?? 1}`;
  const consumiblesTotal = consumibles?.length || 0;

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
    }, 600); // 600ms para acompañar la animación
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

    const payload: Record<string, string> = {};
    selectedDice.forEach((id, idx) => {
      payload[`dadoId${idx + 1}`] = id;
    });

    socket.emit('cliente:seleccionar_dados', payload);
    setSelectedDice([]);
  };

  const handleUsarConsumible = (itemId: string) => {
    socket.emit('cliente:usar_consumible', { itemId });
  };

  const botonPrincipalLabel = (() => {
    if (!partidaState.dadosLanzados) return 'LANZAR DADOS';
    if (!seleccionCompleta) return `ELIGE ${maxSeleccionables} DADOS`;
        return 'CONFIRMAR SELECCION';
  })();

  const primaryActionClass = `btn-retro ${
    botonPrincipalLabel === 'LANZAR DADOS' ? 'btn-retro-primary' : 'btn-retro-danger'
  } px-5 py-3 glow-retro`;

  // Calcular porcentaje para la barra de progreso del objetivo
  const objetivoPorcentaje = Math.min(100, (sumaSeleccionados / encuentroActual.objetivo) * 100);

  return (
    <div className="combat-shell">
      <div className="combat-top">
          <div className="combat-card dossier">
            <div className="eyebrow">ENCUENTRO ACTUAL</div>
            <div className="dossier-head">
              <div>
                <h2 className="title glitch-text" data-text={encuentroActual.nombre}>{encuentroActual.nombre}</h2>
                <p className="subtitle">{mensaje}</p>
              </div>
              <div className="seal-retro">RUNA #{partidaState.rondaActual ?? 1}</div>
            </div>
          <div className="chip-row">
            <span className="chip chip-danger">Dados corruptos: {dadosCorrupcion.length}</span>
            <span className="chip chip-mono">Dados totales: {dadosBase.length + dadosCorrupcion.length}</span>
            <span className="chip chip-amber">Consumibles: {consumibles?.length || 0}</span>
          </div>
        </div>

        <div className="combat-card objective">
          <div className="eyebrow">OBJETIVO</div>
          <div className="objective-value glitch-text" data-text={`${encuentroActual.objetivo}+`}>{encuentroActual.objetivo}+</div>
          <div className="progress-retro thick">
            <div
              className="progress-retro-bar"
              role="progressbar"
              style={{ width: `${objetivoPorcentaje}%` }}
            >
              {sumaSeleccionados >= encuentroActual.objetivo ? '¡LISTO!' : `${faltan} por cubrir`}
            </div>
          </div>
          <div className="objective-readout">
            <span className="chip chip-info">Suma: {sumaSeleccionados}</span>
            <span className="chip chip-ghost">Selección {selectedDice.length}/{maxSeleccionables}</span>
          </div>
          <div className="objective-foot">
            <span className="chip chip-ghost">Dados base: {dadosBase.length}</span>
            <span className="chip chip-danger">Corruptos: {dadosCorrupcion.length}</span>
          </div>
        </div>
      </div>

      <div className="combat-body">
        <div className="combat-stage">
          <div className="stage-header">
            <div>
              <div className="eyebrow">MESA DE DADOS</div>
              <p className="muted">Fase unica: lanza, marca y confirma. Menos ruido, mas claridad.</p>
            </div>
          </div>

          <div className="status-rail">
            <div className={`rail-badge ${allowSelection ? 'primary' : 'ghost'}`}>
              <span className="label">Fase</span>
              <strong>{allowSelection ? 'Seleccion' : 'Lanzamiento'}</strong>
              <small>{allowSelection ? 'Marca y confirma tus dados' : 'Pulsa lanzar para empezar'}</small>
            </div>
            <div className="rail-badge ghost">
              <span className="label">Ritmo</span>
              <strong>{rondaLabel}</strong>
              <small>Turno en curso</small>
            </div>
            <div className="rail-badge accent">
              <span className="label">energia</span>
              <strong>{energiaLabel}</strong>
              <small>Gestion unica de recursos</small>
            </div>
            <div className="rail-badge">
              <span className="label">Bolsa</span>
              <strong>{consumiblesTotal} item(s)</strong>
              <small>Listos para usar</small>
            </div>
            <div className={`rail-badge ${sumaSeleccionados >= encuentroActual.objetivo ? 'success' : 'warning'}`}>
              <span className="label">Objetivo</span>
              <strong>{sumaSeleccionados >= encuentroActual.objetivo ? 'Cubierto' : `Faltan ${faltan}`}</strong>
              <small>Objetivo {encuentroActual.objetivo}+</small>
            </div>
            <div className="rail-badge">
              <span className="label">Seleccion</span>
              <strong>{selectedDice.length}/{maxSeleccionables}</strong>
              <small>Dados marcados</small>
            </div>
          </div>

          <div className="dice-grid">
            {[...dadosBase, ...dadosCorrupcion].map((dado) => {
              const animationState =
                animatingDice[dado.id] || (partidaState.dadosLanzados && !dado.valor ? 'rolling' : 'none');

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
        </div>

        <div className="combat-sidebar">
          <div className="combat-card vitals">
            <div className="eyebrow">ESTADO DEL JUGADOR</div>
            <div className="bar-group">
              <label>HP</label>
              <div className="progress-retro thin">
                <div
                  className="progress-retro-bar"
                  role="progressbar"
                  style={{ width: `${(partidaState.hp / partidaState.hpMax) * 100}%` }}
                >
                  {partidaState.hp}/{partidaState.hpMax}
                </div>
              </div>
              <label>XP</label>
              <div className="progress-retro thin xp">
                <div
                  className="progress-retro-bar"
                  role="progressbar"
                  style={{ width: `${(partidaState.xp / partidaState.xpParaNivel) * 100}%` }}
                >
                  {partidaState.xp}/{partidaState.xpParaNivel}
                </div>
              </div>
              <label>Economia</label>
              <div className="chip-row compact">
                <span className="chip chip-ghost">Oro: {partidaState.oro}</span>
              </div>
            </div>
          </div>

          <div className="combat-card abilities">
            <div className="eyebrow">HABILIDADES</div>
            <div className="ability-grid">
              <button
                className="btn-retro btn-retro-secondary"
                onClick={() => {
                  if (selectedDice.length !== 1) return;
                  setAnimatingDice((prev) => ({
                    ...prev,
                    [selectedDice[0]]: 'increasing',
                  }));

                  setTimeout(() => {
                    socket.emit('cliente:usar_habilidad', { habilidadId: 'aumentar_dado', dadoId: selectedDice[0] });
                  }, 300);

                  setTimeout(() => {
                    setAnimatingDice((prev) => {
                      const newAnimating = { ...prev };
                      delete newAnimating[selectedDice[0]];
                      return newAnimating;
                    });
                  }, 600);
                }}
                disabled={selectedDice.length !== 1 || partidaState.energia < 1}
                title="Aumentar Dado (+1 al valor, cuesta 1 energia)"
              >
                [+] Aumentar (1⚡)
              </button>

              <button
                className="btn-retro btn-retro-secondary"
                onClick={() => {
                  if (selectedDice.length !== 1) return;
                  setAnimatingDice((prev) => ({
                    ...prev,
                    [selectedDice[0]]: 'flipping',
                  }));

                  setTimeout(() => {
                    socket.emit('cliente:usar_habilidad', { habilidadId: 'voltear_dado', dadoId: selectedDice[0] });
                  }, 300);

                  setTimeout(() => {
                    setAnimatingDice((prev) => {
                      const newAnimating = { ...prev };
                      delete newAnimating[selectedDice[0]];
                      return newAnimating;
                    });
                  }, 600);
                }}
                disabled={selectedDice.length !== 1 || partidaState.energia < 2}
                title="Voltear Dado (7 - valor, cuesta 2 energia)"
              >
                [⇄] Voltear (2?)
              </button>

              <button
                className="btn-retro btn-retro-secondary"
                onClick={() => {
                  if (selectedDice.length !== 1) return;
                  setAnimatingDice((prev) => ({
                    ...prev,
                    [selectedDice[0]]: 'rolling',
                  }));

                  setTimeout(() => {
                    socket.emit('cliente:usar_habilidad', { habilidadId: 'relanzar_dado', dadoId: selectedDice[0] });
                  }, 300);

                  setTimeout(() => {
                    setAnimatingDice((prev) => {
                      const newAnimating = { ...prev };
                      delete newAnimating[selectedDice[0]];
                      return newAnimating;
                    });
                  }, 600);
                }}
                disabled={selectedDice.length !== 1 || partidaState.energia < 1}
                title="Relanzar Dado (cuesta 1 energia)"
              >
                [↻] Relanzar (1?)
              </button>
            </div>
            <p className="muted small">Selecciona primero un dado para habilitar estas acciones.</p>
          </div>

          <div className="combat-card bag">
            <div className="eyebrow">BOLSA</div>
            <p className="muted small mb-2">Consumibles disponibles para el turno.</p>
            <button
              type="button"
              onClick={() => setShowBag(true)}
              className="btn-retro btn-retro-warning w-100"
            >
              Abrir bolsa ({consumibles?.length || 0})
            </button>
            {(!consumibles || consumibles.length === 0) && (
              <p className="muted small text-center mt-3">No tienes consumibles.</p>
            )}
          </div>
        </div>
      </div>

      <div className="combat-cta">
        <div className="cta-copy">
          <div className="eyebrow">SIGUE EL RITUAL</div>
          <p className="muted">1) Lanza, 2) Marca dados, 3) Confirma. La UI se mantiene limpia: solo lo esencial por fase.</p>
        </div>
        <button
          onClick={partidaState.dadosLanzados ? handleConfirmarSeleccion : handleLanzarDados}
          disabled={botonPrincipalLabel !== 'LANZAR DADOS' && !seleccionCompleta}
          className={`${primaryActionClass} floaty pixel-glow`}
        >
          {botonPrincipalLabel}
        </button>
      </div>

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
                          setShowBag(false);
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








