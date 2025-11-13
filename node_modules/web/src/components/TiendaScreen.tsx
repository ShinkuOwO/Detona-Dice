import React from 'react';
import { useGame } from '../contexts/GameContext';
import { socket } from '../socket';

const TiendaScreen: React.FC = () => {
  const { state } = useGame();
  const { partidaState } = state;

  if (!partidaState) {
    return <div style={{ padding: '20px' }}>Cargando tienda...</div>;
  }

  const tienda = (partidaState as any).tiendaActual ?? null;

  const handleComprar = (itemId: string) => {
    socket.emit('cliente:comprar_tienda', { itemId });
  };

  const handleSalir = () => {
    socket.emit('cliente:salir_tienda');
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>TIENDA</h2>
      <p style={{ color: '#aaa', minHeight: '24px' }}>{partidaState.mensaje}</p>

      {!tienda && (
        <>
          <p>(La tienda actual es un stub: el servidor te cura 5HP y te devuelve al mapa.)</p>
          <button className="retro-button chunky-shadow" onClick={handleSalir}>
            VOLVER AL MAPA
          </button>
        </>
      )}

      {tienda && (
        <>
          <h3>Ofertas del piso {tienda.piso}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            {tienda.items.map((item: any) => (
              <div
                key={item.id}
                className="retro-panel"
                style={{ padding: '10px', textAlign: 'left' }}
              >
                <div style={{ fontSize: '16px' }}>
                  {item.nombre} — {item.precio} oro
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                  {item.descripcion}
                </div>
                <button
                  className="retro-button small chunky-shadow"
                  onClick={() => handleComprar(item.id)}
                  style={{ marginTop: '5px' }}
                >
                  COMPRAR
                </button>
              </div>
            ))}
          </div>
          <button
            className="retro-button chunky-shadow"
            style={{ marginTop: '15px' }}
            onClick={handleSalir}
          >
            SALIR DE LA TIENDA
          </button>
        </>
      )}
    </div>
  );
};

export default TiendaScreen;
