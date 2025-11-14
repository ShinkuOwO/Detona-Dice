import React from 'react';
import { useGame } from '../contexts/GameContext';
import { socket } from '../socket';

const TiendaScreen: React.FC = () => {
  const { state } = useGame();
  const { partidaState } = state;

  // Si no hay partida, o no estamos en tienda, salida defensiva
  if (!partidaState) {
    return <div>Cargando partida...</div>;
  }

  const { mensaje, tiendaActual, oro } = partidaState;

  // Si por alguna razón el servidor no envió tiendaActual
  if (partidaState.estadoJuego !== 'tienda' || !tiendaActual) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>TIENDA</h2>
        <p style={{ color: '#aaa', minHeight: '24px' }}>
          No hay tienda disponible ahora mismo.
        </p>
        <button
          className="retro-button chunky-shadow"
          onClick={() => socket.emit('cliente:salir_tienda')}
        >
          VOLVER AL MAPA
        </button>
      </div>
    );
  }

  const items = tiendaActual.items ?? [];

  const handleComprar = (itemId: string) => {
    socket.emit('cliente:comprar_tienda', { itemId });
  };

  const handleSalir = () => {
    socket.emit('cliente:salir_tienda');
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>🛒 TIENDA - PISO {tiendaActual.piso}</h2>

      <p style={{ color: '#aaa', minHeight: '24px' }}>{mensaje}</p>

      <p style={{ marginBottom: '15px' }}>
        <strong>Tu oro:</strong>{' '}
        <span style={{ color: 'var(--color-accent-yellow)' }}>{oro} G</span>
      </p>

      {items.length === 0 ? (
        <p style={{ color: '#888' }}>El mercader no tiene nada que vender...</p>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            maxWidth: '400px',
            margin: '0 auto 20px',
          }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="retro-panel"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ textAlign: 'left', maxWidth: '260px' }}>
                <div style={{ fontSize: '16px' }}>
                  <strong>{item.nombre}</strong>{' '}
                  <span style={{ color: '#888', fontSize: '12px' }}>
                    ({item.tipo})
                  </span>
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: 'var(--text-dim)',
                    marginTop: '4px',
                  }}
                >
                  {item.descripcion}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    color: 'var(--color-accent-yellow)',
                    marginBottom: '5px',
                  }}
                >
                  {item.precio} G
                </div>
                <button
                  className="retro-button small chunky-shadow"
                  onClick={() => handleComprar(item.id)}
                >
                  Comprar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        className="retro-button chunky-shadow"
        onClick={handleSalir}
      >
        VOLVER AL MAPA
      </button>
    </div>
  );
};

export default TiendaScreen;
