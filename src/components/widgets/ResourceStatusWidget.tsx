import { resources, getMission } from '../../data';
import { resourceAvailabilityMeta } from '../../lib/meta';
import { StatusChip } from '../common/StatusChip';
import { WidgetFrame } from '../common/WidgetFrame';

export function ResourceStatusWidget({ missionId }: { missionId?: string }) {
  const list = missionId ? resources.filter(r => r.allocatedToMissionId === missionId) : resources;

  return (
    <WidgetFrame title="סטטוס משאבים" sourceLabel="מערכת לוגיסטיקה" lastUpdated="2026-07-22T07:40:00" expandTo="/resources"
      state={list.length === 0 ? 'empty' : 'ok'}>
      {list.map(r => (
        <div className="mini-row" key={r.id}>
          <div>
            <div className="r-title">{r.name} {r.conflict && '⚠️'}</div>
            <div className="r-sub">
              {r.quantity} · {r.allocatedToMissionId ? getMission(r.allocatedToMissionId)?.name : 'לא מוקצה'}
              {!r.ownerId && ' · ללא Owner'}
            </div>
          </div>
          <StatusChip label={resourceAvailabilityMeta[r.availability].label} tone={resourceAvailabilityMeta[r.availability].tone} />
        </div>
      ))}
    </WidgetFrame>
  );
}
