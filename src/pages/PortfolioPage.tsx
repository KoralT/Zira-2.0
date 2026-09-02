import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getUser } from '../data';
import { missionStatusMeta } from '../lib/meta';
import { StatusChip } from '../components/common/StatusChip';
import { formatRelative } from '../lib/format';
import { useStore } from '../store/StoreContext';

type StatusFilter = 'all' | 'planned' | 'active' | 'paused' | 'completed';

export function PortfolioPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { approvals, missions } = useStore();
  const [status, setStatus] = useState<StatusFilter>('all');
  const [owner, setOwner] = useState<string>('all');
  const [onlyRisk, setOnlyRisk] = useState(params.get('risk') === 'high');
  const [onlyApprovalPending, setOnlyApprovalPending] = useState(false);
  const [onlyGaps, setOnlyGaps] = useState(false);

  const owners = useMemo(() => Array.from(new Set(missions.map(m => m.ownerId))), []);
  const pendingApprovalsFor = (missionId: string) => approvals.filter(a => a.missionId === missionId && a.status === 'pending').length;

  const filtered = missions.filter(m =>
    (status === 'all' || m.status === status) &&
    (owner === 'all' || m.ownerId === owner) &&
    (!onlyRisk || m.riskLevel === 'high') &&
    (!onlyApprovalPending || pendingApprovalsFor(m.id) > 0) &&
    (!onlyGaps || m.atRiskResourcesCount > 0 || m.blockersCount > 0)
  );

  return (
    <div className="page">
      <div className="eyebrow">מודולים · ניהול מבצעים</div>
      <div className="page-header">
        <div>
          <div className="page-title">ניהול מבצעים</div>
          <div className="page-subtitle">מה מתקדם, מה תקוע, מה חסר, ומה ישפיע על אישור או ביצוע המשימה.</div>
        </div>
      </div>

      <div className="card mt-8" style={{ marginBottom: 16 }}>
        <div className="flex gap-10" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
          <select className="select-field" value={status} onChange={e => setStatus(e.target.value as StatusFilter)}>
            <option value="all">כל הסטטוסים</option>
            <option value="planned">בתכנון</option>
            <option value="active">פעיל</option>
            <option value="paused">מוקפא</option>
            <option value="completed">הסתיים</option>
          </select>
          <select className="select-field" value={owner} onChange={e => setOwner(e.target.value)}>
            <option value="all">כל ה-Owners</option>
            {owners.map(id => <option key={id} value={id}>{getUser(id)?.name}</option>)}
          </select>
          <label className="checkbox-row"><input type="checkbox" checked={onlyRisk} onChange={e => setOnlyRisk(e.target.checked)} /> בסיכון בלבד</label>
          <label className="checkbox-row"><input type="checkbox" checked={onlyApprovalPending} onChange={e => setOnlyApprovalPending(e.target.checked)} /> ממתינים לאישור</label>
          <label className="checkbox-row"><input type="checkbox" checked={onlyGaps} onChange={e => setOnlyGaps(e.target.checked)} /> עם מידע חסר / חסמים</label>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>שם</th><th>Owner</th><th>סטטוס</th><th>שלב</th><th>Readiness</th><th>תאריך יעד</th>
              <th>חסמים</th><th>Dependencies</th><th>Approvals</th><th>Resources בסיכון</th><th>עדכון אחרון</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => (
              <tr key={m.id} className="clickable" onClick={() => navigate(`/portfolio/${m.id}`)}>
                <td style={{ fontWeight: 700, color: 'var(--ink-soft)' }}>{m.name}</td>
                <td>{getUser(m.ownerId)?.name}</td>
                <td><StatusChip label={missionStatusMeta[m.status].label} tone={missionStatusMeta[m.status].tone} /></td>
                <td>{m.stage}</td>
                <td>
                  <div className="flex gap-6" style={{ alignItems: 'center' }}>
                    <div className="progress-track" style={{ width: 70 }}>
                      <div className="progress-fill" style={{ width: `${m.readiness}%`, background: m.readiness >= 75 ? 'var(--green)' : m.readiness >= 50 ? 'var(--amber)' : 'var(--red)' }} />
                    </div>
                    {m.readiness}%
                  </div>
                </td>
                <td>{formatRelative(m.dueDate)}</td>
                <td>{m.blockersCount}</td>
                <td>{m.dependsOnMissionIds.length + m.blockedByMissionIds.length}</td>
                <td>{pendingApprovalsFor(m.id)}</td>
                <td>{m.atRiskResourcesCount}</td>
                <td>{formatRelative(m.lastUpdated)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
