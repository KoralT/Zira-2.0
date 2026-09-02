import { useNavigate } from 'react-router-dom';
import { WidgetFrame } from '../common/WidgetFrame';
import { EmptyState } from '../common/EmptyState';
import { useStore } from '../../store/StoreContext';

export function DependenciesWidget({ missionId }: { missionId: string }) {
  const navigate = useNavigate();
  const { missions } = useStore();
  const byId = (id: string) => missions.find(m => m.id === id);
  const mission = byId(missionId);
  if (!mission) return null;

  const dependsOn = mission.dependsOnMissionIds.map(byId).filter(Boolean);
  const blockedBy = mission.blockedByMissionIds.map(byId).filter(Boolean);
  const blocksOthers = missions.filter(m => m.blockedByMissionIds.includes(missionId));

  const empty = dependsOn.length === 0 && blockedBy.length === 0 && blocksOthers.length === 0;

  return (
    <WidgetFrame title="תלותים" sourceLabel="גאנטאיט" state={empty ? 'empty' : 'ok'} emptyText="לא זוהו תלותים בין מבצעים.">
      {blockedBy.length > 0 && (
        <div className="mt-8">
          <div className="small muted" style={{ marginBottom: 4 }}>חסום על ידי</div>
          {blockedBy.map(m => m && (
            <div className="mini-row" key={m.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/portfolio/${m.id}`)}>
              <span className="r-title">{m.name}</span><span className="link-btn">פתח ←</span>
            </div>
          ))}
        </div>
      )}
      {blocksOthers.length > 0 && (
        <div className="mt-8">
          <div className="small muted" style={{ marginBottom: 4 }}>חוסם את</div>
          {blocksOthers.map(m => (
            <div className="mini-row" key={m.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/portfolio/${m.id}`)}>
              <span className="r-title">{m.name}</span><span className="link-btn">פתח ←</span>
            </div>
          ))}
        </div>
      )}
      {dependsOn.length === 0 && blockedBy.length === 0 && blocksOthers.length === 0 && <EmptyState text="לא זוהו תלותים." />}
    </WidgetFrame>
  );
}
