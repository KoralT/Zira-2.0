import { riskMeta } from '../../lib/meta';
import { StatusChip } from '../common/StatusChip';
import { WidgetFrame } from '../common/WidgetFrame';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/StoreContext';

export function RiskWidget({ missionId }: { missionId?: string }) {
  const navigate = useNavigate();
  const { missions } = useStore();
  const list = missionId ? missions.filter(m => m.id === missionId) : missions.filter(m => m.riskLevel !== 'low');

  return (
    <WidgetFrame title="סיכון" sourceLabel="Sigma Context Platform" expandTo="/portfolio" state={list.length === 0 ? 'empty' : 'ok'}>
      {list.map(m => (
        <div className="mini-row" key={m.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/portfolio/${m.id}`)}>
          <div>
            <div className="r-title">{m.name}</div>
            <div className="r-sub">{m.blockersCount} חסמים · {m.atRiskResourcesCount} משאבים בסיכון</div>
          </div>
          <StatusChip label={riskMeta[m.riskLevel].label} tone={riskMeta[m.riskLevel].tone} />
        </div>
      ))}
    </WidgetFrame>
  );
}
