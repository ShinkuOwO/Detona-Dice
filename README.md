# 🧨 Detona Dice – Multiplayer Roguelike Dice Race

**Detona Dice** es un juego **multiplayer en tiempo real**, donde varios jugadores compiten piso a piso usando dados, habilidades, energía y decisiones de ruta.  
Cada jugador avanza por su propio camino mientras todos corren simultáneamente en una **carrera global** visible en tiempo real.

El juego combina:
- ⚡ Progresión estilo roguelike  
- 🎲 Dados con habilidades activas  
- 🗺️ Rutas de mapa generadas proceduralmente  
- 🧩 Eventos misteriosos, élites, jefes y tiendas  
- 🏁 Competencia multijugador  
- 📡 Backend autoritativo con Socket.IO  

---

## 🎮 Características Principales

### ◆ Sistema de Dados
- Dados base y dados corruptos.
- Habilidades activas:
  - **+1 al dado**
  - **Voltear cara**
  - **Relanzar**
- Selección estratégica de dos dados por turno.

### ◆ Progresión del Jugador
- HP, Oro, Energía.
- Nivel & XP dinámico por encuentro.
- Reliquias pasivas.
- Pactos misteriosos que otorgan dados corruptos.

### ◆ Mapa Procedural
Cada piso genera 2 caminos posibles:
- Combate Normal
- Élites
- Evento Misterioso (Pacto)
- Tienda
- Jefes cada ciertos pisos

### ◆ Carrera Global Multijugador
Todos los jugadores:
- Avanzan juntos
- Ven el progreso de los demás
- Eliminados → pasan a modo espectador

### ◆ Chat en Tiempo Real
- Lobby Chat  
- Chat durante la partida  
- Auto-scroll y eventos ordenados

---

## 🧱 Arquitectura del Monorepo

