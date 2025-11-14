// Funciones para crear diferentes tipos de dados
function crearDadoBase(id) {
 return { 
    id, 
    valor: null, 
    esCorrupto: false,
    tipo: 'base' // Normal, 1-6
  };
}

function crearDadoCorrupcion(id) {
  const valores = [0, 0, 4, 7, 8, 'CRÁNEO'];
  const valor = valores[Math.floor(Math.random() * valores.length)];
  return { 
    id, 
    valor, 
    esCorrupto: true,
    tipo: 'corrupto',
    efecto: getRandomCorruptionEffect() // Efecto extra al ser seleccionado
  };
}

function crearDadoBendito(id) {
  return { 
    id, 
    valor: null, 
    esCorrupto: false,
    tipo: 'bendito',
    efecto: 'duplicar_si_par' // Duplica su valor si el otro dado es par
  };
}

function getRandomCorruptionEffect() {
  const efectos = [
    'sangre', // si lo eliges → pierdes 1 HP pero vale +1 extra
    'caos',   // si sale 6 → explota → genera otro dado
    'veneno'  // si lo ignoras → recibes 1 corrupción
  ];
  return efectos[Math.floor(Math.random() * efectos.length)];
}

// Función para aplicar efectos de dados corruptos
function aplicarEfectoDadoCorrupto(partida, dado) {
  if (dado.tipo !== 'corrupto' || !dado.efecto) return;
  
  switch(dado.efecto) {
    case 'sangre':
      // Si se selecciona este dado, se pierde 1 HP pero vale +1 extra
      // Este efecto se maneja al seleccionar el dado
      break;
    case 'caos':
      // Si sale 6, explota y genera otro dado
      if (dado.valor === 6) {
        const nuevoDado = crearDadoCorrupcion(`dc-${partida.dadosCorrupcion.length + 1}`);
        partida.dadosCorrupcion.push(nuevoDado);
      }
      break;
    case 'veneno':
      // Si se ignora este dado, se recibe 1 corrupción
      // Este efecto se maneja cuando se ignora el dado
      break;
  }
}

function relanzarDado(dado) {
  let nuevoValor;
  if (dado.esCorrupto) {
    const valoresCorrupcion = [0, 0, 4, 7, 8, 'CRÁNEO'];
    nuevoValor = valoresCorrupcion[Math.floor(Math.random() * valoresCorrupcion.length)];
  } else if (dado.tipo === 'bendito') {
    // Los dados benditos pueden tener valores especiales
    nuevoValor = Math.floor(Math.random() * 6) + 1;
  } else {
    nuevoValor = Math.floor(Math.random() * 6) + 1;
  }
  
  // Aplicar efectos especiales al relanzar
  let nuevoDado = { ...dado, valor: nuevoValor };
  
  // Efecto "Inestable": se relanza solo
 if (dado.efecto === 'inestable') {
    // A veces se relanza de nuevo
    if (Math.random() < 0.3) { // 30% de probabilidad de relanzar
      nuevoDado = relanzarDado(nuevoDado);
    }
  }
  
  return nuevoDado;
}

function resetDados(partida) {
  partida.dadosBase = partida.dadosBase.map((d) => ({ ...d, valor: null }));
  partida.dadosCorrupcion = partida.dadosCorrupcion.map((d) => ({ ...d, valor: null }));
  partida.dadosLanzados = false;
  return partida;
}

function aumentarDado(dado) {
  if (typeof dado.valor === 'number') {
    if (dado.esCorrupto) return { ...dado, valor: dado.valor + 1 };
    return { ...dado, valor: Math.min(dado.valor + 1, 6) };
 }
  return dado;
}

function voltearDado(dado) {
  if (typeof dado.valor === 'number' && dado.valor >= 1 && dado.valor <= 6) {
    return { ...dado, valor: 7 - dado.valor };
  }
  return dado;
}

function calcularSumaDados(dados, partida = null) {
  let suma = 0;
  let tieneCranio = false;
  let dadosCriticos = 0;
  
  for (const dado of dados) {
    if (dado.valor === 'CRÁNEO') {
      tieneCranio = true;
      continue;
    }
    
    let valorDado = dado.valor;
    
    // Aplicar efecto de reliquia "Garra Afilada": Los 1 se convierten en 2
    if (valorDado === 1 && partida && partida.getModificador('convertir_uno_en_dos') > 0) {
      valorDado = 2;
    }
    
    // Aplicar efecto de reliquia "Corona de Cristal": Los 6 cuentan como 10
    if (valorDado === 6 && partida && partida.getModificador('seis_cuentan_diez') > 0) {
      valorDado = 10;
    }
    
    // Efecto "Eco": cuenta su valor dos veces
    if (dado.efecto === 'eco') {
      valorDado = valorDado * 2;
    }
    
    // Efecto de dados benditos: si es mayor a 4, es crítico
    if (dado.tipo === 'bendito' && dado.valor > 4) {
      dadosCriticos++;
    }
    
    suma += valorDado;
  }
  
  // Aplicar modificador de pacto "Herencia Demoníaca": +3 a la suma final
  if (partida && partida.getModificador('bonus_suma_final') > 0) {
    suma += partida.getModificador('bonus_suma_final');
  }
  
 return { suma, tieneCranio, dadosCriticos };
}

// Nueva función para verificar si un dado es par
function esDadoPar(dado) {
  return typeof dado.valor === 'number' && dado.valor % 2 === 0;
}

// Nueva función para duplicar dados benditos si el otro es par
function aplicarEfectoDadoBendito(dadosSeleccionados) {
  if (dadosSeleccionados.length !== 2) return dadosSeleccionados;
  
  const [dado1, dado2] = dadosSeleccionados;
  
  // Si uno es bendito y el otro es par, duplicar el valor del bendito
  if (dado1.tipo === 'bendito' && esDadoPar(dado2)) {
    return [{...dado1, valor: dado1.valor * 2}, dado2];
  }
  if (dado2.tipo === 'bendito' && esDadoPar(dado1)) {
    return [dado1, {...dado2, valor: dado2.valor * 2}];
  }
  
  return dadosSeleccionados;
}

module.exports = {
  crearDadoBase,
  crearDadoCorrupcion,
  crearDadoBendito,
  getRandomCorruptionEffect,
  aplicarEfectoDadoCorrupto,
  relanzarDado,
  resetDados,
  aumentarDado,
  voltearDado,
  calcularSumaDados,
  aplicarEfectoDadoBendito,
  esDadoPar
};
