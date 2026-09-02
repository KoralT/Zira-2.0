import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/StoreContext';
import { getUser } from '../data';
import { directiveStatusMeta } from '../lib/meta';
import { StatusChip } from '../components/common/StatusChip';
import { formatDate } from '../lib/format';

export function DirectivesListPage() {
  const { directives, tasks } = useStore();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'all' | 'draft' | 'published' | 'cancelled' | 'superseded'>('all');

  const list = directives.filter(d => status === 'all' || d.status === status);

  return (
    <div className="page">
      <div className="eyebrow">SIGMA · COMMANDER DIRECTIVES</div>
      <div className="page-header">
        <div>
          <div className="page-title">הנחיות מפקד</div>
          <div className="page-subtitle">מה פורסם, מי הושפע, ומה צריך לקרות עכשיו.</div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/directives/new')}>+ צור הנחיה חדשה</button>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <select className="select-field" value={status} onChange={e => setStatus(e.target.value as typeof status)}>
          <option value="all">כל הסטטוסים</option>
          <option value="draft">טיוטה</option>
          <option value="published">פורסם</option>
          <option value="cancelled">בוטל</option>
          <option value="superseded">הוחלף</option>
        </select>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>כותרת</th><th>מי פרסם</th><th>סטטוס</th><th>תאריך פרסום</th><th>תוקף</th>
              <th>קהל יעד</th><th>קראו</th><th>טרם קראו</th><th>מבצעים מושפעים</th><th>פעולות שנוצרו</th>
            </tr>
          </thead>
          <tbody>
            {list.map(d => (
              <tr key={d.id} className="clickable" onClick={() => navigate(`/directives/${d.id}`)}>
                <td style={{ fontWeight: 700, color: 'var(--ink-soft)' }}>{d.title}</td>
                <td>{getUser(d.publishedById)?.name}</td>
                <td><StatusChip label={directiveStatusMeta[d.status].label} tone={directiveStatusMeta[d.status].tone} /></td>
                <td>{formatDate(d.publishedAt)}</td>
                <td>{d.expiryDate ? formatDate(d.expiryDate) : 'ללא הגבלה'}</td>
                <td>{d.audienceUnits.length} יחידות</td>
                <td>{d.ackUserIds.length}</td>
                <td>{d.affectedUserIds.length - d.ackUserIds.length}</td>
                <td>{d.relatedMissionIds.length}</td>
                <td>{tasks.filter(t => t.sourceType === 'directive' && t.sourceId === d.id).length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
