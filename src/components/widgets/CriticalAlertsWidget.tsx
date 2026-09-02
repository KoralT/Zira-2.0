import { useStore } from '../../store/StoreContext';
import { useUi } from '../../store/UiContext';
import { alertTypeMeta, urgencyMeta } from '../../lib/meta';
import { StatusChip } from '../common/StatusChip';
import { WidgetFrame } from '../common/WidgetFrame';

export function CriticalAlertsWidget() {
  const { alerts } = useStore();
  const { openContextDrawer } = useUi();
  const list = alerts
    .filter(a => (a.status === 'new' || a.status === 'read') && (a.urgency === 'critical' || a.urgency === 'high'))
    .slice(0, 6);

  return (
    <WidgetFrame title="התראות קריטיות" sourceLabel="מנוע הקשב" expandTo="/me"
      state={list.length === 0 ? 'empty' : 'ok'} emptyText="אין התראות קריטיות פתוחות.">
      {list.map(a => (
        <div className="mini-row" key={a.id} style={{ cursor: 'pointer' }} onClick={() => openContextDrawer(a.id)}>
          <div>
            <div className="r-title">{a.title}</div>
            <div className="r-sub">{a.relatedEntity.label}</div>
          </div>
          <div className="flex gap-6">
            <StatusChip label={alertTypeMeta[a.type].label} tone={alertTypeMeta[a.type].tone} />
            <StatusChip label={urgencyMeta[a.urgency].label} tone={urgencyMeta[a.urgency].tone} dot={false} />
          </div>
        </div>
      ))}
    </WidgetFrame>
  );
}
