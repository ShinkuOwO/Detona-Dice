// pactos.ts

export type RarezaPacto = 'comun' | 'raro' | 'epico';

export interface PactoDef {
  id: string;
 nombre: string;
 poder: string;
  maldicion: string;
  rareza: RarezaPacto;
}

export const PACTOS: PactoDef[] = [
  // ========= NIVEL 1 / COMUNES =========
  {
    id: 'pacto_vidente',
    nombre: 'Pacto del Vidente',
    poder: '+2 a todos tus lanzamientos.',
    maldicion: 'Pierdes 1 HP permanente por piso.',
    rareza: 'comun',
  },
  {
    id: 'pacto_eco',
    nombre: 'Pacto del Eco',
    poder: 'Cada turno, tu dado más alto cuenta doble.',
    maldicion: 'Tu dado más bajo se convierte en corrupto.',
    rareza: 'comun',
  },
  {
    id: 'pacto_usurpador',
    nombre: 'Pacto del Usurpador',
    poder: '+1 energía máxima.',
    maldicion: 'Empiezas cada piso con -1 energía temporal.',
    rareza: 'comun',
  },
  {
    id: 'pacto_taimado',
    nombre: 'Pacto del Taimado',
    poder: 'Los resultados de 1 se convierten en 3.',
    maldicion: 'Los resultados de 6 se convierten en dados corruptos.',
    rareza: 'comun',
  },
 {
    id: 'pacto_filo_carmesí',
    nombre: 'Pacto del Filo Carmesí',
    poder: '+1 de daño garantizado al superar el objetivo.',
    maldicion: 'Pierdes 1 HP si fallas el objetivo.',
    rareza: 'comun',
  },
  {
    id: 'pacto_mentiroso',
    nombre: 'Pacto del Mentiroso',
    poder: 'Puedes seleccionar 3 dados en vez de 2.',
    maldicion: 'Al seleccionar 3 dados, el más alto se vuelve corrupto.',
    rareza: 'comun',
  },
  {
    id: 'pacto_avaricia',
    nombre: 'Pacto de la Avaricia',
    poder: '+10 de oro al terminar cada piso.',
    maldicion: '+1 de corrupción permanente por piso.',
    rareza: 'comun',
  },
  {
    id: 'pacto_titan',
    nombre: 'Pacto del Titán',
    poder: '+5 HP máximo.',
    maldicion: 'La habilidad Aumentar cuesta +1 energía.',
    rareza: 'comun',
  },
  {
    id: 'pacto_sombra',
    nombre: 'Pacto de la Sombra',
    poder: 'Comienzas cada piso con un dado bendito de valor 4.',
    maldicion: 'También comienzas con 1 dado corrupto.',
    rareza: 'comun',
  },
  {
    id: 'pacto_cruel',
    nombre: 'Pacto del Cruel',
    poder: 'Relanzar cuesta 0 energía.',
    maldicion: 'Cada combate pierdes 2 HP si usas Relanzar al menos una vez.',
    rareza: 'comun',
  },

  // ========= NIVEL 2 / RAROS =========
  {
    id: 'pacto_abismo',
    nombre: 'Pacto del Abismo',
    poder: '+3 a la suma final al evaluar el objetivo.',
    maldicion: 'Ganas 2 de corrupción al iniciar cada piso.',
    rareza: 'raro',
  },
  {
    id: 'pacto_cronista',
    nombre: 'Pacto del Cronista',
    poder: 'Cada 3 turnos, ganas +1 energía.',
    maldicion: 'Tus 2 primeros usos de Relanzar en cada combate están deshabilitados.',
    rareza: 'raro',
  },
  {
    id: 'pacto_destino_invertido',
    nombre: 'Pacto del Destino Invertido',
    poder: 'Voltear cuesta 1 energía en lugar de 2.',
    maldicion: 'Todos tus dados pares pierden -1 valor al lanzarse.',
    rareza: 'raro',
  },
  {
    id: 'pacto_ritual_prohibido',
    nombre: 'Pacto del Ritual Prohibido',
    poder: 'Obtienes una reliquia aleatoria al final de cada piso.',
    maldicion: 'Cada reliquia obtenida te inflige 1 de corrupción.',
    rareza: 'raro',
  },
  {
    id: 'pacto_coleccionista',
    nombre: 'Pacto del Coleccionista',
    poder: '+1 dado base permanente.',
    maldicion: 'El dado adicional es corrupto para siempre.',
    rareza: 'raro',
  },
  {
    id: 'pacto_renacido',
    nombre: 'Pacto del Renacido',
    poder: 'Si mueres, revives con 1 HP una vez por partida.',
    maldicion: 'Todos los resultados de 6 en tus dados se convierten en corrupción.',
    rareza: 'raro',
  },
  {
    id: 'pacto_preparador',
    nombre: 'Pacto del Preparador',
    poder: 'Empiezas cada combate con energía máxima +1 temporal.',
    maldicion: 'La primera habilidad que uses en cada combate cuesta +1 energía extra.',
    rareza: 'raro',
  },
  {
    id: 'pacto_frio_eterno',
    nombre: 'Pacto del Frío Eterno',
    poder: 'Los resultados 5 y 6 cuentan como críticos (se duplican en la suma).',
    maldicion: 'Los resultados de 1 te infligen 1 daño directo.',
    rareza: 'raro',
  },
  {
    id: 'pacto_faro_oscuro',
    nombre: 'Pacto del Faro Oscuro',
    poder: 'El objetivo numérico del combate baja en 2 puntos.',
    maldicion: 'Pierdes 2 HP cada vez que fallas un combate.',
    rareza: 'raro',
  },
  {
    id: 'pacto_sangre_eterna',
    nombre: 'Pacto de la Sangre Eterna',
    poder: 'Cada vez que superas el objetivo recuperas 2 HP.',
    maldicion: 'Cada combate inicias con -2 HP temporal.',
    rareza: 'raro',
  },

  // ========= NIVEL 3 / EPICOS =========
  {
    id: 'pacto_infierno_glorioso',
    nombre: 'Pacto del Infierno Glorioso',
    poder: 'Todos tus lanzamientos de 4+ se consideran críticos (se duplican).',
    maldicion: 'Empiezas cada piso con 3 de corrupción.',
    rareza: 'epico',
  },
  {
    id: 'pacto_vacio_viviente',
    nombre: 'Pacto del Vacío Viviente',
    poder: 'Puedes seleccionar siempre 3 dados en lugar de 2.',
    maldicion: 'Al final de cada combate ganas +1 de corrupción permanente.',
    rareza: 'epico',
  },
  {
    id: 'pacto_oraculo_silencioso',
    nombre: 'Pacto del Oráculo Silencioso',
    poder: 'Antes de lanzar, ves previsualizados los valores de los próximos 3 dados.',
    maldicion: 'No puedes usar la habilidad Relanzar.',
    rareza: 'epico',
  },
  {
    id: 'pacto_maquina_perfecta',
    nombre: 'Pacto de la Máquina Perfecta',
    poder: 'Aumentar ahora suma +3 al dado objetivo.',
    maldicion: 'Aumentar cuesta 3 de energía.',
    rareza: 'epico',
  },
  {
    id: 'pacto_reina_dados',
    nombre: 'Pacto de la Reina de Dados',
    poder: 'Tu dado más bajo siempre se convierte en 6 al resolver la tirada.',
    maldicion: 'Tu dado más alto se convierte en corrupto.',
    rareza: 'epico',
  },
  {
    id: 'pacto_corazon_gris',
    nombre: 'Pacto del Corazón Gris',
    poder: 'No puedes morir si tienes más de 1 HP (no bajas de 1 HP).',
    maldicion: 'Tu HP máximo se reduce un 40%.',
    rareza: 'epico',
  },
  {
    id: 'pacto_eclipse',
    nombre: 'Pacto del Eclipse',
    poder: '+4 energía máxima.',
    maldicion: 'Pierdes 2 HP al inicio de cada turno de combate.',
    rareza: 'epico',
  },
  {
    id: 'pacto_engullidor',
    nombre: 'Pacto del Engullidor',
    poder: 'Cada 3 combates completados obtienes una reliquia legendaria.',
    maldicion: 'En cada combate, 1 dado base aleatorio se convierte en corrupto.',
    rareza: 'epico',
  },
  {
    id: 'pacto_atlas_caido',
    nombre: 'Pacto del Atlas Caído',
    poder: 'Cumples el objetivo si alcanzas al menos la mitad del valor requerido.',
    maldicion: 'No puedes usar las habilidades Aumentar ni Voltear.',
    rareza: 'epico',
  },
  {
    id: 'pacto_caos_absoluto',
    nombre: 'Pacto del Caos Absoluto',
    poder: 'Todos tus dados corruptos cuentan como si fueran 6.',
    maldicion: 'Ganas +2 dados corruptos adicionales por piso.',
    rareza: 'epico',
  },
];
