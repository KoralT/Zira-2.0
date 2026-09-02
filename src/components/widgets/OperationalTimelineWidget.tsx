import { useStore } from '../../store/StoreContext';
import { formatDateTime } from '../../lib/format';
import { WidgetFrame } from '../common/WidgetFrame';
import type { EntityRef, TimelineEventType } from '../../data/types';

const TYPE_LABEL: Record<TimelineEventType, string> = {
  event: 'אירוע', 'status-change': 'שינוי סטטוס', directive: 'הנחיה', approval: 'אישור', anomaly: 'חריגה', decision: 'החלטה',
};

export function OperationalTimelineWidget({ entity, limit = 8, expandTo }: { entity?: EntityRef; limit?: number; expandTo?: string }) {
  const { timelineEvents } = useStore();
  const list = (entity ? timelineEvents.filter(t => t.relatedEntity.type === entity.type && t.relatedEntity.id === entity.id) : timelineEvents)
    .slice()
    .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
    .slice(0, limit);

  return (
    <WidgetFrame title="ציר זמן מבצעי" sourceLabel="Sigma Context Platform" expandTo={expandTo}
      state={list.length === 0 ? 'empty' : 'ok'}>
      {list.map(t => (
        <div className="mini-row" key={t.id}>
          <div>
            <div className="r-title" style={{ fontWeight: 500 }}>{t.description}</div>
            <div className="r-sub">{TYPE_LABEL[t.type]} · {t.relatedEntity.label}</div>
          </div>
          <span className="r-sub">{formatDateTime(t.timestamp)}</span>
        </div>
      ))}
    </WidgetFrame>
  );
}
