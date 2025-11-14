import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import { Socket } from 'socket.io-client';

// --- 1. MODELOS ---

export interface Jugador {
  id: string;
  nick: string;
  listo?: boolean;
}

export interface MensajeChat {
  id: string;
  nick: string;
  mensaje: string;
  timestamp: number;
}

export interface CarreraState {
  jugadorId: string;
  nick: string;
  piso: number;
  hp: number;
  estado: 'vivo' | 'eliminado';
}

export interface Sala {
  codigoSala: string;
  hostId: string;
  jugadores: Jugador[];
  chat: MensajeChat[];
  estado: 'esperando' | 'jugando' | 'terminado';
  carreras: CarreraState[];
}

export interface Dado {
  id: string;
  valor: number | 'CRÁNEO' | null;
  esCorrupto: boolean;
}

export interface OpcionMejora {
  id: string;
  texto: string;
}

export interface OpcionPacto {
  id: string;
  texto: string;
}

export interface NodoMapa {
  id: string;
  tipo: 'combate' | 'elite' | 'evento_pacto' | 'tienda' | 'jefe';
  texto: string;
}

export interface Mapa {
  piso: number;
  nodos: NodoMapa[];
  nodoActual: string | null;
}

export interface Encuentro {
  nombre: string;
  tipo: string;
  objetivo: number;
}

// ---- NUEVO: tipos tienda / inventario ----
export interface TiendaItem {
  id: string;
  nombre: string;
  tipo: 'consumible' | 'reliquia' | 'instantaneo';
  precio: number;
  descripcion: string;
}

export interface TiendaState {
  piso: number;
  tipo: 'normal'; // por ahora
  items: TiendaItem[];
}

export type ReliquiaId = string;
export type ConsumibleId = string;
export type PactoId = string;

// ---- PartidaState ----
export interface PartidaState {
  piso: number;
  hp: number;
  hpMax: number;
  oro: number;
  energia: number;
  energiaMax: number;
  dadosLanzados: boolean;
  estadoJuego: 'combate' | 'subiendo_nivel' | 'evento_pacto' | 'tienda' | 'mapa' | 'eliminado';
  nivel: number;
  xp: number;
  xpParaNivel: number;
  dadosBase: Dado[];
  dadosCorrupcion: Dado[];
  mapaActual: Mapa | null;
  encuentroActual: Encuentro | null;
  opcionesMejora: OpcionMejora[];
  opcionesPacto: OpcionPacto[];
  mensaje: string;

  // Inventario / progresión
  tiendaActual: TiendaState | null;
  consumibles?: string[];
  reliquias: ReliquiaId[];
  pactosHechos: PactoId[];

  // Métodos
  aplicarEfecto: (efecto: any) => void;
  limpiarEfectos: () => void;
  aplicarModificador: (nombre: string, valor: number) => void;
  getModificador: (nombre: string) => number;
  aplicarReliquia: (reliquiaId: string) => void;
  getMaxDadosSeleccionables: () => number;
  getModificadorObjetivo: () => number;
  puedeRevivir: () => boolean;
  cambiarDadoCorrupto: () => boolean;
}

export interface ResultadosFin {
  jugadorId: string;
  nick: string;
  piso: number;
  hp: number;
}

// --- 2. ESTADO GLOBAL ---

interface GlobalState {
  socket: Socket | null;
  nick: string;
  sala: Sala | null;
  partidaState: PartidaState | null;
  carreraState: CarreraState[];
  resultadosFinales: ResultadosFin[] | null;
}

// 3. ACCIONES (Eventos del Reducer)
type GameAction =
  | { type: 'SET_SOCKET'; payload: Socket }
  | { type: 'SET_NICK'; payload: string }
  | { type: 'ACTUALIZAR_SALA'; payload: Sala }
  | { type: 'ACTUALIZAR_PARTIDA'; payload: PartidaState }
  | { type: 'ACTUALIZAR_CARRERA_COMPLETA'; payload: CarreraState[] }
  | { type: 'ACTUALIZAR_JUGADOR_CARRERA'; payload: CarreraState }
  | { type: 'JUGADOR_ELIMINADO'; payload: { jugadorId: string; nick: string } }
  | { type: 'MOSTRAR_RESULTADOS'; payload: ResultadosFin[] }
  | { type: 'NUEVO_CHAT'; payload: MensajeChat }
  | { type: 'RESETEAR_JUEGO' };

// 4. ESTADO INICIAL
const initialState: GlobalState = {
  socket: null,
  nick: '',
  sala: null,
  partidaState: null,
  carreraState: [],
  resultadosFinales: null,
};

// 5. REDUCER
const gameReducer = (state: GlobalState, action: GameAction): GlobalState => {
  switch (action.type) {
    case 'SET_SOCKET':
      return { ...state, socket: action.payload };

    case 'SET_NICK':
      return { ...state, nick: action.payload };

    case 'ACTUALIZAR_SALA':
      return { ...state, sala: action.payload };

    case 'ACTUALIZAR_PARTIDA':
      return { ...state, partidaState: action.payload };

    case 'ACTUALIZAR_CARRERA_COMPLETA':
      return { ...state, carreraState: action.payload };

    case 'ACTUALIZAR_JUGADOR_CARRERA': {
      const jugadorActualizado = action.payload;
      const index = state.carreraState.findIndex(
        (j) => j.jugadorId === jugadorActualizado.jugadorId,
      );
      if (index === -1) return state;
      const nuevaCarrera = [...state.carreraState];
      nuevaCarrera[index] = jugadorActualizado;
      return { ...state, carreraState: nuevaCarrera };
    }

    case 'JUGADOR_ELIMINADO':
      return {
        ...state,
        carreraState: state.carreraState.map((j) =>
          j.jugadorId === action.payload.jugadorId ? { ...j, estado: 'eliminado' } : j,
        ),
      };

    case 'MOSTRAR_RESULTADOS':
      return { ...state, partidaState: null, resultadosFinales: action.payload };

    case 'NUEVO_CHAT':
      if (!state.sala) return state;
      return {
        ...state,
        sala: {
          ...state.sala,
          chat: [...state.sala.chat, action.payload],
        },
      };

    case 'RESETEAR_JUEGO':
      return {
        ...state,
        partidaState: null,
        carreraState: [],
        resultadosFinales: null,
        sala: state.sala ? { ...state.sala, estado: 'esperando', carreras: [] } : null,
      };

    default:
      return state;
  }
};

// 6. CONTEXTO

interface GameContextProps {
  state: GlobalState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextProps | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame debe ser usado dentro de un GameProvider');
  }
  return context;
};
