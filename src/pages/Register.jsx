import { useState, useEffect } from 'react';
import { saveDailyLog, getDailyLog, checkAndUpdatePeriodStart } from '../lib/supabase';

const MOODS = [
  { value: 'feliz', label: '😊 Feliz' },
  { value: 'tranquila', label: '😌 Tranquila' },
  { value: 'energetica', label: '⚡ Energética' },
  { value: 'sensible', label: '🥺 Sensible' },
  { value: 'irritable', label: '😤 Irritable' },
  { value: 'triste', label: '😢 Triste' },
  { value: 'ansiosa', label: '😰 Ansiosa' },
  { value: 'cansada', label: '😴 Cansada' },
];

const SYMPTOMS = [
  'Cólicos', 'Dolor de cabeza', 'Hinchazón', 'Dolor de espalda',
  'Sensibilidad en senos', 'Acné', 'Náuseas', 'Insomnio',
  'Fatiga', 'Antojos', 'Dolor articular', 'Migraña',
];

const FLOWS = [
  { value: 'none', label: 'Sin flujo', icon: '⚪' },
  { value: 'spotting', label: 'Manchado', icon: '🟡' },
  { value: 'light', label: 'Ligero', icon: '🟠' },
  { value: 'medium', label: 'Moderado', icon: '🔴' },
  { value: 'heavy', label: 'Abundante', icon: '🟣' },
];

export default function Register() {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [mood, setMood] = useState('');
  const [flow, setFlow] = useState('none');
  const [symptoms, setSymptoms] = useState([]);
  const [notes, setNotes] = useState('');
  const [energy, setEnergy] = useState(3);
  const [sleep, setSleep] = useState(3);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadExisting(date);
  }, [date]);

  async function loadExisting(d) {
    const existing = await getDailyLog(d);
    if (existing) {
      setMood(existing.mood || '');
      setFlow(existing.flow || 'none');
      setSymptoms(existing.symptoms || []);
      setNotes(existing.notes || '');
      setEnergy(existing.energy || 3);
      setSleep(existing.sleep || 3);
    } else {
      setMood('');
      setFlow('none');
      setSymptoms([]);
      setNotes('');
      setEnergy(3);
      setSleep(3);
    }
    setSaved(false);
  }

  function toggleSymptom(s) {
    setSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
    setSaved(false);
  }

  const [periodDetected, setPeriodDetected] = useState(false);

  async function handleSave() {
    setLoading(true);
    setPeriodDetected(false);
    try {
      await saveDailyLog({ date, mood, flow, symptoms, notes, energy, sleep });

      // Check if this log marks a new period start
      const isNewPeriod = await checkAndUpdatePeriodStart(date, flow);
      if (isNewPeriod) {
        setPeriodDetected(true);
        setTimeout(() => setPeriodDetected(false), 4000);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Error saving:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Registro Diario</h1>
        <p>¿Cómo te sientes hoy?</p>
      </div>

      <div className="card">
        <div className="form-group">
          <label>Fecha</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} max={today} />
        </div>
      </div>

      <div className="card">
        <h3>😊 Estado de ánimo</h3>
        <div className="chips" style={{ marginTop: 10 }}>
          {MOODS.map((m) => (
            <button
              key={m.value}
              className={`chip ${mood === m.value ? 'active' : ''}`}
              onClick={() => { setMood(m.value); setSaved(false); }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>🩸 Flujo menstrual</h3>
        <div className="chips" style={{ marginTop: 10 }}>
          {FLOWS.map((f) => (
            <button
              key={f.value}
              className={`chip ${flow === f.value ? 'active' : ''}`}
              onClick={() => { setFlow(f.value); setSaved(false); }}
            >
              {f.icon} {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>🤒 Síntomas</h3>
        <div className="chips" style={{ marginTop: 10 }}>
          {SYMPTOMS.map((s) => (
            <button
              key={s}
              className={`chip ${symptoms.includes(s) ? 'active' : ''}`}
              onClick={() => toggleSymptom(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>⚡ Nivel de energía</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Baja</span>
          <input
            type="range"
            min={1}
            max={5}
            value={energy}
            onChange={(e) => { setEnergy(Number(e.target.value)); setSaved(false); }}
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Alta</span>
          <span style={{ fontWeight: 600, minWidth: 24, textAlign: 'center' }}>{energy}</span>
        </div>
      </div>

      <div className="card">
        <h3>😴 Calidad de sueño</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Mala</span>
          <input
            type="range"
            min={1}
            max={5}
            value={sleep}
            onChange={(e) => { setSleep(Number(e.target.value)); setSaved(false); }}
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Excelente</span>
          <span style={{ fontWeight: 600, minWidth: 24, textAlign: 'center' }}>{sleep}</span>
        </div>
      </div>

      <div className="card">
        <h3>📝 Notas</h3>
        <div className="form-group" style={{ marginTop: 10, marginBottom: 0 }}>
          <textarea
            placeholder="¿Algo más que quieras registrar?"
            value={notes}
            onChange={(e) => { setNotes(e.target.value); setSaved(false); }}
          />
        </div>
      </div>

      {periodDetected && (
        <div className="card" style={{ background: 'var(--menstrual-bg)', borderLeft: '4px solid var(--menstrual)', marginTop: 8 }}>
          <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--menstrual)' }}>
            Nuevo ciclo detectado
          </p>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-light)', marginTop: 4 }}>
            Tu calendario y fases se actualizaron a partir del {new Date(date + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}.
          </p>
        </div>
      )}

      <button className="btn btn-primary" onClick={handleSave} disabled={loading} style={{ marginTop: 8 }}>
        {loading ? 'Guardando...' : saved ? 'Guardado' : 'Guardar registro'}
      </button>
    </div>
  );
}
