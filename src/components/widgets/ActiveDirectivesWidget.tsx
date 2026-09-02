import { useNavigate } from 'react-router-dom';
import { getUser } from '../../data';
import { formatRelative } from '../../lib/format';
import { WidgetFrame } from '../common/WidgetFrame';
import { useStore } from '../../store/StoreContext';

export function ActiveDirectivesWidget({ missionId }: { missionId?: string }) {
  const navigate = useNavigate();
  const { directives, tasks } = useStore();
  let list = directives.filter(d => d.status === 'published');
  if (missionId) list = list.filter(d => d.relatedMissionIds.includes(missionId));

  return (
    <WidgetFrame title="הנחיות פעילות" sourceLabel="מערכת פקודות ומדיניות" lastUpdated="2026-07-21T18:00:00" expandTo="/directives"
      state={list.length === 0 ? 'empty' : 'ok'} emptyText="אין הנחיות פעילות רלוונטיות.">
      {list.map(d => {
        const derivedCount = tasks.filter(t => t.sourceType === 'directive' && t.sourceId === d.id).length;
        return (
          <div className="mini-row" key={d.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/directives/${d.id}`)}>
            <div>
              <div className="r-title">{d.title}</div>
              <div className="r-sub">פורסם ע"י {getUser(d.publishedById)?.name} · {formatRelative(d.publishedAt)}</div>
            </div>
            <div className="r-sub" style={{ textAlign: 'left' }}>
              {d.ackUserIds.length}/{d.affectedUserIds.length} אישרו · {derivedCount} פעולות
            </div>
          </div>
        );
      })}
    </WidgetFrame>
  );
}
