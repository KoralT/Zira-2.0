import { NavLink } from 'react-router-dom';

// Prototype navigation for the approved Zira product map. Three groups: the personal experience
// (בשבילי), the shared command environment (מרחב המפקדה), and the workflow modules (מודולים).
// Cross-cutting capabilities — Directives, Evidence/Trust, Knowledge, Timeline, Sources, Resources,
// Operational Map — are consumed IN CONTEXT and are intentionally NOT primary navigation. Module
// packaging is not final; these are product territories, not a claim of finalized modules.
const personal = [{ to: '/me', label: 'בשבילי', icon: '👤', end: true }];
const command = [
  { to: '/hq', label: 'תמונת מצב', icon: '🗺️' },
  { to: '/situation-assessment', label: 'הערכת מצב', icon: '🧭' },
];
const modules = [
  { to: '/portfolio', label: 'ניהול מבצעים', icon: '📋' },
  { to: '/events', label: 'ניהול אירועים / לחימה', icon: '⚡' },
];
const utility = [{ to: '/settings', label: 'הגדרות', icon: '⚙️' }];

export function Sidebar() {
  const renderItem = (item: { to: string; label: string; icon: string; end?: boolean }) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.end}
      className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
    >
      <span>{item.icon} {item.label}</span>
    </NavLink>
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        Sigma
        <small>שכבת הפעלה מבצעית · זירה</small>
      </div>
      <nav className="sidebar-nav">
        {personal.map(renderItem)}

        <div className="sidebar-section-label">מרחב המפקדה</div>
        {command.map(renderItem)}

        <div className="sidebar-section-label">מודולים</div>
        {modules.map(renderItem)}

        <div className="sidebar-section-label">כללי</div>
        {utility.map(renderItem)}
      </nav>
    </aside>
  );
}
