import { sourceSystems } from '../data/sources';
import { formatDateTime, isStale } from '../lib/format';
import { StatusChip } from '../components/common/StatusChip';

export function SourcesPage() {
  return (
    <div className="page">
      <div className="eyebrow">SIGMA · CONTEXT INTELLIGENCE</div>
      <div className="page-header">
        <div>
          <div className="page-title">מקורות מידע</div>
          <div className="page-subtitle">כל מקורות המידע במערכת הם Read Only. Sigma מחברת ביניהם ולא מחליפה אותם.</div>
        </div>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>מערכת</th><th>תחום</th><th>בעלים</th><th>סנכרון אחרון</th><th>גישה</th><th>פריטים מקושרים</th></tr></thead>
          <tbody>
            {sourceSystems.map(s => (
              <tr key={s.id}>
                <td style={{ fontWeight: 700, color: 'var(--ink-soft)' }}>{s.name}</td>
                <td>{s.domain}</td>
                <td>{s.owner}</td>
                <td>
                  {formatDateTime(s.lastSync)}
                  {isStale(s.lastSync, 24) && <StatusChip label="ייתכן ואינו עדכני" tone="amber" />}
                </td>
                <td><StatusChip label={s.readOnly ? 'Read Only' : 'כתיבה'} tone="blue" /></td>
                <td>{s.itemsLinked}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
