import React, { useEffect } from 'react';
import { useGame } from './contexts/GameContext';
import type{
  Sala,
  PartidaState,
  CarreraState,
  ResultadosFin,
  MensajeChat,
} from './contexts/GameContext';
import { socket } from './socket';

// Importar Bootstrap y estilos retro
import 'bootstrap/dist/css/bootstrap.min.css';
import 'animate.css';
import './styles/bootstrap-retro.css';

import LobbyScreen from './components/LobbyScreen';
import GameRouter from './components/GameRouter';
import LoginScreen from './components/LoginScreen';
import ResultsScreen from './components/ResultsScreen';
import NotificationBar from './components/NotificationBar';
import { NotificationProvider } from './contexts/NotificationContext';

const AppContent: React.FC = () => {
  const { state, dispatch } = useGame();
  const { nick, sala, partidaState, resultadosFinales } = state;

  // 1. Conexión del socket según nick
  useEffect(() => {
    if (nick && !socket.connected) {
      socket.connect();
      dispatch({ type: 'SET_SOCKET', payload: socket });
    }

    if (!nick && socket.connected) {
      socket.disconnect();
    }
  }, [nick, dispatch]);

  // 2. Listeners globales
  useEffect(() => {
    socket.on('servidor:sala_actualizada', (data: { sala: Sala }) => {
      console.log('SALA ACTUALIZADA RECIBIDA', data.sala);
      dispatch({ type: 'ACTUALIZAR_SALA', payload: data.sala });
    });

    socket.on('servidor:nuevo_chat', (data: { mensaje: MensajeChat }) => {
      dispatch({ type: 'NUEVO_CHAT', payload: data.mensaje });
    });

    socket.on('servidor:error', (data: { mensaje: string }) => {
      console.error(`Error del Servidor: ${data.mensaje}`);
    });

    socket.on('servidor:fin_carrera', (data: { resultados: ResultadosFin[] }) => {
      console.log('CARRERA TERMINADA', data.resultados);
      dispatch({ type: 'MOSTRAR_RESULTADOS', payload: data.resultados });
    });

    socket.on('servidor:carrera_iniciada', (data: { carreras: CarreraState[] }) => {
      console.log('CARRERA INICIADA', data.carreras);
      dispatch({ type: 'ACTUALIZAR_CARRERA_COMPLETA', payload: data.carreras });
    });

    socket.on('servidor:partida_actualizada', (data: { partidaState: PartidaState }) => {
      console.log('PARTIDA ACTUALIZADA RECIBIDA', data.partidaState);
      dispatch({ type: 'ACTUALIZAR_PARTIDA', payload: data.partidaState });
    });

    socket.on('servidor:actualizacion_carrera', (data: { carreraState: CarreraState }) => {
      dispatch({ type: 'ACTUALIZAR_JUGADOR_CARRERA', payload: data.carreraState });
    });

    socket.on('servidor:jugador_eliminado', (data: { jugadorId: string; nick: string }) => {
      dispatch({ type: 'JUGADOR_ELIMINADO', payload: data });
    });

    return () => {
      socket.off('servidor:sala_actualizada');
      socket.off('servidor:nuevo_chat');
      socket.off('servidor:error');
      socket.off('servidor:fin_carrera');
      socket.off('servidor:carrera_iniciada');
      socket.off('servidor:partida_actualizada');
      socket.off('servidor:actualizacion_carrera');
      socket.off('servidor:jugador_eliminado');
    };
  }, [dispatch]);

  // 3. Router de pantallas
  if (!nick) {
    return <LoginScreen />;
  }

  if (resultadosFinales) {
    return <ResultsScreen />;
  }

  if (sala && partidaState) {
    return <GameRouter />;
  }

  if (sala) {
    return <LobbyScreen />;
  }

  return <LoginScreen />;
};

const App: React.FC = () => {
  return (
    <div className="app-container">
      <NotificationProvider>
        <AppContent />
        <NotificationBar />
      </NotificationProvider>
    </div>
  );
};

export default App;
