import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/StoreContext';
import { isDecisionEvent, getMission } from '../../data';
import { useToast } from '../../store/ToastContext';
import { StatusChip } from '../common/StatusChip';
import { ReasoningLink } from '../common/ReasoningLink';
import { eventSeverityMeta, eventCategoryMeta } from '../../lib/meta';
import { formatRelative } from '../../lib/format';

// HQ does NOT show an "events list" (guardrail #2). It shows only events that became a
// decision-routing item: event → affected mission → consequence → action. Ambient events are
// counted as suppressed, never listed.
export function EventDecisionStrip() {
  const navigate = useNavigate();
  const { operationalEvents, applyEventImpact } = useStore();
  const { showToast } = useToast();

  const decisionEvents = operationalEvents.filter(e => isDecisionEvent(e) && e.status !== 'handled' && e.status !== 'closed');
  const suppressedCount = operationalEvents.filter(e => !isDecisionEvent(e)).length;

  if (decisionEvents.length === 0) {
    return (
      <div className="card">
        <div className="card-title">אירועים במרחב</div>
        <div className="muted small mt-8">אין כרגע אירוע שדורש החלטה.{suppressedCount > 0 ? ` ${suppressedCount} אירועים ללא השלכה סוננו ולא הוצפו.` : ''}</div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex-between" style={{ alignItems: 'baseline' }}>
        <div className="card-title">אירועים שדורשים החלטה</div>
        {suppressedCount > 0 && <span className="small muted">{suppressedCount} אירועים ללא השלכה סוננו</span>}
      </div>
      <div className="card-sub mt-8" style={{ marginBottom: 6 }}>אירוע → מבצע/גזרה מושפעים → השלכה → פעולה. רק אירועים שהפכו להחלטה מוצגים כאן.</div>
      {decisionEvents.map(e => {
        const mission = e.impact ? getMission(e.impact.missionId) : (e.relatedMissionIds[0] ? getMission(e.relatedMissionIds[0]) : undefined);
        return (
          <div className="mini-row" key={e.id} style={{ alignItems: 'flex-start' }}>
            <div>
              <div className="flex gap-6" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
                <StatusChip label={eventSeverityMeta[e.severity].label} tone={eventSeverityMeta[e.severity].tone} />
                <StatusChip label={eventCategoryMeta[e.category].label} tone={eventCategoryMeta[e.category].tone} dot={false} />
                <span className="r-title">{e.title}</span>
                <ReasoningLink type="event" id={e.id} />
              </div>
              <div className="r-sub" style={{ marginTop: 3 }}>
                {mission ? <>→ מבצע <strong>{mission.name}</strong> · </> : null}
                {e.impact?.meaning ?? e.description} · זוהה {formatRelative(e.detectedAt)}
              </div>
              <div className="btn-row mt-8">
                <button className="btn btn-sm btn-primary" onClick={() => { const s = applyEventImpact(e.id); showToast(`אירוע "${e.title}" טופל — נפתחה משימת המשך${s?.taskAssigneeName ? ` ל${s.taskAssigneeName}` : ''}, ונרשם ב-Timeline.`); }}>טפל</button>
                {mission && <button className="btn btn-sm" onClick={() => navigate(`/portfolio/${mission.id}`)}>פתח מבצע ←</button>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
