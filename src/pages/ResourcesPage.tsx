import { resources, getMission } from '../data';
import { resourceAvailabilityMeta } from '../lib/meta';
import { StatusChip } from '../components/common/StatusChip';
import { getUser } from '../data';

export function ResourcesPage() {
  return (
    <div className="page">
      <div className="eyebrow">SIGMA · RESOURCE STATUS</div>
      <div className="page-header">
        <div>
          <div className="page-title">משאבים וסד"כ</div>
          <div className="page-subtitle">זמינות, הקצאה, קונפליקטים ומשאבים ללא Owner על פני כל המבצעים.</div>
        </div>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>משאב</th><th>סוג</th><th>כמות</th><th>זמינות</th><th>מוקצה ל</th><th>Owner</th><th>קונפליקט</th><th>חלופות</th></tr></thead>
          <tbody>
            {resources.map(r => (
              <tr key={r.id}>
                <td style={{ fontWeight: 700, color: 'var(--ink-soft)' }}>{r.name}</td>
                <td>{r.type}</td>
                <td>{r.quantity}</td>
                <td><StatusChip label={resourceAvailabilityMeta[r.availability].label} tone={resourceAvailabilityMeta[r.availability].tone} /></td>
                <td>{r.allocatedToMissionId ? getMission(r.allocatedToMissionId)?.name : '—'}</td>
                <td>{r.ownerId ? getUser(r.ownerId)?.name : <StatusChip label="ללא Owner" tone="red" />}</td>
                <td>{r.conflict ? <span style={{ color: 'var(--red)' }}>{r.conflictDescription}</span> : '—'}</td>
                <td>{r.alternatives.join(', ') || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
