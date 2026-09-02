import { useStore } from '../../store/StoreContext';
import { formatDateTime } from '../../lib/format';

export function OperationalBrief() {
  const { alerts, timelineEvents, approvals, missions } = useStore();
  const last24h = timelineEvents.filter(t => new Date(t.timestamp).getTime() > new Date('2026-07-21T09:00:00').getTime()).slice(0, 5);
  const topUrgent = alerts
    .filter(a => a.status === 'new' || a.status === 'read')
    .sort(a => (a.urgency === 'critical' ? -1 : 1))
    .slice(0, 3);
  const pendingApprovals = approvals.filter(a => a.status === 'pending');
  const keyRisks = missions.filter(m => m.riskLevel === 'high');
  const criticalEvents = alerts.filter(a => a.urgency === 'critical');

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="card-title">Operational Brief — תקציר 24 שעות</div>
      <div className="grid grid-2 mt-14">
        <div>
          <div className="section-title" style={{ fontSize: 14 }}>מה השתנה ב-24 השעות האחרונות</div>
          {last24h.map(e => <div key={e.id} className="mini-row"><span className="r-title" style={{ fontWeight: 500 }}>{e.description}</span><span className="r-sub">{formatDateTime(e.timestamp)}</span></div>)}
        </div>
        <div>
          <div className="section-title" style={{ fontSize: 14 }}>שלושת הנושאים הדחופים ביותר</div>
          {topUrgent.map(a => <div key={a.id} className="mini-row"><span className="r-title">{a.title}</span></div>)}
        </div>
      </div>
      <div className="grid grid-3 mt-14">
        <div>
          <div className="small muted" style={{ fontWeight: 700, marginBottom: 4 }}>החלטות שממתינות</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink-soft)' }}>{pendingApprovals.length}</div>
        </div>
        <div>
          <div className="small muted" style={{ fontWeight: 700, marginBottom: 4 }}>סיכונים מרכזיים</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink-soft)' }}>{keyRisks.length} מבצעים</div>
        </div>
        <div>
          <div className="small muted" style={{ fontWeight: 700, marginBottom: 4 }}>אירועים קריטיים</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink-soft)' }}>{criticalEvents.length}</div>
        </div>
      </div>
    </div>
  );
}
