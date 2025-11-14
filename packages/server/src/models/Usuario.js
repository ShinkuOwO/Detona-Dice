class Usuario {
  constructor(id, nick) {
    this.id = id;
    this.nick = nick;
    
    // Estadísticas de carrera
    this.partidasJugadas = 0;
    this.partidasGanadas = 0;
    this.pisoMaximo = 0;
    this.victoriasConsecutivas = 0;
    
    // Metaprogresión
    this.nivel = 1;
    this.experiencia = 0;
    this.experienciaParaSiguienteNivel = 100;
    
    // Recursos permanentes
    this.monedas = 100; // Monedas para comprar permanentemente
    this.gemas = 0; // Recurso raro para contenido especial
    
    // Coleccionables
    this.dadosDesbloqueados = ['dado_normal']; // Array de IDs de dados especiales
    this.temasDesbloqueados = ['tema_clasico']; // Array de IDs de temas visuales
    this.reliquiasPermanentes = []; // Array de IDs de reliquias permanentes
    
    // Logros
    this.logros = []; // Array de IDs de logros obtenidos
    this.logrosProgreso = {}; // Seguimiento del progreso de logros
    
    // Preferencias
    this.configuracion = {
      efectosVisuales: true,
      musica: true,
      sonido: true,
      modoOscuro: true
    };
  }

  // Método para añadir experiencia y gestionar subidas de nivel
  agregarExperiencia(cantidad) {
    this.experiencia += cantidad;
    
    // Verificar si sube de nivel
    while (this.experiencia >= this.experienciaParaSiguienteNivel) {
      this.experiencia -= this.experienciaParaSiguienteNivel;
      this.nivel++;
      this.experienciaParaSiguienteNivel = Math.floor(100 + (this.nivel * 50));
    }
 }

  // Método para desbloquear un dado
 desbloquearDado(idDado) {
    if (!this.dadosDesbloqueados.includes(idDado)) {
      this.dadosDesbloqueados.push(idDado);
      return true;
    }
    return false;
  }

 // Método para desbloquear un tema
  desbloquearTema(idTema) {
    if (!this.temasDesbloqueados.includes(idTema)) {
      this.temasDesbloqueados.push(idTema);
      return true;
    }
    return false;
  }

  // Método para añadir un logro
  agregarLogro(idLogro) {
    if (!this.logros.includes(idLogro)) {
      this.logros.push(idLogro);
      return true;
    }
    return false;
  }

  // Método para actualizar el progreso de un logro
  actualizarProgresoLogro(idLogro, progreso) {
    if (!this.logrosProgreso[idLogro]) {
      this.logrosProgreso[idLogro] = 0;
    }
    this.logrosProgreso[idLogro] = Math.max(this.logrosProgreso[idLogro], progreso);
  }

  // Método para actualizar estadísticas de carrera
  actualizarEstadisticas(victoria, pisoAlcanzado) {
    this.partidasJugadas++;
    if (victoria) {
      this.partidasGanadas++;
      this.victoriasConsecutivas++;
    } else {
      this.victoriasConsecutivas = 0;
    }
    
    if (pisoAlcanzado > this.pisoMaximo) {
      this.pisoMaximo = pisoAlcanzado;
    }
  }
}

module.exports = Usuario;
