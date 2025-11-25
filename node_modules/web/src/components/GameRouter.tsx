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
    // Contenedor principal (permitimos scroll y layout responsive)
    <div className="container-fluid d-flex flex-column p-0 app-root-bg" style={{ minHeight: '100vh' }}>
      <div className="row g-0">
        <div className="col-12 p-2 app-header-bg">
          <Header />
        </div>
      </div>

      <div className="row g-0">
        <div className="col-12 col-lg-3">
          <div className="panel-content retro-panel-left">
            <PanelIzquierdo />
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <main className="panel-content retro-panel-main">
            {renderEstadoJuego()}
          </main>
        </div>

        <div className="col-12 col-lg-3">
          <div className="panel-content retro-panel-right">
            <PanelDerecho />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameRouter;
