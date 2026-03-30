// ========================================
// CYCLE PHASES
// ========================================

const PHASES = {
  menstrual: {
    name: 'Menstrual',
    emoji: '🩸',
    color: '#c2185b',
    description: 'Tiempo de soltar y descansar. Tu cuerpo se renueva.',
    hormones: { estrogen: 'bajo', progesterone: 'bajo', testosterone: 'bajo' },
    energy: 'baja',
    mood: 'introspectiva',
  },
  follicular: {
    name: 'Folicular',
    emoji: '🌱',
    color: '#7cb342',
    description: 'Energía en ascenso. Momento ideal para planear y crear.',
    hormones: { estrogen: 'subiendo', progesterone: 'bajo', testosterone: 'subiendo' },
    energy: 'creciente',
    mood: 'optimista y creativa',
  },
  ovulatory: {
    name: 'Ovulatoria',
    emoji: '🌕',
    color: '#f9a825',
    description: 'Tu pico de energía, magnetismo y comunicación.',
    hormones: { estrogen: 'alto', progesterone: 'bajo', testosterone: 'alto' },
    energy: 'alta',
    mood: 'sociable y magnética',
  },
  luteal: {
    name: 'Lútea',
    emoji: '🍂',
    color: '#8d6e63',
    description: 'Fase de cierre. Ideal para organizar y completar.',
    hormones: { estrogen: 'bajando', progesterone: 'alto', testosterone: 'bajo' },
    energy: 'decreciente',
    mood: 'analítica y detallista',
  },
};

export function getCurrentPhase(lastPeriodDate, cycleLength = 28) {
  if (!lastPeriodDate) return null;
  const today = new Date();
  const start = new Date(lastPeriodDate);
  const diffTime = today - start;
  const dayOfCycle = Math.floor(diffTime / (1000 * 60 * 60 * 24)) % cycleLength + 1;
  return getPhaseForDay(dayOfCycle, cycleLength);
}

export function getPhaseForDay(day, cycleLength = 28) {
  const menstrualEnd = Math.round(cycleLength * 0.18);      // ~5 days
  const follicularEnd = Math.round(cycleLength * 0.46);     // ~13 days
  const ovulatoryEnd = Math.round(cycleLength * 0.57);      // ~16 days

  let phaseKey;
  if (day <= menstrualEnd) phaseKey = 'menstrual';
  else if (day <= follicularEnd) phaseKey = 'follicular';
  else if (day <= ovulatoryEnd) phaseKey = 'ovulatory';
  else phaseKey = 'luteal';

  return { ...PHASES[phaseKey], key: phaseKey, dayOfCycle: day, cycleLength };
}

export function getDayOfCycle(lastPeriodDate, cycleLength = 28) {
  if (!lastPeriodDate) return null;
  const today = new Date();
  const start = new Date(lastPeriodDate);
  const diffTime = today - start;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)) % cycleLength + 1;
}

export function getNextPeriodDate(lastPeriodDate, cycleLength = 28) {
  if (!lastPeriodDate) return null;
  const start = new Date(lastPeriodDate);
  const today = new Date();
  const next = new Date(start);
  while (next <= today) {
    next.setDate(next.getDate() + cycleLength);
  }
  return next;
}

export function getDaysUntilNextPeriod(lastPeriodDate, cycleLength = 28) {
  const next = getNextPeriodDate(lastPeriodDate, cycleLength);
  if (!next) return null;
  const today = new Date();
  return Math.ceil((next - today) / (1000 * 60 * 60 * 24));
}

// ========================================
// NUTRITION BY PHASE
// ========================================

export const NUTRITION = {
  menstrual: {
    title: 'Nutrición — Fase Menstrual',
    subtitle: 'Alimentos que calientan, reconfortan y reponen hierro',
    foods: [
      { name: 'Carnes rojas magras', benefit: 'Reponen hierro perdido', icon: '🥩' },
      { name: 'Lentejas y frijoles', benefit: 'Hierro vegetal + fibra', icon: '🫘' },
      { name: 'Chocolate oscuro (70%+)', benefit: 'Magnesio y endorfinas', icon: '🍫' },
      { name: 'Sopas y caldos', benefit: 'Hidratan y calientan', icon: '🍲' },
      { name: 'Espinaca y kale', benefit: 'Hierro, folato, vitamina K', icon: '🥬' },
      { name: 'Jengibre y cúrcuma', benefit: 'Antiinflamatorios naturales', icon: '🫚' },
      { name: 'Semillas de calabaza', benefit: 'Zinc y magnesio', icon: '🎃' },
      { name: 'Remolacha', benefit: 'Hierro y desintoxicación', icon: '🟣' },
    ],
    avoid: ['Café en exceso', 'Alcohol', 'Alimentos muy fríos', 'Exceso de sal'],
    tip: 'Prioriza comidas calientes y reconfortantes. Tu cuerpo necesita descanso y reposición.',
  },
  follicular: {
    title: 'Nutrición — Fase Folicular',
    subtitle: 'Alimentos frescos y ligeros que acompañan tu energía creciente',
    foods: [
      { name: 'Huevos', benefit: 'Proteína para energía creciente', icon: '🥚' },
      { name: 'Aguacate', benefit: 'Grasas saludables y vitamina E', icon: '🥑' },
      { name: 'Brócoli', benefit: 'Metabolismo de estrógeno', icon: '🥦' },
      { name: 'Frutas cítricas', benefit: 'Vitamina C, energía', icon: '🍊' },
      { name: 'Quinoa', benefit: 'Proteína completa vegetal', icon: '🌾' },
      { name: 'Fermentados (kimchi, yogurt)', benefit: 'Salud intestinal', icon: '🥛' },
      { name: 'Semillas de lino', benefit: 'Omega-3, regulan estrógeno', icon: '🌰' },
      { name: 'Pollo y pavo', benefit: 'Proteína magra', icon: '🍗' },
    ],
    avoid: ['Alimentos ultraprocesados', 'Exceso de azúcar refinada'],
    tip: 'Prueba recetas nuevas y experimenta con sabores frescos. Tu creatividad está en auge.',
  },
  ovulatory: {
    title: 'Nutrición — Fase Ovulatoria',
    subtitle: 'Alimentos crudos, ligeros y antiinflamatorios',
    foods: [
      { name: 'Ensaladas crudas', benefit: 'Fibra para metabolizar estrógeno alto', icon: '🥗' },
      { name: 'Salmón', benefit: 'Omega-3 antiinflamatorio', icon: '🐟' },
      { name: 'Frutas rojas', benefit: 'Antioxidantes', icon: '🍓' },
      { name: 'Espárragos', benefit: 'Prebiótico natural', icon: '🌿' },
      { name: 'Tomate', benefit: 'Licopeno antioxidante', icon: '🍅' },
      { name: 'Almendras', benefit: 'Vitamina E, magnesio', icon: '🌰' },
      { name: 'Agua de coco', benefit: 'Hidratación y electrolitos', icon: '🥥' },
      { name: 'Pimientos', benefit: 'Vitamina C', icon: '🫑' },
    ],
    avoid: ['Comidas pesadas', 'Exceso de cafeína', 'Alimentos muy grasos'],
    tip: 'Tu metabolismo está acelerado. Come ligero pero nutritivo.',
  },
  luteal: {
    title: 'Nutrición — Fase Lútea',
    subtitle: 'Alimentos complejos que estabilizan el ánimo y combaten antojos',
    foods: [
      { name: 'Camote / batata', benefit: 'Carbohidrato complejo, serotonina', icon: '🍠' },
      { name: 'Arroz integral', benefit: 'Estabiliza azúcar en sangre', icon: '🍚' },
      { name: 'Plátano', benefit: 'Potasio, vitamina B6', icon: '🍌' },
      { name: 'Nueces', benefit: 'Omega-3, magnesio', icon: '🥜' },
      { name: 'Garbanzos', benefit: 'Vitamina B6, proteína', icon: '🫘' },
      { name: 'Té de manzanilla', benefit: 'Calma y antiinflamatorio', icon: '🍵' },
      { name: 'Semillas de girasol', benefit: 'Selenio y vitamina E', icon: '🌻' },
      { name: 'Pavo', benefit: 'Triptófano para serotonina', icon: '🦃' },
    ],
    avoid: ['Azúcar refinada', 'Alcohol', 'Exceso de sodio', 'Cafeína fuerte'],
    tip: 'Come regularmente para evitar bajones de energía. Carbohidratos complejos son tus aliados.',
  },
};

// ========================================
// EXERCISE BY PHASE
// ========================================

export const EXERCISE = {
  menstrual: {
    title: 'Ejercicio — Fase Menstrual',
    subtitle: 'Movimientos suaves y restaurativos',
    activities: [
      { name: 'Yoga restaurativo', duration: '20-30 min', intensity: 'Baja', icon: '🧘‍♀️', description: 'Posturas suaves, enfocadas en abrir caderas y relajar.' },
      { name: 'Caminata suave', duration: '20-30 min', intensity: 'Baja', icon: '🚶‍♀️', description: 'Sin prisa, idealmente en naturaleza.' },
      { name: 'Estiramientos', duration: '15-20 min', intensity: 'Baja', icon: '🤸‍♀️', description: 'Enfócate en espalda baja y caderas.' },
      { name: 'Meditación en movimiento', duration: '10-15 min', intensity: 'Muy baja', icon: '🌊', description: 'Tai chi o movimientos libres conscientes.' },
    ],
    tip: 'Escucha a tu cuerpo. Si necesitas descansar, descansa. No es flojera, es sabiduría.',
  },
  follicular: {
    title: 'Ejercicio — Fase Folicular',
    subtitle: 'Explora, prueba cosas nuevas, sube la intensidad',
    activities: [
      { name: 'Cardio moderado', duration: '30-45 min', intensity: 'Media-Alta', icon: '🏃‍♀️', description: 'Running, bicicleta, clases de spinning.' },
      { name: 'Entrenamiento de fuerza', duration: '30-40 min', intensity: 'Media', icon: '💪', description: 'Tu cuerpo responde bien a ganar músculo ahora.' },
      { name: 'Baile', duration: '30-45 min', intensity: 'Media', icon: '💃', description: 'Zumba, danza contemporánea, lo que te mueva.' },
      { name: 'Deportes en equipo', duration: '45-60 min', intensity: 'Media-Alta', icon: '⚽', description: 'Tu energía social está alta, aprovéchala.' },
    ],
    tip: 'Es el mejor momento para probar rutinas nuevas o aumentar pesos.',
  },
  ovulatory: {
    title: 'Ejercicio — Fase Ovulatoria',
    subtitle: 'Tu pico de rendimiento — ¡dale con todo!',
    activities: [
      { name: 'HIIT', duration: '20-30 min', intensity: 'Alta', icon: '🔥', description: 'Intervalos de alta intensidad. Tu cuerpo lo aguanta.' },
      { name: 'CrossFit / funcional', duration: '30-45 min', intensity: 'Alta', icon: '🏋️‍♀️', description: 'Máximo rendimiento y fuerza.' },
      { name: 'Running intenso', duration: '30-45 min', intensity: 'Alta', icon: '🏃‍♀️', description: 'Tempo runs o intervalos.' },
      { name: 'Clases grupales intensas', duration: '45-60 min', intensity: 'Alta', icon: '🎯', description: 'Boxing, spinning, bootcamp.' },
    ],
    tip: 'Máxima testosterona y estrógeno = máximo rendimiento. ¡Rompe tus records!',
  },
  luteal: {
    title: 'Ejercicio — Fase Lútea',
    subtitle: 'Baja la intensidad progresivamente',
    activities: [
      { name: 'Pilates', duration: '30-40 min', intensity: 'Media', icon: '🧘', description: 'Fortalece core sin impacto.' },
      { name: 'Yoga flow', duration: '30-45 min', intensity: 'Media-Baja', icon: '🧘‍♀️', description: 'Vinyasa suave, conecta cuerpo y mente.' },
      { name: 'Caminata con inclinación', duration: '30-40 min', intensity: 'Media', icon: '🥾', description: 'Cardio sin impacto fuerte.' },
      { name: 'Natación', duration: '30-45 min', intensity: 'Media-Baja', icon: '🏊‍♀️', description: 'Bajo impacto, relajante.' },
    ],
    tip: 'Ve bajando la intensidad conforme se acerca tu periodo. Escucha las señales.',
  },
};

// ========================================
// LUNAR CYCLE
// ========================================

const LUNAR_CYCLE_DAYS = 29.53;

const MOON_PHASES = [
  { name: 'Luna Nueva', emoji: '🌑', angle: 0, description: 'Inicio, introspección, sembrar intenciones.', archetype: 'La Sabia Interior' },
  { name: 'Luna Creciente', emoji: '🌒', angle: 45, description: 'Primeros pasos, clarificar la intención.', archetype: 'La Exploradora' },
  { name: 'Cuarto Creciente', emoji: '🌓', angle: 90, description: 'Acción, decisión, superar obstáculos.', archetype: 'La Guerrera' },
  { name: 'Gibosa Creciente', emoji: '🌔', angle: 135, description: 'Refinar, ajustar, paciencia activa.', archetype: 'La Perfeccionista' },
  { name: 'Luna Llena', emoji: '🌕', angle: 180, description: 'Plenitud, cosecha, celebración, máxima energía.', archetype: 'La Madre' },
  { name: 'Gibosa Menguante', emoji: '🌖', angle: 225, description: 'Gratitud, compartir, enseñar.', archetype: 'La Maestra' },
  { name: 'Cuarto Menguante', emoji: '🌗', angle: 270, description: 'Soltar, perdonar, dejar ir lo que no sirve.', archetype: 'La Liberadora' },
  { name: 'Luna Menguante', emoji: '🌘', angle: 315, description: 'Descanso, rendición, prepararse para renacer.', archetype: 'La Mística' },
];

export function getMoonPhase(date = new Date()) {
  const knownNewMoon = new Date('2024-01-11T11:57:00Z');
  const diff = date - knownNewMoon;
  const daysSinceNew = diff / (1000 * 60 * 60 * 24);
  const phase = ((daysSinceNew % LUNAR_CYCLE_DAYS) + LUNAR_CYCLE_DAYS) % LUNAR_CYCLE_DAYS;
  const angle = (phase / LUNAR_CYCLE_DAYS) * 360;

  let closest = MOON_PHASES[0];
  let minDiff = 360;
  for (const mp of MOON_PHASES) {
    const d = Math.abs(angle - mp.angle);
    const wrapped = Math.min(d, 360 - d);
    if (wrapped < minDiff) {
      minDiff = wrapped;
      closest = mp;
    }
  }

  return { ...closest, dayOfLunarCycle: Math.floor(phase) + 1, illumination: Math.round((1 - Math.cos(angle * Math.PI / 180)) / 2 * 100) };
}

export function getLunarCalendar(year, month) {
  const days = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    days.push({ date, day: d, moon: getMoonPhase(date) });
  }
  return days;
}

export function getSyncEvaluation(menstrualPhaseKey, moonPhase) {
  const syncMap = {
    'menstrual-Luna Nueva': { level: 'alta', message: 'Perfecta sincronía. Tu menstruación se alinea con la luna nueva: ambas invitan a la introspección y el descanso.' },
    'ovulatory-Luna Llena': { level: 'alta', message: 'Ciclo blanco clásico. Tu ovulación coincide con la luna llena: máxima fertilidad y energía expansiva.' },
    'follicular-Luna Creciente': { level: 'media', message: 'Buena sincronía. Ambas energías están en ascenso.' },
    'follicular-Cuarto Creciente': { level: 'media', message: 'Energía creciente alineada. Momento de acción.' },
    'luteal-Luna Menguante': { level: 'media', message: 'Ambas energías van hacia el cierre. Buen momento para soltar.' },
    'luteal-Cuarto Menguante': { level: 'media', message: 'Fase de liberación en ambos ciclos.' },
  };

  const key = `${menstrualPhaseKey}-${moonPhase}`;
  return syncMap[key] || { level: 'neutral', message: 'Tu ciclo menstrual y lunar están en fases distintas. Ambos aportan energías complementarias.' };
}

export { PHASES, MOON_PHASES };
