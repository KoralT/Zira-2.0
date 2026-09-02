import { useNavigate } from 'react-router-dom';
import { getMission, getUser } from '../../data';
import { useStore } from '../../store/StoreContext';
import { StatusChip } from '../common/StatusChip';
import { WidgetFrame } from '../common/WidgetFrame';

// חוסמים קריטיים — נגזר מדרישות מוכנות חסומות ב-Store החי. קליק פותח את דרישת המוכנות במבצע.
export function BlockersWidget({ missionId }: { missionId?: string }) {
  const navigate = useNavigate();
  const { readinessItems } = useStore();
  const list = readinessItems
    .filter(r => r.status === 'missing' && (!missionId || r.missionId === missionId))
    .slice(0, 8);

  return (
    <WidgetFrame title="חוסמים קריטיים" sourceLabel="גאנטאיט + מרשמים" expandTo="/portfolio"
      state={list.length === 0 ? 'empty' : 'ok'} emptyText="אין חוסמים קריטיים בהקשר הנבחר.">
      {list.map(r => (
        <div key={r.id} className="mini-row" style={{ cursor: 'pointer' }} onClick={() => navigate(`/portfolio/${r.missionId}?tab=readiness`)}>
          <div>
            <div className="r-title">{r.requirement}</div>
            <div className="r-sub">{getMission(r.missionId)?.name} · {r.ownerId ? getUser(r.ownerId)?.name : 'ללא Owner'}</div>
          </div>
          <StatusChip label="חסום" tone="red" />
        </div>
      ))}
    </WidgetFrame>
  );
}
