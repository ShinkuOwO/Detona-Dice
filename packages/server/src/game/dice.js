function crearDadoCorrupcion(id) {
  const valores = [0, 0, 4, 7, 8, 'CRÁNEO'];
  const valor = valores[Math.floor(Math.random() * valores.length)];
  return { id, valor, esCorrupto: true };
}

function relanzarDado(dado) {
  let nuevoValor;
  if (dado.esCorrupto) {
    const valoresCorrupcion = [0, 0, 4, 7, 8, 'CRÁNEO'];
    nuevoValor = valoresCorrupcion[Math.floor(Math.random() * valoresCorrupcion.length)];
  } else {
    nuevoValor = Math.floor(Math.random() * 6) + 1;
  }
  return { ...dado, valor: nuevoValor };
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

function calcularSumaDados(dados) {
  let suma = 0;
  let tieneCranio = false;
  for (const dado of dados) {
    if (dado.valor === 'CRÁNEO') {
      tieneCranio = true;
      continue;
    }
    suma += dado.valor;
  }
  return { suma, tieneCranio };
}

module.exports = {
  crearDadoCorrupcion,
  relanzarDado,
  resetDados,
  aumentarDado,
  voltearDado,
  calcularSumaDados,
};
