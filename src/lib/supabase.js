import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// --- Daily Log ---
export async function saveDailyLog(log) {
  if (!supabase) return saveLocal('daily_logs', log);
  const { data, error } = await supabase
    .from('daily_logs')
    .upsert(log, { onConflict: 'date' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getDailyLogs() {
  if (!supabase) return getLocal('daily_logs');
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getDailyLog(date) {
  if (!supabase) {
    const logs = getLocal('daily_logs');
    return logs.find(l => l.date === date) || null;
  }
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('date', date)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// --- Cycle Config ---
export async function saveCycleConfig(config) {
  if (!supabase) {
    localStorage.setItem('cycle_config', JSON.stringify(config));
    return config;
  }
  const { data, error } = await supabase
    .from('cycle_config')
    .upsert(config, { onConflict: 'id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getCycleConfig() {
  if (!supabase) {
    const stored = localStorage.getItem('cycle_config');
    return stored ? JSON.parse(stored) : null;
  }
  const { data, error } = await supabase
    .from('cycle_config')
    .select('*')
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// --- Local fallback helpers ---
function saveLocal(key, item) {
  const items = getLocal(key);
  const idx = items.findIndex(i => i.date === item.date);
  if (idx >= 0) items[idx] = { ...items[idx], ...item };
  else items.push(item);
  localStorage.setItem(key, JSON.stringify(items));
  return item;
}

function getLocal(key) {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];
}
