import { useStore } from '../store/StoreContext';
import { users } from '../data';

export function SettingsPage() {
  const { currentUserId, setCurrentUserId, resetDemo } = useStore();

  return (
    <div className="page">
      <div className="eyebrow">SIGMA · SETTINGS</div>
      <div className="page-header">
        <div>
          <div className="page-title">הגדרות</div>
          <div className="page-subtitle">הגדרות תצוגה עבור ה-Prototype.</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title">זהות פעילה</div>
        <p className="small muted mt-8" style={{ marginBottom: 12 }}>
          Sigma מציגה את אותה מציאות מבצעית לכולם — אך כל תפקיד רואה אותה בהקשר, בעדיפות ובפעולה הרלוונטית אליו.
          בחר/י דרך איזה תפקיד להציג את המוצר.
        </p>
        <div className="grid grid-3">
          {users.map(u => (
            <div key={u.id} className={`card ${u.id === currentUserId ? 'hl' : ''}`} style={{ cursor: 'pointer', border: u.id === currentUserId ? '2px solid var(--blue)' : undefined }} onClick={() => setCurrentUserId(u.id)}>
              <div className="identity-avatar" style={{ marginBottom: 8 }}>{u.initials}</div>
              <div style={{ fontWeight: 700 }}>{u.name}</div>
              <div className="small muted">{u.roleLabel} · {u.unit}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">איפוס נתוני דמו</div>
        <p className="small muted mt-8" style={{ marginBottom: 12 }}>מחזיר את כל הנתונים (משימות, אישורים, הנחיות, הערכות מצב) למצב ההתחלתי.</p>
        <button className="btn btn-danger" onClick={() => { if (confirm('לאפס את כל נתוני הדמו?')) resetDemo(); }}>אפס נתוני דמו</button>
      </div>
    </div>
  );
}
