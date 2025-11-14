const { salas, jugadores, partidas, usuarios } = require('../store/memoryStore');
const { generarTienda, comprarItem, POOL_ITEMS } = require('../game/items');
const {
  crearDadoBase,
  crearDadoCorrupcion,
  crearDadoBendito,
  relanzarDado,
  aumentarDado,
  voltearDado,
  calcularSumaDados,
  aplicarEfectoDadoBendito
} = require('../game/dice');
const {
  generarMapa,
  generarEncuentro,
  calcularXPParaNivel,
} = require('../game/map');
const {
  POOL_MEJORAS,
  POOL_PACTOS,
  generarOpciones,
  aplicarMejora,
} = require('../game/mejoras');
const { LOGICA_PACTOS } = require('../game/pactosLogic');

function findSalaBySocketId(socketId) {
  return [...salas.values()].find((s) => s.jugadores.some((j) => j.id === socketId));
}

// Función para generar opciones de pactos según la rareza basada en el piso
function generarOpcionesPactosPorPiso(pisoActual) {
  let rareza;
  if (pisoActual >= 8) {
    rareza = 'epico';
  } else if (pisoActual >= 4) {
    rareza = 'raro';
  } else {
    rareza = 'comun';
  }

  // Filtrar pactos por rareza
  const pactosPorRareza = POOL_PACTOS.filter(pacto => pacto.rareza === rareza);
  
  // Mezclar y tomar 3 pactos aleatorios
  const pactosMezclados = [...pactosPorRareza].sort(() => 0.5 - Math.random());
  return pactosMezclados.slice(0, 3);
}

function registerGameHandlers(io, socket) {
  // Elegir nodo del mapa
  socket.on('cliente:elegir_nodo_mapa', ({ nodoId }) => {
    const jugador = jugadores.get(socket.id);
    if (!jugador) {
      return socket.emit('servidor:error', { mensaje: 'No estás autenticado' });
    }

    const partida = partidas.get(socket.id);
    if (!partida) return socket.emit('servidor:error', { mensaje: 'Partida no encontrada' });
    if (partida.estadoJuego !== 'mapa') {
      return socket.emit('servidor:error', { mensaje: 'No es momento de elegir un nodo' });
    }

    const nodoElegido = partida.mapaActual?.nodos.find((n) => n.id === nodoId);
    if (!nodoElegido) {
      return socket.emit('servidor:error', { mensaje: 'Nodo inválido' });
    }

    partida.mapaActual.nodoActual = nodoElegido.id;

    if (nodoElegido.tipo === 'evento_pacto') {
      // Generar pactos según la rareza basada en el piso actual
      partida.opcionesPacto = generarOpcionesPactosPorPiso(partida.piso);
      partida.estadoJuego = 'pacto'; // Cambiado de 'evento_pacto' a 'pacto' según especificación
      partida.mensaje = 'Un eco siniestro te ofrece poder...';
    } else if (nodoElegido.tipo === 'tienda') {
      partida.estadoJuego = 'tienda';
      partida.mensaje = 'Has encontrado una tienda misteriosa.';
      partida.tiendaActual = generarTienda(partida.piso);
      // OJO: ya NO curamos gratis ni regresamos al mapa aquí.
    } else {
      // combate / elite / jefe
      const numCorr = Array.isArray(partida.dadosCorrupcion)
        ? partida.dadosCorrupcion.length
        : 0;
      partida.encuentroActual = generarEncuentro(
        partida.piso,
        nodoElegido.tipo,
        numCorr,
      );
      partida.objetivoEncuentro = partida.encuentroActual.objetivo;
      partida.estadoJuego = 'combate';
      partida.mensaje = `¡Te enfrentas a ${partida.encuentroActual.nombre}!`;
    }

    socket.emit('servidor:partida_actualizada', { partidaState: partida.serializarParaCliente() });
  });

  // Lanzar dados
  socket.on('cliente:lanzar_dados', () => {
    const jugador = jugadores.get(socket.id);
    if (!jugador) {
      return socket.emit('servidor:error', { mensaje: 'No estás autenticado' });
    }

    const partida = partidas.get(socket.id);
    if (!partida) {
      return socket.emit('servidor:error', { mensaje: 'Partida no encontrada' });
    }

    if (partida.estadoJuego !== 'combate') {
      return socket.emit('servidor:error', { mensaje: 'No puedes lanzar dados ahora' });
    }

    if (partida.dadosLanzados) {
      return socket.emit('servidor:error', {
        mensaje: 'Ya has lanzado los dados. Selecciona 2 o usa habilidades.',
      });
    }

    partida.dadosLanzados = true;

    // Lanzar dados base
    partida.dadosBase = partida.dadosBase.map((dado) => relanzarDado(dado));
    // Lanzar dados de corrupción
    partida.dadosCorrupcion = partida.dadosCorrupcion.map((dado) => relanzarDado(dado));

    // Aplicar efecto del pacto "Vidente": +2 a todos los lanzamientos
    const ventajaLanzamiento = partida.getModificador('ventaja_lanzamiento') || 0;
    if (ventajaLanzamiento > 0) {
      partida.dadosBase = partida.dadosBase.map(dado => {
        if (typeof dado.valor === 'number' && !dado.esCorrupto) {
          return { ...dado, valor: Math.min(dado.valor + ventajaLanzamiento, 6) };
        }
        return dado;
      });
      partida.dadosCorrupcion = partida.dadosCorrupcion.map(dado => {
        if (typeof dado.valor === 'number' && dado.esCorrupto && dado.valor !== 'CRÁNEO') {
          return { ...dado, valor: dado.valor + ventajaLanzamiento };
        }
        return dado;
      });
    }

    partida.energia = partida.energiaMax;
    partida.mensaje = '¡Dados lanzados! Elige 2 dados para confirmar o usa habilidades.';

    socket.emit('servidor:partida_actualizada', { partidaState: partida.serializarParaCliente() });
  });

  // Usar habilidad
  socket.on('cliente:usar_habilidad', ({ habilidadId, dadoId }) => {
    const jugador = jugadores.get(socket.id);
    if (!jugador) {
      return socket.emit('servidor:error', { mensaje: 'No estás autenticado' });
    }

    const partida = partidas.get(socket.id);
    if (!partida) {
      return socket.emit('servidor:error', { mensaje: 'Partida no encontrada' });
    }

    let energiaGastada = 0;
    if (habilidadId === 'aumentar_dado') energiaGastada = 1;
    else if (habilidadId === 'voltear_dado') energiaGastada = 2;
    else if (habilidadId === 'relanzar_dado') energiaGastada = 1;
    else return socket.emit('servidor:error', { mensaje: 'Habilidad desconocida' });

    if (partida.energia < energiaGastada) {
      return socket.emit('servidor:error', { mensaje: 'Energía insuficiente' });
    }

    let habilidadUsada = false;
    const aplicarHabilidad = (dado) => {
      if (dado.id === dadoId) {
        habilidadUsada = true;
        if (habilidadId === 'aumentar_dado') return aumentarDado(dado);
        if (habilidadId === 'voltear_dado') return voltearDado(dado);
        if (habilidadId === 'relanzar_dado') return relanzarDado(dado);
      }
      return dado;
    };

    partida.dadosBase = partida.dadosBase.map(aplicarHabilidad);
    partida.dadosCorrupcion = partida.dadosCorrupcion.map(aplicarHabilidad);

    if (!habilidadUsada) {
      return socket.emit('servidor:error', { mensaje: 'Dado no encontrado' });
    }

    partida.energia -= energiaGastada;
    partida.mensaje = `Habilidad ${habilidadId} usada.`;

    socket.emit('servidor:partida_actualizada', { partidaState: partida.serializarParaCliente() });
  });

  // Seleccionar dados (resolver encuentro)
  socket.on('cliente:seleccionar_dados', ({ dadoId1, dadoId2 }) => {
    const jugador = jugadores.get(socket.id);
    if (!jugador) {
      return socket.emit('servidor:error', { mensaje: 'No estás autenticado' });
    }

    const partida = partidas.get(socket.id);
    const sala = findSalaBySocketId(socket.id);

    if (!partida || !sala || !partida.encuentroActual) {
      return socket.emit('servidor:error', { mensaje: 'Estado de partida inválido' });
    }

    if (partida.estadoJuego !== 'combate') {
      return socket.emit('servidor:error', { mensaje: 'No es momento de seleccionar dados' });
    }

    const jugadorCarrera = sala.carreras.find((c) => c.jugadorId === socket.id);
    if (!jugadorCarrera) {
      return socket.emit('servidor:error', { mensaje: 'Jugador no encontrado en la carrera' });
    }

    const todosLosDados = [...partida.dadosBase, ...partida.dadosCorrupcion];
    const dado1 = todosLosDados.find((d) => d.id === dadoId1);
    const dado2 = todosLosDados.find((d) => d.id === dadoId2);

    if (!dado1 || !dado2) {
      return socket.emit('servidor:error', { mensaje: 'Dados seleccionados no válidos' });
    }

    if (dadoId1 === dadoId2 && todosLosDados.filter((d) => d.id === dadoId1).length < 2) {
      return socket.emit('servidor:error', {
        mensaje: 'No puedes seleccionar el mismo dado dos veces',
      });
    }

    const dadosSeleccionados = [dado1, dado2];
    const { suma, tieneCranio } = calcularSumaDados(dadosSeleccionados);
    const objetivo = partida.objetivoEncuentro;
    const encuentro = partida.encuentroActual;

    // Limpiar efectos al final del turno
    partida.limpiarEfectos();

    if (tieneCranio) {
      let dano = encuentro.danoCranio;
      const reduccion = partida.getModificador('reduccion_dano_craneo') || 0;
      dano = Math.max(0, dano - reduccion);
      partida.hp = Math.max(0, partida.hp - dano);
      partida.mensaje = `ยกPenalidad por crรกneo! -${dano} HP.`;
    } else if (suma >= objetivo) {
      // VICTORIA
      let pisoAntesVictoria = partida.piso;
      partida.piso += 1;
      let recompensaOro = encuentro.recompensaOro;
      const oroBonus = partida.getModificador('oro_bonus') || 0;
      recompensaOro += Math.floor(recompensaOro * oroBonus / 100);
      partida.oro += recompensaOro;
      partida.xp += encuentro.recompensaXp;
      
      // Aplicar efecto de reliquia "Moneda Maldita": +10 oro cada piso
      const oroPorPiso = partida.getModificador('oro_por_piso') || 0;
      if (oroPorPiso > 0) {
        partida.oro += oroPorPiso;
      }
      
      // Corrupciรณn pasiva: cada 4 pisos ganas 1 dado corrupto
      if (partida.piso % 4 === 0) {
        const nuevoDado = crearDadoCorrupcion(
          `dc-${(partida.dadosCorrupcion?.length || 0) + 1}`,
        );
        if (!Array.isArray(partida.dadosCorrupcion)) {
          partida.dadosCorrupcion = [];
        }
        partida.dadosCorrupcion.push(nuevoDado);
        partida.mensaje += ' La corrupciรณn crece... has ganado 1 dado corrupto.';
      }

      // Aplicar efecto de pacto "Ladrรณn de Almas": Pierdes 1 XP por piso
      const penalidadXP = partida.getModificador('penalidad_piso_xp') || 0;
      if (penalidadXP > 0 && partida.xp > 0) {
        partida.xp = Math.max(0, partida.xp - penalidadXP);
      }

      // Aplicar efecto de pacto "Vidente": Cada piso pierdes 1 HP permanente
      const penalidadHP = partida.getModificador('penalidad_piso_hp') || 0;
      if (penalidadHP > 0) {
        partida.hp = Math.max(0, partida.hp - penalidadHP);
        partida.hpMax = Math.max(1, partida.hpMax - penalidadHP); // Asegurar que HP mรกximo no baje de 1
        if (partida.hp > partida.hpMax) {
          partida.hp = partida.hpMax;
        }
      }

      // Aplicar efecto de pacto "Caos": Cada combate ganas +1 dado corrupto
      const dadosCorrupcionVictoria = partida.getModificador('dado_corrupcion_victoria') || 0;
      if (dadosCorrupcionVictoria > 0) {
        for (let i = 0; i < dadosCorrupcionVictoria; i++) {
          const nuevoDado = crearDadoCorrupcion(`dc-${partida.dadosCorrupcion.length + 1}`);
          partida.dadosCorrupcion.push(nuevoDado);
        }
        partida.mensaje += ` El Caos te corrompe... has ganado ${dadosCorrupcionVictoria} dado(s) corrupto(s).`;
      }

    if (partida.xp >= partida.xpParaNivel) {
        // SUBES DE NIVEL
        partida.xp -= partida.xpParaNivel;
        partida.nivel += 1;
        partida.xpParaNivel = calcularXPParaNivel(partida.nivel);
        partida.opcionesMejora = generarOpciones(POOL_MEJORAS);
        partida.estadoJuego = 'subir_nivel'; // Cambiado de 'subiendo_nivel' a 'subir_nivel' según especificación
        partida.mensaje = `ยกVictoria! ยกSUBISTE DE NIVEL! (Nivel ${partida.nivel})`;
      } else {
        // Solo victoria, vas al mapa
        partida.estadoJuego = 'mapa';
        partida.mapaActual = generarMapa(partida.piso);
        partida.encuentroActual = null;
        partida.mensaje = `ยกVictoria! +${recompensaOro} oro. Elige tu prรณximo camino.`;
      }
      
      // Aplicar efecto de reliquia "Moneda Maldita": recibes 1 corrupciรณn al subir de piso
      const corrupcionAlSubir = partida.getModificador('corrupcion_al_subir') || 0;
      if (corrupcionAlSubir > 0 && pisoAntesVictoria !== partida.piso) { // Si efectivamente subiรณ de piso
        for (let i = 0; i < corrupcionAlSubir; i++) {
          const nuevoDado = crearDadoCorrupcion(`dc-${partida.dadosCorrupcion.length + 1}`);
          partida.dadosCorrupcion.push(nuevoDado);
        }
        partida.mensaje += ` La maldiciรณn de la moneda te corrompe... has ganado ${corrupcionAlSubir} dado(s) corrupto(s).`;
      }
      
      // Llamar al hook de fin de combate con éxito
      partida.onFinCombate(true);
    } else {
      // DERROTA
      // Llamar al hook de fin de combate con fracaso
      partida.onFinCombate(false);
      
      // Verificar si el jugador puede revivir
      const resultadoRevivir = partida.onAntesDeMorir(); // Usar el nuevo hook
      if (resultadoRevivir.evitarMuerte) {
        partida.hp = 1; // Revivir con 1 HP
        partida.mensaje = `ยกMilagrosamente sobrevives con 1 HP!`;
        // Actualizar carrera pรบblica
        jugadorCarrera.piso = partida.piso;
        jugadorCarrera.hp = partida.hp;
        io.to(sala.codigoSala).emit('servidor:actualizacion_carrera', {
          carreraState: {
            jugadorId: socket.id,
            nick: jugador.nick,
            piso: partida.piso,
            hp: partida.hp,
            estado: 'vivo',
          },
        });
      } else {
        // Verificar si puede revivir de forma tradicional
        const resultadoRevivirTradicional = partida.puedeRevivir();
        if (resultadoRevivirTradicional.puedeRevivir) {
          partida.hp = 1; // Revivir con 1 HP
          if (resultadoRevivirTradicional.tipoRevivir === 'sin_reliquias') {
            partida.mensaje = `ยกMilagrosamente sobrevives con 1 HP, pero has perdido todas tus reliquias!`;
          } else {
            partida.mensaje = `ยกMilagrosamente sobrevives con 1 HP!`;
          }
          // Actualizar carrera pรบblica
          jugadorCarrera.piso = partida.piso;
          jugadorCarrera.hp = partida.hp;
          io.to(sala.codigoSala).emit('servidor:actualizacion_carrera', {
            carreraState: {
              jugadorId: socket.id,
              nick: jugador.nick,
              piso: partida.piso,
              hp: partida.hp,
              estado: 'vivo',
            },
          });
        } else {
          partida.hp = Math.max(0, partida.hp - encuentro.danoFallo);
          partida.mensaje = `Derrota. Objetivo ${objetivo} no alcanzado. -${encuentro.danoFallo} HP.`;
          partida.estadoJuego = 'mapa';
          partida.mapaActual = generarMapa(partida.piso);
          partida.encuentroActual = null;
        }
      }
    }

    // Reset bloqueo para el siguiente turno
    partida.dadosLanzados = false;

    // Actualizar carrera pรบblica
    jugadorCarrera.piso = partida.piso;
    jugadorCarrera.hp = partida.hp;

    // Actualizar estadísticas del usuario
    const usuario = usuarios.get(socket.id);
    if (usuario) {
      // Si es victoria (piso aumentó), actualizar estadísticas como ganador
      if (partida.piso > jugadorCarrera.piso_anterior || jugadorCarrera.piso_anterior === undefined) {
        usuario.actualizarEstadisticas(true, partida.piso);
        // Otorgar experiencia por victoria
        usuario.agregarExperiencia(50);
      } else if (partida.hp <= 0) {
        // Si fue eliminado, actualizar estadísticas como derrota
        usuario.actualizarEstadisticas(false, partida.piso);
        // Otorgar experiencia proporcional al piso alcanzado
        usuario.agregarExperiencia(partida.piso * 10);
      } else {
        // Si no fue eliminado pero tampoco subió de piso, actualizar experiencia por supervivencia
        usuario.agregarExperiencia(10);
      }
      jugadorCarrera.piso_anterior = partida.piso;
    }

    if (partida.hp <= 0) {
      jugadorCarrera.estado = 'eliminado';
      partida.mensaje = 'ยกHas sido eliminado!';
      partida.estadoJuego = 'eliminado';

      io.to(sala.codigoSala).emit('servidor:jugador_eliminado', {
        jugadorId: socket.id,
        nick: jugador.nick,
      });

      const jugadoresVivos = sala.carreras.filter((c) => c.estado === 'vivo');
      if (jugadoresVivos.length === 0) {
        const resultados = [...sala.carreras].sort(
          (a, b) => b.piso - a.piso || b.hp - a.hp,
        );
        io.to(sala.codigoSala).emit('servidor:fin_carrera', { resultados });
      }
    } else {
      io.to(sala.codigoSala).emit('servidor:actualizacion_carrera', {
        carreraState: {
          jugadorId: socket.id,
          nick: jugador.nick,
          piso: partida.piso,
          hp: partida.hp,
          estado: 'vivo',
        },
      });
    }

    socket.emit('servidor:partida_actualizada', { partidaState: partida.serializarParaCliente() });
  });

  // Elegir mejora de nivel
  socket.on('cliente:elegir_mejora_nivel', ({ mejoraId }) => {
    const jugador = jugadores.get(socket.id);
    if (!jugador) {
      return socket.emit('servidor:error', { mensaje: 'No estás autenticado' });
    }

    const partida = partidas.get(socket.id);
    if (!partida || partida.estadoJuego !== 'subir_nivel') { // Cambiado de 'subiendo_nivel' a 'subir_nivel' según especificación
      return socket.emit('servidor:error', { mensaje: 'Estado inválido' });
    }

    const exito = aplicarMejora(partida, mejoraId);
    if (!exito) {
      return socket.emit('servidor:error', { mensaje: 'Mejora inválida' });
    }

    partida.mensaje = '¡Mejora aplicada! Elige tu próximo camino.';
    partida.opcionesMejora = [];
    partida.estadoJuego = 'mapa';
    partida.mapaActual = generarMapa(partida.piso);
    partida.encuentroActual = null;

    socket.emit('servidor:partida_actualizada', { partidaState: partida.serializarParaCliente() });
  });

  // Aceptar pacto
  socket.on('cliente:aceptar_pacto', ({ pactoId }) => {
    const jugador = jugadores.get(socket.id);
    if (!jugador) {
      return socket.emit('servidor:error', { mensaje: 'No estás autenticado' });
    }

    const partida = partidas.get(socket.id);
    if (!partida || partida.estadoJuego !== 'pacto') { // Cambiado de 'evento_pacto' a 'pacto'
      return socket.emit('servidor:error', { mensaje: 'Estado inválido' });
    }

    const exito = aplicarMejora(partida, pactoId);
    if (!exito) {
      return socket.emit('servidor:error', { mensaje: 'Pacto inválido' });
    }

    // Aceptar el pacto en el estado de la partida
    partida.aceptarPacto(pactoId);
    
    // Aplicar lógica específica del pacto si existe
    const logicaPacto = LOGICA_PACTOS[pactoId];
    if (logicaPacto && logicaPacto.onAceptar) {
      logicaPacto.onAceptar({ jugador: partida });
    }

    const nuevoDado = crearDadoCorrupcion(`dc-${partida.dadosCorrupcion.length + 1}`);
    partida.dadosCorrupcion.push(nuevoDado);
    partida.pactosHechos.push(pactoId);
    partida.mensaje = 'Pacto aceptado... (+1 Dado de Corrupción). Elige tu camino.';

    partida.opcionesPacto = [];
    partida.estadoJuego = 'mapa';
    partida.mapaActual = generarMapa(partida.piso);
    partida.encuentroActual = null;

    socket.emit('servidor:partida_actualizada', { partidaState: partida.serializarParaCliente() }); // Cambiado para serializar correctamente
  });

  // Comprar en tienda
  socket.on('cliente:comprar_tienda', ({ itemId }) => {
    const jugador = jugadores.get(socket.id);
    if (!jugador) return socket.emit('servidor:error', { mensaje: 'No estás autenticado' });

    const partida = partidas.get(socket.id);
    if (!partida) return socket.emit('servidor:error', { mensaje: 'Partida no encontrada' });

    if (partida.estadoJuego !== 'tienda' || !partida.tiendaActual) {
      return socket.emit('servidor:error', { mensaje: 'No estás en una tienda' });
    }

    const resultado = comprarItem(partida, itemId);
    if (!resultado.ok) {
      return socket.emit('servidor:error', { mensaje: resultado.error });
    }

    // 🔥 REMOVER EL ITEM DE LA TIENDA
    partida.tiendaActual.items = partida.tiendaActual.items.filter(
      (i) => i.id !== itemId
    );

    partida.mensaje = `Has comprado ${resultado.item.nombre}.`;

    socket.emit('servidor:partida_actualizada', { partidaState: partida });
  });


  // Salir de la tienda y volver al mapa
  socket.on('cliente:salir_tienda', () => {
    const jugador = jugadores.get(socket.id);
    if (!jugador) return socket.emit('servidor:error', { mensaje: 'No estás autenticado' });

    const partida = partidas.get(socket.id);
    if (!partida) return socket.emit('servidor:error', { mensaje: 'Partida no encontrada' });

    if (partida.estadoJuego !== 'tienda') {
      return socket.emit('servidor:error', { mensaje: 'No estás en una tienda' });
    }

    partida.estadoJuego = 'mapa';
    partida.mapaActual = generarMapa(partida.piso);
    partida.tiendaActual = null;
    partida.mensaje = 'Abandonas la tienda y miras el camino por delante.';

    socket.emit('servidor:partida_actualizada', { partidaState: partida });
  });

  // Usar consumible
  socket.on('cliente:usar_consumible', ({ itemId }) => {
    const jugador = jugadores.get(socket.id);
    if (!jugador) {
      return socket.emit('servidor:error', { mensaje: 'No estás autenticado' });
    }

    const partida = partidas.get(socket.id);
    if (!partida) {
      return socket.emit('servidor:error', { mensaje: 'Partida no encontrada' });
    }

    // Solo permitir en ciertos estados (por ejemplo, combate o mapa)
    if (!['combate', 'mapa'].includes(partida.estadoJuego)) {
      return socket.emit('servidor:error', { mensaje: 'No puedes usar consumibles ahora' });
    }

    const index = partida.consumibles.indexOf(itemId);
    if (index === -1) {
      return socket.emit('servidor:error', { mensaje: 'Consumible no encontrado' });
    }

    const itemDef = POOL_ITEMS.find((i) => i.id === itemId && i.tipo === 'consumible');
    if (!itemDef || !itemDef.usar) {
      return socket.emit('servidor:error', { mensaje: 'Consumible inválido' });
    }

    // Aplicar efecto y eliminar del inventario
    itemDef.usar(partida);
    partida.consumibles.splice(index, 1);

    partida.mensaje = `Has usado ${itemDef.nombre}.`;
    socket.emit('servidor:partida_actualizada', { partidaState: partida });
  });

  // Reroll de mejoras/pactos
  socket.on('cliente:reroll_mejoras', () => {
    const jugador = jugadores.get(socket.id);
    if (!jugador) {
      return socket.emit('servidor:error', { mensaje: 'No estás autenticado' });
    }

    const partida = partidas.get(socket.id);
    if (!partida) {
      return socket.emit('servidor:error', { mensaje: 'Partida no encontrada' });
    }

    const costeReroll = 10;
    if (partida.oro < costeReroll) {
      return socket.emit('servidor:error', { mensaje: 'Oro insuficiente para reroll' });
    }

    partida.oro -= costeReroll;

    if (partida.estadoJuego === 'subiendo_nivel') {
      partida.opcionesMejora = generarOpciones(POOL_MEJORAS);
    } else if (partida.estadoJuego === 'evento_pacto') {
      partida.opcionesPacto = generarOpciones(POOL_PACTOS);
    } else {
      return socket.emit('servidor:error', { mensaje: 'No hay nada que rerollear' });
    }

    partida.mensaje = `Opciones rerolleadas por ${costeReroll} de oro.`;
    socket.emit('servidor:partida_actualizada', { partidaState: partida });
  });
}

module.exports = registerGameHandlers;
