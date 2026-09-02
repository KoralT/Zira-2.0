import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store/StoreContext';
import { sourceSystems } from '../data/sources';
import { eventCategoryMeta } from '../lib/meta';
import { StatusChip } from '../components/common/StatusChip';
import { formatDateTime } from '../lib/format';
import { EmptyState } from '../components/common/EmptyState';

// Control proof (prototype) — a focused Event Context for a single operational event (reached via
// the existing /entity/event/:id URL). It assembles what already exists around the event so the
// responsible user grasps it in one place, and offers the ONE transition: record what was done and
// close. It deliberately does NOT expose recommendation framing, confidence, readiness, C&M, or
// reasoning-engine terminology, and it uses only facts already present in the event fixture.
export function EventContextPage() {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const { operationalEvents, missions, closeEvent } = useStore();
  const event = operationalEvents.find(e => e.id === entityId);
  const [outcome, setOutcome] = useState('');

  if (!event) {
    return (
      <div className="page" style={{ maxWidth: 760 }}>
        <button className="link-btn" onClick={() => navigate(-1)}>← חזרה</button>
        <div className="mt-14"><EmptyState text="האירוע לא נמצא." /></div>
      </div>
    );
  }

  const affected = event.impact?.missionId
    ? missions.find(m => m.id === event.impact!.missionId)
    : (event.relatedMissionIds[0] ? missions.find(m => m.id === event.relatedMissionIds[0]) : undefined);
  const sourceName = sourceSystems.find(s => s.id === event.sourceId)?.name;
  const closed = event.status === 'closed';

  return (
    <div className="page" style={{ maxWidth: 760 }}>
      <button className="link-btn" onClick={() => navigate(-1)}>← חזרה</button>
      <div className="page-header mt-8">
        <div>
          <div className="eyebrow">אירוע · {eventCategoryMeta[event.category].label}</div>
          <div className="page-title">{event.title}</div>
        </div>
        {closed && <StatusChip label="טופל · נסגר" tone="green" />}
      </div>

      {/* האירוע — the initial report (facts only). */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title">האירוע</div>
        <p className="small muted" style={{ lineHeight: 1.6, marginTop: 6 }}>{event.description}</p>
        <div className="mt-8">
          <div className="mini-row"><span className="r-title">זוהה</span><span className="r-sub">{formatDateTime(event.detectedAt)}</span></div>
          {sourceName && <div className="mini-row"><span className="r-title">מקור</span><span className="r-sub">{sourceName}</span></div>}
          {(event.locationLabel || event.sector) && (
            <div className="mini-row"><span className="r-title">מיקום / גזרה</span><span className="r-sub">{event.locationLabel ?? ''}{event.locationLabel && event.sector ? ' · ' : ''}{event.sector}</span></div>
          )}
        </div>
      </div>

      {/* מה ידוע כרגע — assembled from existing event facts / relationships. */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title">מה ידוע כרגע</div>
        <div className="mt-8">
          {affected && (
            <div className="mini-row" style={{ cursor: 'pointer' }} onClick={() => navigate(`/portfolio/${affected.id}`)}>
              <span className="r-title">מבצע מושפע</span>
              <span className="link-btn">{affected.name} ←</span>
            </div>
          )}
          {event.impact?.meaning && (
            <div className="cs-context-note" style={{ marginTop: 8, lineHeight: 1.6 }}>{event.impact.meaning}.</div>
          )}
        </div>
      </div>

      {/* מה דורש טיפול (before) OR the recorded outcome (after). */}
      {closed ? (
        <div className="card">
          <div className="card-title">הטיפול שנרשם</div>
          <div className="cs-context-note" style={{ marginTop: 8, lineHeight: 1.6, color: 'var(--ink)' }}>{event.handlingOutcome}</div>
          {event.handledAt && <div className="mini-row mt-8"><span className="r-title">נסגר</span><span className="r-sub">{formatDateTime(event.handledAt)}</span></div>}
        </div>
      ) : (
        <div className="card">
          <div className="card-title">מה דורש טיפול</div>
          {event.impact?.requiredAction && (
            <div className="cs-context-note" style={{ marginTop: 8, lineHeight: 1.6 }}>{event.impact.requiredAction}.</div>
          )}
          <div className="field mt-14">
            <label>רשום/י מה בוצע</label>
            <textarea value={outcome} onChange={e => setOutcome(e.target.value)} placeholder="תיאור קצר של הטיפול שבוצע…" />
          </div>
          <div className="btn-row mt-8">
            <button className="btn btn-primary" disabled={!outcome.trim()} onClick={() => closeEvent(event.id, outcome.trim())}>רשום טיפול וסגור</button>
          </div>
        </div>
      )}
    </div>
  );
}
