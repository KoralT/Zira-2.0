import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/StoreContext';
import { isDecisionEvent } from '../data';
import { eventCategoryMeta } from '../lib/meta';
import { EmptyState } from '../components/common/EmptyState';
import { formatRelative } from '../lib/format';

// ניהול אירועים / לחימה — an intentionally THIN module landing: the active / requiring-handling
// events, each opening the existing Event Context (/entity/event/:id). Nothing more — no lifecycle
// UI, no analytics, no KPI dashboard, no new workflow, no complex filtering.
export function EventsPage() {
  const navigate = useNavigate();
  const { operationalEvents, missions } = useStore();
  const active = operationalEvents.filter(e => isDecisionEvent(e) && e.status !== 'handled' && e.status !== 'closed');

  return (
    <div className="page" style={{ maxWidth: 1040 }}>
      <div className="eyebrow">מודולים · ניהול אירועים / לחימה</div>
      <div className="page-header">
        <div>
          <div className="page-title">ניהול אירועים / לחימה</div>
          <div className="page-subtitle">מה קורה עכשיו, מה השתנה, ומה נדרש כדי לנהל את האירוע עד סגירה.</div>
        </div>
      </div>

      <div className="card">
        {active.length === 0 ? (
          <EmptyState text="אין כרגע אירועים פעילים הדורשים טיפול." />
        ) : active.map(e => {
          const mission = e.impact?.missionId
            ? missions.find(m => m.id === e.impact!.missionId)
            : (e.relatedMissionIds[0] ? missions.find(m => m.id === e.relatedMissionIds[0]) : undefined);
          return (
            <div className="cs-op-row" key={e.id}>
              <div className="op-main" onClick={() => navigate(`/entity/event/${e.id}`)}>
                <div className="op-name">{e.title}</div>
                <div className="op-sub">{eventCategoryMeta[e.category].label}{mission ? ` · ${mission.name}` : ''} · זוהה {formatRelative(e.detectedAt)}</div>
              </div>
              <span className="link-btn" onClick={() => navigate(`/entity/event/${e.id}`)}>פתח ←</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
