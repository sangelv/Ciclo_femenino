import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { getCycleConfig } from './lib/supabase';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import Nutrition from './pages/Nutrition';
import Exercise from './pages/Exercise';
import Lunar from './pages/Lunar';
import Setup from './pages/Setup';

/* Minimal line icons as inline SVG */
const Icon = ({ d, size = 20, stroke = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const NAV_ITEMS = [
  {
    to: '/',
    label: 'Inicio',
    // house outline
    icon: 'M3 12l9-8 9 8M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10',
    end: true,
  },
  {
    to: '/register',
    label: 'Registro',
    // edit/pencil
    icon: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
  },
  {
    to: '/nutrition',
    label: 'Nutrición',
    // leaf
    icon: 'M17 8C8 10 5.9 16.17 3.82 21.34M17 8A5 5 0 003 12M17 8l4-4M3 12l-1 1',
  },
  {
    to: '/exercise',
    label: 'Ejercicio',
    // activity/pulse
    icon: 'M22 12h-4l-3 9L9 3l-3 9H2',
  },
  {
    to: '/lunar',
    label: 'Luna',
    // moon crescent
    icon: 'M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z',
  },
];

function BottomNav() {
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          end={item.end}
        >
          <span className="icon">
            <Icon d={item.icon} size={20} />
          </span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

function AppLayout({ children }) {
  return (
    <>
      <div className="app-container">{children}</div>
      <BottomNav />
    </>
  );
}

export default function App() {
  const [hasConfig, setHasConfig] = useState(null);

  useEffect(() => {
    getCycleConfig().then((config) => {
      setHasConfig(!!config);
    });
  }, []);

  if (hasConfig === null) {
    return (
      <div className="setup-container">
        <div style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 700 }}>Luna Cycle</div>
        <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Cargando...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/setup"
          element={hasConfig ? <Navigate to="/" /> : <Setup onComplete={() => setHasConfig(true)} />}
        />
        <Route
          path="/"
          element={
            !hasConfig ? (
              <Navigate to="/setup" />
            ) : (
              <AppLayout><Dashboard /></AppLayout>
            )
          }
        />
        <Route
          path="/register"
          element={
            !hasConfig ? <Navigate to="/setup" /> : <AppLayout><Register /></AppLayout>
          }
        />
        <Route
          path="/nutrition"
          element={
            !hasConfig ? <Navigate to="/setup" /> : <AppLayout><Nutrition /></AppLayout>
          }
        />
        <Route
          path="/exercise"
          element={
            !hasConfig ? <Navigate to="/setup" /> : <AppLayout><Exercise /></AppLayout>
          }
        />
        <Route
          path="/lunar"
          element={
            !hasConfig ? <Navigate to="/setup" /> : <AppLayout><Lunar /></AppLayout>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
