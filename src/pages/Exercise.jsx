import { useEffect, useState } from 'react';
import { getCycleConfig } from '../lib/supabase';
import { getCurrentPhase, EXERCISE } from '../lib/cycleLogic';

export default function Exercise() {
  const [phase, setPhase] = useState(null);
  const [activePhase, setActivePhase] = useState(null);

  useEffect(() => {
    loadPhase();
  }, []);

  async function loadPhase() {
    const config = await getCycleConfig();
    if (config) {
      const p = getCurrentPhase(config.last_period_date, config.cycle_length);
      setPhase(p);
      setActivePhase(p?.key || 'menstrual');
    } else {
      setActivePhase('menstrual');
    }
  }

  const data = activePhase ? EXERCISE[activePhase] : null;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Ejercicio</h1>
        <p>Entrena en sintonía con tu ciclo</p>
      </div>

      <div className="chips" style={{ marginBottom: 16, justifyContent: 'center' }}>
        {['menstrual', 'follicular', 'ovulatory', 'luteal'].map((key) => (
          <button
            key={key}
            className={`chip ${activePhase === key ? 'active' : ''}`}
            onClick={() => setActivePhase(key)}
          >
            {key === 'menstrual' && '🩸'}
            {key === 'follicular' && '🌱'}
            {key === 'ovulatory' && '🌕'}
            {key === 'luteal' && '🍂'}
            {' '}
            {key === 'menstrual' ? 'Menstrual' : key === 'follicular' ? 'Folicular' : key === 'ovulatory' ? 'Ovulatoria' : 'Lútea'}
            {phase?.key === key ? ' ←' : ''}
          </button>
        ))}
      </div>

      {data && (
        <>
          <div className="card">
            <h3>{data.title}</h3>
            <p style={{ marginBottom: 16 }}>{data.subtitle}</p>

            <div className="item-list">
              {data.activities.map((act, i) => (
                <div className="item-row" key={i}>
                  <span className="item-icon">{act.icon}</span>
                  <div className="item-info">
                    <h4>{act.name}</h4>
                    <p>{act.description}</p>
                    <div className="item-meta">
                      ⏱ {act.duration} &nbsp;·&nbsp; 📊 {act.intensity}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="tip-box">{data.tip}</div>
        </>
      )}
    </div>
  );
}
