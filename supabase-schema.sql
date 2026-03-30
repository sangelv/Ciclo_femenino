-- Luna Cycle — Supabase Schema
-- Ejecutar en SQL Editor de Supabase

-- Configuración del ciclo de la usuaria
CREATE TABLE IF NOT EXISTS cycle_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  name TEXT,
  last_period_date DATE NOT NULL,
  cycle_length INTEGER NOT NULL DEFAULT 28,
  period_length INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Registro diario
CREATE TABLE IF NOT EXISTS daily_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  mood TEXT,
  flow TEXT DEFAULT 'none',
  symptoms TEXT[] DEFAULT '{}',
  notes TEXT,
  energy INTEGER DEFAULT 3 CHECK (energy >= 1 AND energy <= 5),
  sleep INTEGER DEFAULT 3 CHECK (sleep >= 1 AND sleep <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para buscar registros por fecha
CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON daily_logs(date DESC);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cycle_config_updated
  BEFORE UPDATE ON cycle_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_daily_logs_updated
  BEFORE UPDATE ON daily_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security (deshabilitado por ahora, habilitar cuando agregues auth)
ALTER TABLE cycle_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;

-- Políticas temporales: acceso público (cambiar cuando agregues auth)
CREATE POLICY "Allow all on cycle_config" ON cycle_config FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on daily_logs" ON daily_logs FOR ALL USING (true) WITH CHECK (true);
