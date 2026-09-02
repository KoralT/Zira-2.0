import { getUser, getMission } from '../../data';
import { approvalStatusMeta, riskMeta } from '../../lib/meta';
import { StatusChip } from '../common/StatusChip';
import { WidgetFrame } from '../common/WidgetFrame';
import { formatRelative } from '../../lib/format';
import { useStore } from '../../store/StoreContext';
import { useToast } from '../../store/ToastContext';

export function ApprovalWidget({ missionId }: { missionId?: string }) {
  const { approvals, updateApprovalStatus } = useStore();
  const { showToast } = useToast();
  const list = missionId ? approvals.filter(a => a.missionId === missionId) : approvals.filter(a => a.status === 'pending');

  return (
    <WidgetFrame title="אישורים ממתינים" sourceLabel="גאנטאיט" expandTo="/portfolio" state={list.length === 0 ? 'empty' : 'ok'} emptyText="אין אישורים פתוחים.">
      {list.map(a => (
        <div className="mini-row" key={a.id}>
          <div>
            <div className="r-title">{a.title}</div>
            <div className="r-sub">
              {getUser(a.requiredFromUserId)?.name} · ממתין {formatRelative(a.waitingSince)}
              {!missionId && a.missionId && ` · ${getMission(a.missionId)?.name}`}
              {a.missingItems.length > 0 && ` · חסר: ${a.missingItems.join(', ')}`}
            </div>
          </div>
          <div className="flex gap-6" style={{ alignItems: 'center' }}>
            <StatusChip label={approvalStatusMeta[a.status].label} tone={approvalStatusMeta[a.status].tone} />
            <StatusChip label={riskMeta[a.riskLevel].label} tone={riskMeta[a.riskLevel].tone} dot={false} />
            {a.status === 'pending' && (
              <>
                <button
                  className="icon-btn"
                  title="אשר"
                  onClick={() => {
                    updateApprovalStatus(a.id, 'approved');
                    showToast(a.missingItems.length > 0 ? `האישור "${a.title}" אושר ללא [${a.missingItems.join(', ')}] — נרשם ב-Timeline.` : `האישור "${a.title}" אושר ונרשם ב-Timeline.`);
                  }}
                >✓</button>
                <button
                  className="icon-btn"
                  title="דחה"
                  onClick={() => { updateApprovalStatus(a.id, 'rejected'); showToast(`האישור "${a.title}" נדחה ונרשם ב-Timeline.`); }}
                >✕</button>
              </>
            )}
          </div>
        </div>
      ))}
    </WidgetFrame>
  );
}
