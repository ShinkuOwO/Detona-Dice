import React from 'react';
import { useGame } from '../contexts/GameContext';
import { socket } from '../socket';
import { useNotification } from '../contexts/NotificationContext';
import TooltipInfo from './TooltipInfo';

const PactoScreen: React.FC = () => {
  const { state } = useGame();
  const { partidaState } = state;
  const { addNotification } = useNotification();

  if (!partidaState || !partidaState.opcionesPacto) {
    return <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-12 text-center">
          <div className="card-retro p-5">
            <h2 className="text-retro">CARGANDO PACTO...</h2>
          </div>
        </div>
      </div>
    </div>;
  }

  const { opcionesPacto, mensaje, oro } = partidaState;

  const handleElegir = (pactoId: string) => {
    socket.emit('cliente:aceptar_pacto', { pactoId });
  };
  
  const handleReroll = () => {
    if (oro < 10) {
      addNotification('error', '¡Oro insuficiente para reroll!');
      return;
    }
    socket.emit('cliente:reroll_mejoras');
  };

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-12 text-center mb-4">
          <div className="card-retro p-4 border-animated-retro">
            <h2 className="text-retro-primary">EVENTO MISTERIOSO</h2>
            <p className="alert-retro alert-retro-info">{mensaje}</p>
            <h3 className="text-retro-danger">Se te ofrece poder, a un costo...</h3>
          </div>
        </div>
      </div>
      
      <div className="row justify-content-center mb-4">
        <div className="col-12">
          <div className="d-flex flex-wrap justify-content-center gap-4">
            {opcionesPacto.map((opcion, index) => { 
              // Separar el texto en nombre y descripción
              const [nombre, descripcion] = opcion.texto.split(' - ');
              return (
                <div key={opcion.id} className="card-retro p-3" style={{ minWidth: '300px', maxWidth: '350px' }}>
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="card-title text-retro-primary flex-grow-1">{nombre}</h5>
                      <TooltipInfo content={descripcion} position="top">
                        <span className="badge-retro badge-retro-info ms-2">?</span>
                      </TooltipInfo>
                    </div>
                    <p className="card-text flex-grow-1">{descripcion}</p>
                    <button
                      onClick={() => handleElegir(opcion.id)}
                      className="btn-retro btn-retro-danger w-100 mt-auto"
                    >
                      ACEPTAR PACTO
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="row justify-content-center">
        <div className="col-auto">
          <div className="d-flex flex-column align-items-center">
            <span className="badge-retro badge-retro-warning fs-5 mb-3">ORO: {oro}</span>
            <button 
              onClick={handleReroll} 
              disabled={oro < 10}
              className="btn-retro btn-retro-warning px-4 py-2"
            >
              REROLL (10 ORO)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PactoScreen;
