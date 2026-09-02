import { useNavigate } from 'react-router-dom';
import { getUser } from '../../data';
import { missionStatusMeta, riskMeta } from '../../lib/meta';
import { StatusChip } from '../common/StatusChip';
import { WidgetFrame } from '../common/WidgetFrame';
import { useFilters } from '../../store/FiltersContext';
import { useStore } from '../../store/StoreContext';

export function MissionPortfolioWidget({ missionId }: { missionId?: string } = {}) {
  const navigate = useNavigate();
  const { sector } = useFilters();
  const { missions } = useStore();
  const list = missionId
    ? missions.filter(m => m.id === missionId)
    : missions.filter(m => sector === 'all' || m.sector === sector);

  return (
    <WidgetFrame title={missionId ? 'מצב מבצע' : 'תמונת מבצעים'} sourceLabel="גאנטאיט" lastUpdated="2026-07-22T07:40:00" expandTo="/portfolio"
      state={list.length === 0 ? 'empty' : 'ok'}>
      {list.map(m => (
        <div className="mini-row" key={m.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/portfolio/${m.id}`)}>
          <div>
            <div className="r-title">{m.name}</div>
            <div className="r-sub">{getUser(m.ownerId)?.roleLabel} · מוכנות {m.readiness}%</div>
          </div>
          <div className="flex gap-6">
            <StatusChip label={missionStatusMeta[m.status].label} tone={missionStatusMeta[m.status].tone} />
            {m.riskLevel !== 'low' && <StatusChip label={riskMeta[m.riskLevel].label} tone={riskMeta[m.riskLevel].tone} dot={false} />}
          </div>
        </div>
      ))}
    </WidgetFrame>
  );
}
