import { useStore } from '../store/StoreContext';
import { formatDateTime } from '../lib/format';

const TYPE_LABEL: Record<string, string> = {
  event: 'אירוע', 'status-change': 'שינוי סטטוס', directive: 'הנחיה', approval: 'אישור', anomaly: 'חריגה', decision: 'החלטה',
};

export function TimelinePage() {
  const { timelineEvents } = useStore();
  const sorted = timelineEvents.slice().sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));

  return (
    <div className="page">
      <div className="eyebrow">SIGMA · OPERATIONAL TIMELINE</div>
      <div className="page-header">
        <div>
          <div className="page-title">Operational Timeline</div>
          <div className="page-subtitle">אירועים, שינויי סטטוס, הנחיות, אישורים, חריגות והחלטות — לאורך כל הגזרה.</div>
        </div>
      </div>
      <div className="card">
        {sorted.map(t => (
          <div className="mini-row" key={t.id}>
            <div>
              <div className="r-title" style={{ fontWeight: 500 }}>{t.description}</div>
              <div className="r-sub">{TYPE_LABEL[t.type] ?? t.type} · {t.relatedEntity.label}</div>
            </div>
            <span className="r-sub">{formatDateTime(t.timestamp)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
