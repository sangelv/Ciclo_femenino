import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveCycleConfig } from '../lib/supabase';

export default function Setup({ onComplete }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    last_period_date: '',
    cycle_length: 28,
    period_length: 5,
    name: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.last_period_date) return;
    setSaving(true);
    try {
      await saveCycleConfig({
        id: 'default',
        ...form,
        cycle_length: Number(form.cycle_length),
        period_length: Number(form.period_length),
      });
      onComplete?.();
      navigate('/');
    } catch (err) {
      console.error('Error saving config:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="setup-container fade-in">
      <div className="logo">🌙</div>
      <h1>Luna Cycle</h1>
      <p className="tagline">Conoce tu ciclo, potencia tu vida</p>

      <form className="setup-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Tu nombre (opcional)</label>
          <input
            type="text"
            placeholder="¿Cómo te llamas?"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Primer día de tu último periodo *</label>
          <input
            type="date"
            required
            value={form.last_period_date}
            onChange={(e) => setForm({ ...form, last_period_date: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Duración de tu ciclo (días)</label>
          <input
            type="number"
            min={20}
            max={45}
            value={form.cycle_length}
            onChange={(e) => setForm({ ...form, cycle_length: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Duración de tu periodo (días)</label>
          <input
            type="number"
            min={2}
            max={10}
            value={form.period_length}
            onChange={(e) => setForm({ ...form, period_length: e.target.value })}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Guardando...' : '✨ Comenzar'}
        </button>
      </form>
    </div>
  );
}
