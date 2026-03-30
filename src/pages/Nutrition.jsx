import { useEffect, useState } from 'react';
import { getCycleConfig } from '../lib/supabase';
import { getCurrentPhase, NUTRITION } from '../lib/cycleLogic';

export default function Nutrition() {
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

  const data = activePhase ? NUTRITION[activePhase] : null;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Nutrición</h1>
        <p>Alimenta tu cuerpo según tu fase</p>
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
              {data.foods.map((food, i) => (
                <div className="item-row" key={i}>
                  <span className="item-icon">{food.icon}</span>
                  <div className="item-info">
                    <h4>{food.name}</h4>
                    <p>{food.benefit}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3>🚫 Mejor evitar</h3>
            <div className="avoid-list">
              {data.avoid.map((item, i) => (
                <span className="avoid-tag" key={i}>{item}</span>
              ))}
            </div>
          </div>

          <div className="tip-box">{data.tip}</div>
        </>
      )}
    </div>
  );
}
