import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/StoreContext';
import { isDecisionEvent, getUser } from '../data';
import { sourceSystems } from '../data/sources';
import { recommendationFromEvent } from '../lib/recommendation';
import { EventDecisionStrip } from '../components/hq/EventDecisionStrip';
import { OperationalMapWidget } from '../components/widgets/OperationalMapWidget';
import { MissionPortfolioWidget } from '../components/widgets/MissionPortfolioWidget';
import { ActiveDirectivesWidget } from '../components/widgets/ActiveDirectivesWidget';
import { OperationalTimelineWidget } from '../components/widgets/OperationalTimelineWidget';
import { ResourceStatusWidget } from '../components/widgets/ResourceStatusWidget';

// תמונת מצב — the SHARED / collective command picture (מרחב המפקדה). Core question:
// "מה קורה כרגע במרחב המבצעי?". This is role-NEUTRAL by design: it is the same picture for everyone
// standing in the HQ, not a personalized "since you were here" feed (that is בשבילי). Each change is
// a change-in-meaning: what changed → its operational meaning → ownership (the responsible role).
export function HQPage() {
  const navigate = useNavigate();
  const store = useStore();
  const { operationalEvents, directives, approvals, missions, readinessItems, evidence, currentUserId } = store;

  const missionById = (id: string) => missions.find(m => m.id === id);
  const ctx = { missionById, readinessItems, directives, approvals, evidence, sourceNameById: (id: string) => sourceSystems.find(s => s.id === id)?.name };

  interface Change { title: string; meaning: string; ownerLabel?: string; ownedByMe: boolean; route: string; noun: string; }

  const eventChanges: Change[] = operationalEvents
    .filter(e => isDecisionEvent(e) && e.status !== 'handled' && e.status !== 'closed')
    .map(e => {
      const c = recommendationFromEvent(e, ctx);
      const mission = e.impact ? missionById(e.impact.missionId) : (e.relatedMissionIds[0] ? missionById(e.relatedMissionIds[0]) : undefined);
      const owner = mission ? getUser(mission.ownerId) : undefined;
      return {
        title: c.situation ?? e.title,
        meaning: [c.impact, c.consequence].filter(Boolean).join(' '),
        ownerLabel: owner?.roleLabel,
        ownedByMe: mission?.ownerId === currentUserId,
        route: `/entity/event/${e.id}`, noun: 'אירוע',
      };
    });

  const directiveChanges: Change[] = directives
    .filter(d => d.status === 'published' && d.impacts.length > 0)
    .map(d => {
      const firstMission = missionById(d.impacts[0].missionId);
      const owner = firstMission ? getUser(firstMission.ownerId) : undefined;
      return {
        title: `הנחיית "${d.title}" השפיעה על ${d.impacts.length} מבצעים`,
        meaning: d.impacts[0].meaning + '.',
        ownerLabel: owner?.roleLabel,
        ownedByMe: firstMission?.ownerId === currentUserId,
        route: `/directives/${d.id}`, noun: 'הנחיה',
      };
    });

  const changes = [...eventChanges, ...directiveChanges].slice(0, 6);

  return (
    <div className="page" style={{ maxWidth: 1040 }}>
      <div className="eyebrow">מרחב המפקדה · תמונת מצב</div>
      <div className="page-header">
        <div>
          <div className="page-title">מה קורה כרגע במרחב המבצעי?</div>
          <div className="page-subtitle">התמונה המבצעית המשותפת של הגזרה — השינויים המשמעותיים והמצב הכולל.</div>
        </div>
      </div>

      {/* The synthesized changes — each a change-in-meaning, not a data row. */}
      {changes.map((c, i) => (
        <div className="hq-change" key={i}>
          <div className="hq-change-title">{c.title}</div>
          {c.meaning && <div className="hq-change-meaning">{c.meaning}</div>}
          <div className="hq-change-foot">
            {c.ownerLabel && <span className="hq-owner">בעלות: {c.ownerLabel}</span>}
            <button className="link-btn" onClick={() => navigate(c.route)}>פתח {c.noun} ←</button>
          </div>
        </div>
      ))}

      {/* Honest closure — what was identified, without over-claiming a full scan. */}
      {changes.length > 0 && <div className="hq-closure">אלה השינויים המשמעותיים שזוהו כרגע.</div>}

      {/* The full operational picture — always visible (no collapse). The changes above are what's
          new & what it means; this is the standing picture they sit within, so HQ demonstrates its
          Awareness content rather than a "you're all caught up" dead-end. */}
      <div className="work-section-head" style={{ marginTop: 30 }}>
        <div className="section-title">התמונה המבצעית</div>
        <div className="section-sub">המצב הכולל שבתוכו יושבים השינויים שלמעלה.</div>
      </div>
      <div className="grid grid-2 mt-14">
        <OperationalMapWidget />
        <EventDecisionStrip />
      </div>
      <div className="grid grid-2 mt-20">
        <MissionPortfolioWidget />
        <ActiveDirectivesWidget />
        <ResourceStatusWidget />
      </div>
      <div className="mt-20">
        <OperationalTimelineWidget limit={10} expandTo="/hq/timeline" />
      </div>
    </div>
  );
}
