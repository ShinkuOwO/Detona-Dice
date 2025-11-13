🧨 Detona Dice – Multiplayer Roguelike Dice Race

Detona Dice es un juego multiplayer en tiempo real, donde varios jugadores corren por llegar lo más lejos posible en una torre infinita enfrentando enemigos, eventos misteriosos, élites, tiendas y pactos corruptos.

Cada turno, los jugadores lanzan dados, combinan habilidades, toman rutas en el mapa y suben de nivel para sobrevivir más tiempo que sus oponentes.

El juego funciona con:

Backend autoritativo en Node.js + Socket.IO

Frontend React + Vite (hosteado en Vercel)

Experiencia real-time, con carrera global visible por todos

🎮 Características Principales
🧩 Juego por Pisos (Roguelike)

Combates normales, élite y jefes automáticos.

Eventos misteriosos con pactos que otorgan corrupción.

Tiendas con curación y mejoras.

🎲 Sistema de Dados Personalizado

Dados base y dados corruptos.

Habilidades activas:

+1 al dado

Voltear dado

Relanzar

Selección de dados y confirmación estratégica.

⚡ Progresión del Jugador

Oro, energía y HP.

Nivel y XP dinámicos por encuentro.

Reliquias pasivas y pactos acumulados.

🗺️ Mapa Procedural por Piso

Cada piso genera 2 rutas: combate / élite / pacto / tienda.

Elección estratégica afecta riesgo y recompensa.

🏁 Modo Carrera Multiplayer

Todos los jugadores avanzan simultáneamente.

Panel derecho muestra la carrera en vivo.

Eliminados pasan a modo espectador.

🗨️ Chat en Tiempo Real

Lobby chat

Chat en partida

Scroll automático y eventos aislados

🧱 Arquitectura del Proyecto
detona-dice/
│
├── packages/
│   ├── server/        # Backend Node.js + Socket.IO
│   │   ├── src/
│   │   │   ├── index.js
│   │   │   ├── sockets/
│   │   │   ├── game/
│   │   │   ├── models/
│   │   │   ├── store/
│   │   │   └── utils/
│   │   └── package.json
│   │
│   └── web/           # Frontend React + Vite + Typescript
│       ├── src/
│       ├── public/
│       └── package.json
│
└── package.json        # Monorepo scripts (npm workspaces)

🚀 Scripts Principales
En el monorepo:
npm run dev:server   # Inicia backend (nodemon)
npm run dev:web      # Inicia frontend (Vite)

En server/
npm run dev   # nodemon src/index.js
npm start     # producción

En web/
npm run dev   # vite
npm run build # producción

🌍 Deploy
Frontend (Vercel)

Conectar repositorio

Seleccionar carpeta /packages/web

Variables permitidas:

VITE_SOCKET_URL = https://tu-backend.onrender.com

Backend (Render / Railway)

Crear servicio web

Start command:

node src/index.js


Auto Deploy habilitado

Asegurar:

CORS: origin = tu dominio de Vercel
PORT = 3001 (o el asignado)

🛠️ Tecnologías Usadas

Node.js

Socket.IO

Express

React 18

Typescript

Vite

NPM Workspaces

CSS Retro UI personalizada

📦 Estado Actual

✔ Backend dividido en módulos

✔ Frontend reactivo con context global

✔ Sistema de dados, habilidades y energía

✔ Combate funcional

✔ Progresión de nivel y XP

✔ Mapa procedural

✔ Lobby con host y ready

✔ Carrera global en vivo

⏳ Tienda en desarrollo

⏳ Reliquias y mejoras avanzadas

⏳ Balance dinámico enemigo/pisos

🔮 Próximas Mejoras

Tienda completa con items y upgrades

Nuevas reliquias (raras, únicas, épicas)

Eventos misteriosos con decisiones múltiples

Más tipos de dados y efectos

Skins / cosméticos

Sonidos retro y animaciones

Ranking global por temporada

👤 Autor

Proyecto creado por Shinku (Detona Annies)
GitHub: https://github.com/ShinkuOwO
