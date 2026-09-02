import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/StoreContext';
import { useFilters, type SectorFilter, type TimeWindow } from '../../store/FiltersContext';
import { useUi } from '../../store/UiContext';
import { users, getUser } from '../../data';
import { formatRelative } from '../../lib/format';

export function Header() {
  const { currentUserId, setCurrentUserId, alerts, directives, missions } = useStore();
  const { timeWindow, setTimeWindow, sector, setSector } = useFilters();
  const { openContextDrawer } = useUi();
  const navigate = useNavigate();
  const [identityOpen, setIdentityOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [query, setQuery] = useState('');

  const currentUser = getUser(currentUserId)!;
  const myNewAlerts = alerts.filter(a => a.status === 'new' && a.assignedToUserId === currentUserId);
  const topAlerts = myNewAlerts.slice(0, 3);

  const runSearch = () => {
    const q = query.trim();
    if (!q) return;
    const mission = missions.find(m => m.name.includes(q));
    if (mission) { navigate(`/portfolio/${mission.id}`); setQuery(''); return; }
    const directive = directives.find(d => d.title.includes(q));
    if (directive) { navigate(`/directives/${directive.id}`); setQuery(''); return; }
    navigate(`/knowledge?q=${encodeURIComponent(q)}`);
    setQuery('');
  };

  return (
    <header className="header">
      <div className="header-left">
        <div className="header-search">
          <span>🔎</span>
          <input
            placeholder="חיפוש מבצעים, הנחיות, ידע..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && runSearch()}
          />
        </div>
        <select className="select-field" value={timeWindow} onChange={e => setTimeWindow(e.target.value as TimeWindow)}>
          <option value="24h">חלון זמן: 24 שעות</option>
          <option value="7d">חלון זמן: 7 ימים</option>
          <option value="30d">חלון זמן: 30 ימים</option>
        </select>
        <select className="select-field" value={sector} onChange={e => setSector(e.target.value as SectorFilter)}>
          <option value="all">כל הגזרות</option>
          <option value="צפון">גזרה צפונית</option>
          <option value="מזרח">גזרה מזרחית</option>
          <option value="מרכז">גזרה מרכזית</option>
          <option value="דרום">גזרה דרומית</option>
        </select>
      </div>

      <div className="header-right">
        <div style={{ position: 'relative' }}>
          <button className="bell-btn" onClick={() => setBellOpen(v => !v)}>
            🔔
            {myNewAlerts.length > 0 && <span className="bell-badge">{myNewAlerts.length}</span>}
          </button>
          {bellOpen && (
            <div className="identity-dropdown" style={{ width: 300 }}>
              {topAlerts.length === 0 && <div className="identity-option muted">אין התראות חדשות</div>}
              {topAlerts.map(a => (
                <div key={a.id} className="identity-option" onClick={() => { openContextDrawer(a.id); setBellOpen(false); }}>
                  <div style={{ fontWeight: 700, fontSize: 12.5 }}>{a.title}</div>
                  <div className="small muted">{formatRelative(a.detectedAt)}</div>
                </div>
              ))}
              <div className="identity-option" style={{ textAlign: 'center', color: 'var(--blue)', fontWeight: 700 }} onClick={() => { navigate('/me'); setBellOpen(false); }}>
                לכל ההתראות ←
              </div>
            </div>
          )}
        </div>

        <div className="identity-box" onClick={() => setIdentityOpen(v => !v)} style={{ cursor: 'pointer' }}>
          <div className="identity-avatar">{currentUser.initials}</div>
          <div className="identity-meta">
            <div className="identity-name">{currentUser.name}</div>
            <div className="identity-role">{currentUser.roleLabel}</div>
          </div>
          <span className="muted">▾</span>
          {identityOpen && (
            <div className="identity-dropdown">
              <div className="small muted" style={{ padding: '4px 10px 8px' }}>הצג את המוצר כ...</div>
              {users.map(u => (
                <div
                  key={u.id}
                  className={`identity-option${u.id === currentUserId ? ' active' : ''}`}
                  onClick={() => { setCurrentUserId(u.id); setIdentityOpen(false); }}
                >
                  <div style={{ fontWeight: 700 }}>{u.name}</div>
                  <div className="small muted">{u.roleLabel} · {u.unit}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
