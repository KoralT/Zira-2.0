import { useNavigate } from 'react-router-dom';
import { WidgetFrame } from '../common/WidgetFrame';
import { useStore } from '../../store/StoreContext';

export function ImpactWidget({ directiveId }: { directiveId: string }) {
  const navigate = useNavigate();
  const { directives, missions: allMissions } = useStore();
  const directive = directives.find(d => d.id === directiveId);
  const missions = directive ? directive.relatedMissionIds.map(id => allMissions.find(m => m.id === id)).filter(Boolean) : [];

  return (
    <WidgetFrame title="השפעה" sourceLabel="Sigma Context Platform" state={missions.length === 0 ? 'empty' : 'ok'} emptyText="לא זוהתה השפעה על מבצעים.">
      {missions.map(m => m && (
        <div className="mini-row" key={m.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/portfolio/${m.id}`)}>
          <div>
            <div className="r-title">{m.name}</div>
            <div className="r-sub">מוכנות נוכחית {m.readiness}%{m.previousReadiness ? ` (היה ${m.previousReadiness}%)` : ''}</div>
          </div>
          <span className="link-btn">פתח ←</span>
        </div>
      ))}
    </WidgetFrame>
  );
}
