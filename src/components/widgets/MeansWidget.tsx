import { useNavigate } from 'react-router-dom';
import { meansForMission, getMission } from '../../data';
import { meansStatusMeta } from '../../lib/meta';
import { StatusChip } from '../common/StatusChip';
import { WidgetFrame } from '../common/WidgetFrame';

// הקצאת אמצעים — קורא מהדומיין החי. קליק פותח את המבצע המקושר.
export function MeansWidget({ missionId }: { missionId?: string }) {
  const navigate = useNavigate();
  const items = meansForMission(missionId);

  return (
    <WidgetFrame title="הקצאת אמצעים" sourceLabel="מערכת אש + מערכת איסוף" lastUpdated="2026-07-22T06:40:00" expandTo="/resources"
      state={items.length === 0 ? 'empty' : 'ok'} emptyText="אין אמצעים מוקצים בהקשר הנבחר.">
      {items.map(m => (
        <div key={m.id} className="mini-row" style={{ cursor: m.relatedMissionId ? 'pointer' : 'default' }}
          onClick={() => m.relatedMissionId && navigate(`/portfolio/${m.relatedMissionId}`)}>
          <div>
            <div className="r-title">{m.name}</div>
            <div className="r-sub">{m.typeLabel}{m.relatedMissionId ? ` · ${getMission(m.relatedMissionId)?.name}` : ''}</div>
          </div>
          <StatusChip label={meansStatusMeta[m.status].label} tone={meansStatusMeta[m.status].tone} />
        </div>
      ))}
    </WidgetFrame>
  );
}
