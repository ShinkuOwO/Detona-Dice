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

### ◆ Estilo Visual Retro
- Interfaz con diseño estilo retro
- Botones con efecto chunky-shadow
- Tipografía 'RetroGaming' personalizada
- Colores vibrantes con esquema cohesivo
- Efectos de glitch y animaciones retro

### ◆ Tutorial Integrado
- Tutorial detallado en la pantalla principal
- Explicación de mecánicas básicas del juego
- Guía de objetivos y controles
- Información sobre dados, energía y progresión

---

## 🚀 Cómo Jugar

1. **Crear Sala o Unirse**: Introduce tu nick y crea una sala o únete con un código
2. **Lanzar Dados**: En combate, lanza dados y selecciona 2 para alcanzar el objetivo
3. **Gestionar Recursos**: Usa energía, oro y HP estratégicamente
4. **Elegir Ruta**: Decide qué camino tomar en el mapa
5. **Subir de Nivel**: Gana recompensas por cada nivel que alcances
6. **Comprar Mejoras**: Visita tiendas para mejorar tus estadísticas
7. **Aceptar Pactos**: Toma decisiones riesgosas con recompensas poderosas
8. **Sobrevivir**: Sé el último jugador en pie o el que más piso alcance

---

## 🎨 Características Visuales

- Diseño retro con efectos de glitch
- Animaciones de dados lanzándose
- Barras de estado con colores codificados
- Interfaz cohesiva con tema consistente
- Efectos visuales para selección de dados
- Indicadores de estado en tiempo real

---

## 📋 Tecnologías Utilizadas

- **Frontend**: React, TypeScript, Vite
- **Backend**: Node.js, Socket.IO
- **Estilos**: CSS Modules con variables personalizadas
- **Comunicación**: WebSockets para juego en tiempo real
- **Arquitectura**: Monorepo con workspaces de npm
- **UI**: Componentes personalizados con estética retro
