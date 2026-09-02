import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/StoreContext';
import { useToast } from '../store/ToastContext';
import { buildReasoningMap } from '../lib/reasoning';
import { entityNoun } from '../components/common/ReasoningLink';
import { confidenceMeta } from '../lib/meta';
import { EmptyState } from '../components/common/EmptyState';
import { formatDateTime, formatRelative } from '../lib/format';

// The full-page reasoning map (v1.3): why an entity is presented and what it means — provenance
// deep enough to actually explore (replaces the cramped drawer for depth). Opened for any entity
// via /entity/:type/:id. Every section is derived from live store data.
export function ReasoningMapPage() {
  const { entityType, entityId } = useParams();
  const navigate = useNavigate();
  const store = useStore();
  const { validateEvidence } = store;
  const { showToast } = useToast();

  const map = buildReasoningMap(entityType ?? '', entityId ?? '', store);
  const evItem = map.evidenceId ? store.evidence.find(e => e.id === map.evidenceId) : undefined;

  if (!map.found) {
    return <div className="page"><button className="link-btn" onClick={() => navigate(-1)}>← חזרה</button><div className="mt-14"><EmptyState text="הישות לא נמצאה." /></div></div>;
  }

  return (
    <div className="page" style={{ maxWidth: 1080 }}>
      <button className="link-btn" onClick={() => navigate(-1)}>← חזרה</button>
      <div className="page-header mt-8">
        <div>
          <div className="eyebrow">מפת חשיבה · {map.entityTypeLabel}</div>
          <div className="page-title">{map.title}</div>
          {map.subtitle && <div className="page-subtitle">{map.subtitle}</div>}
        </div>
        {map.primaryRoute && <button className="btn btn-primary" onClick={() => navigate(map.primaryRoute!)}>פתח {map.primaryRoute.startsWith('/portfolio') ? 'מבצע' : map.primaryRoute.startsWith('/directives') ? 'הנחיה' : map.primaryRoute.startsWith('/entity/') ? entityNoun(map.primaryRoute.split('/')[2]) : 'פריט'} ←</button>}
      </div>

      {/* Why is this presented, and what does it mean — the lead. */}
      <div className="note-box" style={{ marginBottom: 18, fontSize: 14 }}>
        <strong>למה זה מוצג לך: </strong>{map.meaning}
      </div>

      <div className="grid grid-2">
        {/* מהו */}
        <div className="card">
          <div className="card-title">מהו</div>
          {map.identity.map((r, i) => (
            <div className="mini-row" key={i}><span className="r-title">{r.label}</span><span className="r-sub">{r.value}</span></div>
          ))}
        </div>

        {/* מאיפה — signal / source */}
        <div className="card">
          <div className="card-title">מאיפה — אות ומקור</div>
          {map.signal ? (
            <>
              <div className="mini-row"><span className="r-title">מערכת מקור</span><span className="r-sub">{map.signal.system}</span></div>
              {map.signal.when && <div className="mini-row"><span className="r-title">עדכניות</span><span className="r-sub">{formatRelative(map.signal.when)} · {formatDateTime(map.signal.when)}</span></div>}
              {map.signal.note && <p className="small muted mt-8" style={{ lineHeight: 1.6 }}>{map.signal.note}</p>}
            </>
          ) : <p className="small muted">—</p>}
        </div>
      </div>

      {/* מה המשמעות — emphasized */}
      {map.meaningPoints.length > 0 && (
        <div className="card mt-20" style={{ borderRight: '5px solid var(--blue)' }}>
          <div className="card-title">מה המשמעות</div>
          <ul style={{ margin: '8px 0 0', lineHeight: 1.7 }}>
            {map.meaningPoints.map((p, i) => <li key={i} className="small" style={{ color: 'var(--ink-soft)' }}>{p}</li>)}
          </ul>
        </div>
      )}

      <div className="grid grid-2 mt-20">
        {/* איך מחובר */}
        <div className="card">
          <div className="card-title">איך מחובר</div>
          {map.connections.length === 0 && <p className="small muted mt-8">אין קשרים רשומים.</p>}
          {map.connections.map((c, i) => (
            <div className="mini-row" key={i}>
              <div><div className="r-title">{c.label}</div>{c.sub && <div className="r-sub">{c.sub}</div>}</div>
              {c.route && <button className="link-btn" onClick={() => navigate(c.route!)}>פתח ←</button>}
            </div>
          ))}
        </div>

        {/* על מה מבוסס — evidence / trust */}
        <div className="card">
          <div className="card-title">על מה מבוסס — Evidence ואמון</div>
          {map.evidence.length === 0 && <p className="small muted mt-8">לא נמצא Evidence מקושר — רמת האמון נמוכה יותר.</p>}
          {map.evidence.map(e => (
            <div className="mini-row" key={e.id}>
              <div><div className="r-title">{e.label}</div>{e.confidence && <div className="r-sub">{confidenceMeta[e.confidence].label}</div>}</div>
              {!map.isEvidence && <button className="link-btn" onClick={() => navigate(`/entity/evidence/${e.id}`)}>על מה מבוסס ←</button>}
            </div>
          ))}

          {/* Evidence findings get Human-in-the-loop validation + deep link, in place. */}
          {map.isEvidence && evItem && (
            <div className="mt-14">
              {evItem.validationStatus && (
                <div className="note-box" style={{ marginBottom: 10, fontSize: 12.5 }}>
                  סטטוס תיקוף: {{ confirmed: 'אומת', rejected: 'נדחה', outdated: 'סומן כלא עדכני', 'clarification-requested': 'ממתין להבהרה' }[evItem.validationStatus]}
                </div>
              )}
              <div className="btn-row">
                <button className="btn btn-sm" onClick={() => validateEvidence(evItem.id, 'confirmed')}>✓ אשר</button>
                <button className="btn btn-sm btn-danger" onClick={() => validateEvidence(evItem.id, 'rejected')}>✕ דחה</button>
                <button className="btn btn-sm" onClick={() => validateEvidence(evItem.id, 'outdated')}>סמן כלא עדכני</button>
                <button className="btn btn-sm btn-ghost" onClick={() => showToast(`מדמה מעבר למערכת המקור (Read Only): ${evItem.deepLinkLabel} — ${evItem.deepLinkUrl}`)}>פתח במקור ↗</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* השושלת — how we got here */}
      <div className="card mt-20">
        <div className="card-title">השושלת — כיצד הגענו לכאן</div>
        {map.lineage.length === 0 && <p className="small muted mt-8">אין רשומות שושלת.</p>}
        {map.lineage.map((l, i) => (
          <div className="mini-row" key={i}>
            <span className="r-title" style={{ fontWeight: 500 }}>{l.text}</span>
            <span className="r-sub">{l.actor ? `${l.actor} · ` : ''}{formatRelative(l.timestamp)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
