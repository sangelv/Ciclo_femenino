import { useEffect, useState } from 'react';
import { getCycleConfig } from '../lib/supabase';
import {
  getCurrentPhase,
  getMoonPhase,
  getLunarCalendar,
  getSyncEvaluation,
  MOON_PHASES,
} from '../lib/cycleLogic';

export default function Lunar() {
  const [moon, setMoon] = useState(null);
  const [calendar, setCalendar] = useState([]);
  const [phase, setPhase] = useState(null);
  const [sync, setSync] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  useEffect(() => {
    const m = getMoonPhase();
    setMoon(m);
    loadSync();
  }, []);

  useEffect(() => {
    setCalendar(getLunarCalendar(currentMonth.year, currentMonth.month));
  }, [currentMonth]);

  async function loadSync() {
    const config = await getCycleConfig();
    if (config) {
      const p = getCurrentPhase(config.last_period_date, config.cycle_length);
      setPhase(p);
      const m = getMoonPhase();
      if (p) setSync(getSyncEvaluation(p.key, m.name));
    }
  }

  const today = new Date().getDate();
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const isCurrentMonth = currentMonth.year === thisYear && currentMonth.month === thisMonth;

  const monthName = new Date(currentMonth.year, currentMonth.month).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  const firstDayOfWeek = new Date(currentMonth.year, currentMonth.month, 1).getDay();
  const blanks = (firstDayOfWeek + 6) % 7; // Monday start

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Ciclo Lunar</h1>
        <p>La luna como espejo de tu ciclo</p>
      </div>

      {moon && (
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 8 }}>{moon.emoji}</div>
          <h3 style={{ marginBottom: 4 }}>{moon.name}</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 8 }}>
            Día {moon.dayOfLunarCycle} del ciclo lunar · {moon.illumination}% iluminada
          </p>
          <p>{moon.description}</p>
          <p style={{ marginTop: 8, fontSize: '0.85rem', color: 'var(--text-light)' }}>
            Arquetipo: {moon.archetype}
          </p>
        </div>
      )}

      {sync && (
        <div className={`card sync-indicator ${sync.level}`}>
          <div className="sync-level">
            {sync.level === 'alta' ? '✨ Sincronía alta' : sync.level === 'media' ? '🌿 Sincronía media' : '🌀 Energías complementarias'}
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>{sync.message}</p>
          {phase && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 8 }}>
              Tu fase: {phase.emoji} {phase.name} &nbsp;·&nbsp; Luna: {moon?.emoji} {moon?.name}
            </p>
          )}
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <button
            className="btn-ghost"
            onClick={() => {
              const m = currentMonth.month === 0 ? 11 : currentMonth.month - 1;
              const y = currentMonth.month === 0 ? currentMonth.year - 1 : currentMonth.year;
              setCurrentMonth({ year: y, month: m });
            }}
            style={{ padding: '4px 12px', fontSize: '1.2rem' }}
          >
            ‹
          </button>
          <h3 style={{ textTransform: 'capitalize' }}>{monthName}</h3>
          <button
            className="btn-ghost"
            onClick={() => {
              const m = currentMonth.month === 11 ? 0 : currentMonth.month + 1;
              const y = currentMonth.month === 11 ? currentMonth.year + 1 : currentMonth.year;
              setCurrentMonth({ year: y, month: m });
            }}
            style={{ padding: '4px 12px', fontSize: '1.2rem' }}
          >
            ›
          </button>
        </div>

        <div className="moon-calendar">
          {['L', 'M', 'Mi', 'J', 'V', 'S', 'D'].map((d) => (
            <div key={d} style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, padding: '4px 0' }}>
              {d}
            </div>
          ))}
          {Array.from({ length: blanks }).map((_, i) => (
            <div key={`blank-${i}`} />
          ))}
          {calendar.map((day) => (
            <div
              key={day.day}
              className={`moon-day ${isCurrentMonth && day.day === today ? 'today' : ''}`}
              title={`${day.moon.name} - ${day.moon.illumination}%`}
            >
              <span className="moon-emoji">{day.moon.emoji}</span>
              <span className="moon-num">{day.day}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>Las 8 fases lunares</h3>
        <div className="item-list" style={{ marginTop: 12 }}>
          {MOON_PHASES.map((mp, i) => (
            <div className="item-row" key={i}>
              <span className="item-icon">{mp.emoji}</span>
              <div className="item-info">
                <h4>{mp.name}</h4>
                <p>{mp.description}</p>
                <p className="item-meta">Arquetipo: {mp.archetype}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
