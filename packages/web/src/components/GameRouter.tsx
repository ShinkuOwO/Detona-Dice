import React from 'react';
import { useGame } from '../contexts/GameContext';

// Screens de estados de juego
import CombateScreen from './CombateScreen';
import MapaScreen from './MapaScreen';
import SubirNivelScreen from './SubirNivelScreen';
import PactoScreen from './PactoScreen';
import TiendaScreen from './TiendaScreen';
import EspectadorScreen from './EspectadorScreen';

// Layout
import Header from './Header';
import PanelIzquierdo from './PanelIzquierdo';
import PanelDerecho from './PanelDerecho';

const GameRouter: React.FC = () => {
  const { state } = useGame();
  const { partidaState } = state;

  const renderEstadoJuego = () => {
    if (!partidaState) {
      // Antes de tener partida cargada
      return <div className="text-center p-5">Esperando partida...</div>;
    }

    if (partidaState.estadoJuego === 'eliminado') {
      return <EspectadorScreen />;
    }

    switch (partidaState.estadoJuego) {
      case 'combate':
        return <CombateScreen />;
      case 'mapa':
        return <MapaScreen />;
      case 'subiendo_nivel':
      case 'subir_nivel':
        return <SubirNivelScreen />;
      case 'evento_pacto':
      case 'pacto':
        return <PactoScreen />;
      case 'tienda':
        return <TiendaScreen />;
      default:
        return (
          <div className="text-center p-5">
            Estado de juego desconocido: {partidaState.estadoJuego}
          </div>
        );
    }
  };

  return (
    // Contenedor principal de Bootstrap: Toma el 100% del viewport
    <div className="container-fluid vh-100 d-flex flex-column p-0 app-root-bg"> 
      
      {/* PRIMERA ZONA: HEADER (Fila superior de estadísticas) */}
      <div className="row g-0">
        <div className="col-12 p-2 app-header-bg">
          <Header /> 
        </div>
      </div>
      
      {/* SEGUNDA ZONA: CONTENIDO PRINCIPAL (3 Columnas) */}
      <div className="row g-0 flex-grow-1">
        
        {/* Columna Izquierda (3/12): Info. del Jugador / Habilidades */}
        <div className="col-3 h-100">
          <div className="panel-content h-100 retro-panel-left">
            <PanelIzquierdo />
          </div>
        </div>
        
        {/* Columna Central (6/12): El Tapete / Acción Principal */}
        <div className="col-6 h-100">
          <main className="panel-content h-100 retro-panel-main">
            {renderEstadoJuego()}
          </main>
        </div>
        
        {/* Columna Derecha (3/12): Carrera / Chat */}
        <div className="col-3 h-100">
          <div className="panel-content h-100 retro-panel-right">
            <PanelDerecho />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameRouter;
