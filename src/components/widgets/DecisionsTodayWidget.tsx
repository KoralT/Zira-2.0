import { useNavigate } from 'react-router-dom';
import { getMission, getUser } from '../../data';
import { useStore } from '../../store/StoreContext';
import { useUi } from '../../store/UiContext';
import { StatusChip } from '../common/StatusChip';
import { WidgetFrame } from '../common/WidgetFrame';
import { formatRelative } from '../../lib/format';

// החלטות נדרשות היום — נגזר מאישורים ממתינים + התראות סיכון/דדליין ב-Store החי.
export function DecisionsTodayWidget({ missionId }: { missionId?: string }) {
  const navigate = useNavigate();
  const { approvals, alerts } = useStore();
  const { openContextDrawer } = useUi();

  const pendingApprovals = approvals.filter(a => a.status === 'pending' && (!missionId || a.missionId === missionId));
  const deadlineAlerts = alerts.filter(a => a.type === 'risk-deadline' && (a.status === 'new' || a.status === 'read')
    && (!missionId || (a.relatedEntity.type === 'mission' && a.relatedEntity.id === missionId)));

  const empty = pendingApprovals.length === 0 && deadlineAlerts.length === 0;

  return (
    <WidgetFrame title="החלטות נדרשות היום" sourceLabel="Sigma Context Platform" expandTo="/portfolio"
      state={empty ? 'empty' : 'ok'} emptyText="אין החלטות פתוחות לגזרה הנבחרת.">
      {pendingApprovals.map(a => (
        <div key={a.id} className="mini-row" style={{ cursor: 'pointer' }} onClick={() => a.missionId && navigate(`/portfolio/${a.missionId}?tab=approvals`)}>
          <div>
            <div className="r-title">{a.title}</div>
            <div className="r-sub">{getUser(a.requiredFromUserId)?.name}{a.missionId ? ` · ${getMission(a.missionId)?.name}` : ''}</div>
          </div>
          <StatusChip label="אישור" tone="amber" />
        </div>
      ))}
      {deadlineAlerts.map(a => (
        <div key={a.id} className="mini-row" style={{ cursor: 'pointer' }} onClick={() => openContextDrawer(a.id)}>
          <div>
            <div className="r-title">{a.title}</div>
            <div className="r-sub">זוהה {formatRelative(a.detectedAt)}</div>
          </div>
          <StatusChip label="דדליין" tone="red" />
        </div>
      ))}
    </WidgetFrame>
  );
}
