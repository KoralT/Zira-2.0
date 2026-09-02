import { useStore } from '../store/StoreContext';
import { useUi } from '../store/UiContext';
import { getUser } from '../data';
import { confidenceMeta } from '../lib/meta';
import { StatusChip } from '../components/common/StatusChip';
import { formatDateTime } from '../lib/format';

export function TrustPage() {
  const { evidence } = useStore();
  const { openEvidenceDrawer } = useUi();

  return (
    <div className="page">
      <div className="eyebrow">SIGMA · EVIDENCE & TRUST</div>
      <div className="page-header">
        <div>
          <div className="page-title">Evidence & Trust</div>
          <div className="page-subtitle">כל Insight, התראה או המלצה במערכת מחוברים למקור, לעדכניות ולרמת אמון — עם Human in the loop בכל תיקוף.</div>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>מקור</th><th>בעלים</th><th>עודכן</th><th>Confidence</th><th>סתירות</th><th>מידע חסר</th><th>סטטוס תיקוף</th><th></th></tr></thead>
          <tbody>
            {evidence.map(e => (
              <tr key={e.id} className="clickable" onClick={() => openEvidenceDrawer(e.id)}>
                <td style={{ fontWeight: 700, color: 'var(--ink-soft)' }}>{e.sourceSystem}</td>
                <td>{getUser(e.ownerUserId)?.name}</td>
                <td>{formatDateTime(e.lastUpdated)}</td>
                <td><StatusChip label={confidenceMeta[e.confidence].label} tone={confidenceMeta[e.confidence].tone} /></td>
                <td>{e.hasContradiction ? <StatusChip label="קיימת סתירה" tone="red" /> : '—'}</td>
                <td>{e.missingInfo.length > 0 ? `${e.missingInfo.length} פריטים` : '—'}</td>
                <td>{e.validationStatus ?? 'טרם תוקף'}</td>
                <td><button className="link-btn">פתח ←</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
