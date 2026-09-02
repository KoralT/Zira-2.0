import { getUser } from '../../data';
import { readinessStatusMeta } from '../../lib/meta';
import { StatusChip } from '../common/StatusChip';
import { WidgetFrame } from '../common/WidgetFrame';
import { useUi } from '../../store/UiContext';
import { useStore } from '../../store/StoreContext';

export function ReadinessWidget({ missionId }: { missionId: string }) {
  const { readinessItems, missions } = useStore();
  const items = readinessItems.filter(r => r.missionId === missionId);
  const mission = missions.find(m => m.id === missionId);
  const { openEvidenceDrawer } = useUi();

  return (
    <WidgetFrame title="מוכנות מבצע" sourceLabel="גאנטאיט + מרשמים" lastUpdated={mission?.lastUpdated} expandTo={`/portfolio/${missionId}?tab=readiness`}
      state={items.length === 0 ? 'empty' : 'ok'}>
      {items.map(i => (
        <div className="mini-row" key={i.id}>
          <div>
            <div className="r-title">{i.requirement}</div>
            <div className="r-sub">{i.categoryLabel} · {i.ownerId ? getUser(i.ownerId)?.name : 'ללא Owner'}</div>
          </div>
          <div className="flex gap-6">
            <StatusChip label={readinessStatusMeta[i.status].label} tone={readinessStatusMeta[i.status].tone} />
            {i.evidenceId && <button className="icon-btn" title="Evidence" onClick={() => openEvidenceDrawer(i.evidenceId!)}>🛡️</button>}
          </div>
        </div>
      ))}
    </WidgetFrame>
  );
}
