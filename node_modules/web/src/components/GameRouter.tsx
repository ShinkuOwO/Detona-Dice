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
      return <div>Esperando partida...</div>;
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
        return <SubirNivelScreen />;
      case 'evento_pacto':
        return <PactoScreen />;
      case 'tienda':
        return <TiendaScreen />;
      default:
        return (
          <div>
            Estado de juego desconocido: {partidaState.estadoJuego}
          </div>
        );
    }
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateAreas: `
          "header header header"
          "left main right"
        `,
        gridTemplateRows: 'auto 1fr',
        gridTemplateColumns: '300px 1fr 300px',
        minHeight: '100vh',
        gap: '10px',
        padding: '10px',
      }}
    >
      <div className="retro-panel" style={{ gridArea: 'header' }}>
        <Header />
      </div>

      <div className="retro-panel" style={{ gridArea: 'left' }}>
        <PanelIzquierdo />
      </div>

      <main className="retro-panel" style={{ gridArea: 'main' }}>
        {renderEstadoJuego()}
      </main>

      <div className="retro-panel" style={{ gridArea: 'right' }}>
        <PanelDerecho />
      </div>
    </div>
  );
};

export default GameRouter;
