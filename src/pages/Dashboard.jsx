import { useEffect, useState } from 'react';
import { getCycleConfig, getDailyLogs } from '../lib/supabase';
import {
  getCurrentPhase,
  getDayOfCycle,
  getDaysUntilNextPeriod,
  getMoonPhase,
  getLunarCalendar,
  getSyncEvaluation,
  getPhaseForDay,
  NUTRITION,
  EXERCISE,
} from '../lib/cycleLogic';

const HORMONE_LEVELS = {
  bajo: 20,
  subiendo: 50,
  alto: 85,
  bajando: 55,
};

const TABS = [
  { key: 'summary', label: 'Resumen' },
  { key: 'calendar', label: 'Calendario' },
  { key: 'reco', label: 'Consejos' },
];

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function Dashboard() {
  const [config, setConfig] = useState(null);
  const [phase, setPhase] = useState(null);
  const [dayOfCycle, setDayOfCycle] = useState(null);
  const [daysUntil, setDaysUntil] = useState(null);
  const [moon, setMoon] = useState(null);
  const [sync, setSync] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [loggedPeriodDays, setLoggedPeriodDays] = useState({}); // { 'YYYY-MM-DD': flowValue }

  // Calendar state
  const [calDate, setCalDate] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const cfg = await getCycleConfig();
    if (!cfg) return;
    setConfig(cfg);

    const p = getCurrentPhase(cfg.last_period_date, cfg.cycle_length);
    setPhase(p);
    setDayOfCycle(getDayOfCycle(cfg.last_period_date, cfg.cycle_length));
    setDaysUntil(getDaysUntilNextPeriod(cfg.last_period_date, cfg.cycle_length));

    const m = getMoonPhase();
    setMoon(m);

    if (p) {
      setSync(getSyncEvaluation(p.key, m.name));
    }

    // Load daily logs for calendar overlay
    try {
      const logs = await getDailyLogs();
      const periodMap = {};
      if (logs) {
        logs.forEach((log) => {
          if (log.flow && log.flow !== 'none') {
            periodMap[log.date] = log.flow;
          }
        });
      }
      setLoggedPeriodDays(periodMap);
    } catch (e) {
      // silent — calendar still works with estimated data
    }
  }

  if (!config) {
    return (
      <div className="page-header fade-in" style={{ textAlign: 'center', paddingTop: 60 }}>
        <h1>Luna Cycle</h1>
        <p>Cargando tus datos...</p>
      </div>
    );
  }

  // Calendar helpers
  function getCalendarDays() {
    const { year, month } = calDate;
    const lunarDays = getLunarCalendar(year, month);
    const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0
    const days = [];

    // Empty cells before first day
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ empty: true });
    }

    const today = new Date();
    const periodStart = new Date(config.last_period_date);
    const cycleLen = config.cycle_length || 28;
    const periodLen = config.period_length || 5;

    lunarDays.forEach((ld) => {
      const date = new Date(year, month, ld.day);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(ld.day).padStart(2, '0')}`;
      const diffDays = Math.floor((date - periodStart) / (1000 * 60 * 60 * 24));
      const dayInCycle = ((diffDays % cycleLen) + cycleLen) % cycleLen + 1;
      const phaseForDay = getPhaseForDay(dayInCycle, cycleLen);
      const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

      // Use logged data if available, otherwise estimate
      const hasLoggedFlow = loggedPeriodDays[dateStr];
      const isPeriod = hasLoggedFlow ? true : dayInCycle <= periodLen;

      days.push({
        day: ld.day,
        moon: ld.moon,
        isToday,
        isPeriod,
        loggedFlow: hasLoggedFlow || null,
        phaseKey: phaseForDay.key,
        dayInCycle,
      });
    });

    return days;
  }

  const monthName = new Date(calDate.year, calDate.month).toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  });

  function prevMonth() {
    setCalDate((prev) => {
      const d = new Date(prev.year, prev.month - 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  function nextMonth() {
    setCalDate((prev) => {
      const d = new Date(prev.year, prev.month + 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  const nutrition = phase ? NUTRITION[phase.key] : null;
  const exercise = phase ? EXERCISE[phase.key] : null;

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <p>{config.name ? `Bienvenida, ${config.name}` : 'Tu ciclo'}</p>
        <h1>Luna Cycle</h1>
      </div>

      {/* Phase indicator */}
      {phase && (
        <div
          className="phase-indicator"
          style={{ background: `${phase.color}10`, border: `1px solid ${phase.color}20` }}
        >
          <span className="phase-emoji-large">{phase.emoji}</span>
          <div className="phase-info">
            <div className="phase-name">{phase.name}</div>
            <div className="phase-day">
              Día {dayOfCycle} de {phase.cycleLength} &middot; {moon?.emoji} {moon?.name}
            </div>
          </div>
          {daysUntil !== null && (
            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.6rem',
                  fontWeight: 700,
                  color: 'var(--text)',
                }}
              >
                {daysUntil}
              </div>
              <div
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: 'var(--text-muted)',
                }}
              >
                días para
                <br />
                tu periodo
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="dash-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`dash-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: Summary */}
      {activeTab === 'summary' && (
        <div className="fade-in">
          {phase && (
            <div className="card">
              <p style={{ marginBottom: 14 }}>{phase.description}</p>
              <div className="hormone-bars">
                <div className="hormone-row">
                  <span className="hormone-label">Estrógeno</span>
                  <div className="hormone-bar">
                    <div
                      className="hormone-fill estrogen"
                      style={{ width: `${HORMONE_LEVELS[phase.hormones.estrogen]}%` }}
                    />
                  </div>
                </div>
                <div className="hormone-row">
                  <span className="hormone-label">Progesterona</span>
                  <div className="hormone-bar">
                    <div
                      className="hormone-fill progesterone"
                      style={{ width: `${HORMONE_LEVELS[phase.hormones.progesterone]}%` }}
                    />
                  </div>
                </div>
                <div className="hormone-row">
                  <span className="hormone-label">Testosterona</span>
                  <div className="hormone-bar">
                    <div
                      className="hormone-fill testosterone"
                      style={{ width: `${HORMONE_LEVELS[phase.hormones.testosterone]}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-value">{dayOfCycle || '—'}</div>
              <div className="stat-label">Día del ciclo</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{phase?.energy || '—'}</div>
              <div className="stat-label">Energía</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ fontSize: '1.8rem' }}>
                {moon?.emoji || '🌙'}
              </div>
              <div className="stat-label">{moon?.name || 'Luna'}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ fontSize: '0.85rem', fontFamily: 'var(--font-body)', fontWeight: 500, fontStyle: 'normal' }}>
                {phase?.mood || '—'}
              </div>
              <div className="stat-label">Estado</div>
            </div>
          </div>

          {sync && (
            <div className={`card sync-indicator ${sync.level}`}>
              <div className="sync-level">
                {sync.level === 'alta'
                  ? '✦ Sincronía alta'
                  : sync.level === 'media'
                  ? '◐ Sincronía media'
                  : '❋ Energías complementarias'}
              </div>
              <p style={{ fontSize: '0.83rem', color: 'var(--text-light)' }}>{sync.message}</p>
            </div>
          )}

          {phase && (
            <div className="card">
              <h3>Consejo del día</h3>
              <p style={{ marginTop: 6 }}>
                {phase.key === 'menstrual' &&
                  'Hoy tu cuerpo pide descanso. Prioriza el autocuidado y deja lo que pueda esperar.'}
                {phase.key === 'follicular' &&
                  'Energía en ascenso. Aprovecha para planificar, crear y empezar proyectos nuevos.'}
                {phase.key === 'ovulatory' &&
                  'Estás en tu pico de energía. Agenda reuniones importantes y actividades sociales.'}
                {phase.key === 'luteal' &&
                  'Enfócate en terminar pendientes y organizar. Tu ojo para el detalle está afinado.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB: Calendar */}
      {activeTab === 'calendar' && (
        <div className="fade-in">
          <div className="card" style={{ padding: 16 }}>
            <div className="cal-header">
              <button className="cal-nav-btn" onClick={prevMonth}>
                ‹
              </button>
              <h3 style={{ textTransform: 'capitalize' }}>{monthName}</h3>
              <button className="cal-nav-btn" onClick={nextMonth}>
                ›
              </button>
            </div>

            <div className="cal-weekdays">
              {WEEKDAYS.map((d) => (
                <div key={d} className="cal-weekday">
                  {d}
                </div>
              ))}
            </div>

            <div className="cal-grid">
              {getCalendarDays().map((d, i) =>
                d.empty ? (
                  <div key={`e-${i}`} className="cal-day empty" />
                ) : (
                  <div
                    key={d.day}
                    className={[
                      'cal-day',
                      d.isToday ? 'today' : '',
                      d.isPeriod ? 'period' : '',
                      d.isPeriod && d.loggedFlow ? 'period-logged' : '',
                      !d.isPeriod ? `${d.phaseKey}-day` : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    title={`Día ${d.dayInCycle} — ${d.moon.name}${d.loggedFlow ? ' (registrado)' : ''}`}
                  >
                    <span className="cal-day-num">{d.day}</span>
                    <span className="cal-day-moon">{d.moon.emoji}</span>
                    {d.loggedFlow && <span className="cal-day-dot" />}
                  </div>
                )
              )}
            </div>

            <div className="cal-legend">
              <div className="cal-legend-item">
                <span className="cal-legend-dot" style={{ background: 'var(--menstrual)' }} />
                Periodo
              </div>
              <div className="cal-legend-item">
                <span className="cal-legend-dot" style={{ background: 'var(--follicular)' }} />
                Folicular
              </div>
              <div className="cal-legend-item">
                <span className="cal-legend-dot" style={{ background: 'var(--ovulatory)' }} />
                Ovulación
              </div>
              <div className="cal-legend-item">
                <span className="cal-legend-dot" style={{ background: 'var(--luteal)' }} />
                Lútea
              </div>
              <div className="cal-legend-item">
                <span style={{ fontSize: '0.85rem' }}>🌑🌕</span>
                Fase lunar
              </div>
              <div className="cal-legend-item">
                <span className="cal-legend-dot" style={{ background: 'var(--menstrual)', border: '1.5px solid var(--menstrual)', width: 8, height: 8 }} />
                Registrado
              </div>
            </div>
          </div>

          {/* Moon info for today */}
          {moon && (
            <div className="card">
              <h3>
                {moon.emoji} {moon.name}
              </h3>
              <p style={{ marginTop: 6 }}>{moon.description}</p>
              <div
                style={{
                  marginTop: 10,
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  gap: 16,
                }}
              >
                <span>Iluminación: {moon.illumination}%</span>
                <span>Arquetipo: {moon.archetype}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: Recommendations */}
      {activeTab === 'reco' && phase && (
        <div className="fade-in">
          {/* Nutrition */}
          {nutrition && (
            <div className="reco-section">
              <div className="reco-section-title">Nutrición para tu fase</div>
              <p
                style={{
                  fontSize: '0.82rem',
                  color: 'var(--text-muted)',
                  marginBottom: 14,
                }}
              >
                {nutrition.subtitle}
              </p>
              <div className="reco-grid">
                {nutrition.foods.slice(0, 6).map((food) => (
                  <div key={food.name} className="reco-card">
                    <div className="reco-icon">{food.icon}</div>
                    <div className="reco-name">{food.name}</div>
                    <div className="reco-detail">{food.benefit}</div>
                  </div>
                ))}
              </div>
              {nutrition.avoid.length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      color: 'var(--text-muted)',
                      marginBottom: 8,
                    }}
                  >
                    Evitar
                  </div>
                  <div className="avoid-list">
                    {nutrition.avoid.map((item) => (
                      <span key={item} className="avoid-tag">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="tip-box" style={{ marginTop: 14 }}>
                {nutrition.tip}
              </div>
            </div>
          )}

          <div className="section-divider" />

          {/* Exercise */}
          {exercise && (
            <div className="reco-section">
              <div className="reco-section-title">Ejercicio recomendado</div>
              <p
                style={{
                  fontSize: '0.82rem',
                  color: 'var(--text-muted)',
                  marginBottom: 14,
                }}
              >
                {exercise.subtitle}
              </p>
              {exercise.activities.map((act) => (
                <div key={act.name} className="reco-activity">
                  <div className="reco-icon">{act.icon}</div>
                  <div>
                    <div className="reco-name">{act.name}</div>
                    <div className="reco-detail">{act.description}</div>
                    <div className="reco-meta">
                      {act.duration} &middot; {act.intensity}
                    </div>
                  </div>
                </div>
              ))}
              <div className="tip-box" style={{ marginTop: 14 }}>
                {exercise.tip}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
