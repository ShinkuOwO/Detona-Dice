import React from 'react';
import { useGame } from '../contexts/GameContext';
import { socket } from '../socket';
import styles from './TiendaScreen.module.css';

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
      <div className={styles.tiendaScreen}>
        <h2 className={styles.tituloTienda}>TIENDA</h2>
        <p className={styles.mensajeTienda}>
          No hay tienda disponible ahora mismo.
        </p>
        <button
          className={styles.botonSalir}
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
    <div className={styles.tiendaScreen}>
      <h2 className={styles.tituloTienda}>🛒 TIENDA - PISO {tiendaActual.piso}</h2>

      <p className={styles.mensajeTienda}>{mensaje}</p>

      {items.length === 0 ? (
        <p className={styles.sinItems}>El mercader no tiene nada que vender...</p>
      ) : (
        <div className={styles.listaItems}>
          {items.map((item) => (
            <div
              key={item.id}
              className={styles.itemTienda}
            >
              <div className={styles.descripcionItem}>
                <div className={styles.nombreItem}>
                  <strong>{item.nombre}</strong>{' '}
                  <span className={styles.tipoItem}>
                    ({item.tipo})
                  </span>
                </div>
                <div className={styles.descripcionItemTexto}>
                  {item.descripcion}
                </div>
              </div>

              <div>
                <div className={styles.precioItem}>
                  {item.precio} G
                </div>
                <button
                  className={`${styles.botonComprar} retro-button small chunky-shadow`}
                  onClick={() => handleComprar(item.id)}
                  disabled={oro < item.precio}
                >
                  Comprar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        className={`${styles.botonSalir} retro-button chunky-shadow`}
        onClick={handleSalir}
      >
        VOLVER AL MAPA
      </button>
    </div>
  );
};

export default TiendaScreen;
