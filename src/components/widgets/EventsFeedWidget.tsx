import { useStore } from '../../store/StoreContext';
import { WidgetFrame } from '../common/WidgetFrame';
import { formatDateTime } from '../../lib/format';

export function EventsFeedWidget() {
  const { timelineEvents } = useStore();
  const list = timelineEvents.filter(t => t.type === 'event' || t.type === 'anomaly').slice(0, 8);

  return (
    <WidgetFrame title="פיד אירועים" sourceLabel="דיווחי שטח" expandTo="/hq/timeline" state={list.length === 0 ? 'empty' : 'ok'}>
      {list.map(e => (
        <div className="mini-row" key={e.id}>
          <div>
            <div className="r-title" style={{ fontWeight: 500 }}>{e.description}</div>
            <div className="r-sub">{e.relatedEntity.label}</div>
          </div>
          <span className="r-sub">{formatDateTime(e.timestamp)}</span>
        </div>
      ))}
    </WidgetFrame>
  );
}
