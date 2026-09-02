import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/StoreContext';
import { SECONDARY, EV_KIND_LABEL, type EvKind } from '../../data/attentionSignals';
import { deriveMovementAssumptionSignal } from '../../lib/operationalSignal';
import { getRoute } from '../../data/routes';
import { getSpatialEvidence } from '../../data/spatialEvidence';
import { formatRelative } from '../../lib/format';
import type { OperationalSignal } from '../../data/types';

// Commander Space — Attention. The primary view answers: what happened · what it means · what to do.
//
// The flagship is NO LONGER a hard-coded fixture: it is rendered from a derived OperationalSignal
// (lib/operationalSignal.ts), which is computed from real business objects — the observed event,
// the movement plan (USES_ROUTE), the explicit relationships, and the Spatial Evidence. "מקורות"
// resolves those refs back to the actual objects (no duplicated prose lineage).
//
// SIGNAL ≠ ATTENTION: the signal establishes meaning; Attention decides relevance. The flagship is
// shown only when the signal exists AND grounding shows it requires the active user (m1 owner).
// SIGNAL ≠ RECOMMENDATION: there is no recommendation — the action is a handoff, and the unvalidated
// alternative (ציר ברק) is stated only as a known gap.

const kindClass: Record<EvKind, string> = { fact: 'fact', synthesized: 'synthesized', 'fact-unverified': 'unverified' };

interface EvView { label: string; source: string; freshness?: string; kind: EvKind; derived?: boolean; fact?: string; issue?: string; }

export function CommanderAttention() {
  const navigate = useNavigate();
  const { currentUserId, missions, approvals, directives, movementPlans, operationalEvents } = useStore();
  const [whyOpen, setWhyOpen] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);

  const handoffToPlanning = () => navigate('/planning/m1/movement');

  // --- Canonical flagship: derive the OperationalSignal for אופק צפוני's movement assumption. ---
  const operation = missions.find(m => m.id === 'm1');
  const opName = operation?.name ?? 'המבצע';
  const signal = deriveMovementAssumptionSignal('m1', opName, movementPlans['m1'], operationalEvents);

  // Attention eligibility (grounding, existing facts): the flagship requires the operation's owner.
  const flagshipRequiresUser = operation?.ownerId === currentUserId;
  const showFlagship = !!signal && signal.lifecycleStatus !== 'resolved' && flagshipRequiresUser;

  // Secondary Attention — grounded to the user each item genuinely requires (unchanged model).
  const d1 = directives.find(d => d.id === 'd1');
  const groundedForUser = (id: string): boolean => {
    if (id === 'approval-move') return approvals.some(a => a.missionId === 'm4' && a.status === 'pending' && a.requiredFromUserId === currentUserId);
    if (id === 'directive-policy') return !!d1 && d1.affectedUserIds.includes(currentUserId) && !d1.ackUserIds.includes(currentUserId);
    return false;
  };
  const secondary = SECONDARY.filter(s => groundedForUser(s.id));
  const heroPresent = showFlagship && !!signal;

  // Presentation of the canonical signal (derived from it — NOT a hard-coded fixture). Progressive
  // disclosure: the collapsed Hero shows only CHANGE → MEANING → ACTION; "למה?" gives concise
  // reasoning; "מקורות" exposes the full inspectable evidence chain. All composed from the objects.
  const buildEvidenceView = (sig: OperationalSignal): { headline: string; meaning: string; rows: EvView[]; why: string } => {
    const routeId = sig.subjectRefs[1];
    const route = routeId ? getRoute(routeId) : undefined;
    const blockEvent = operationalEvents.find(e => sig.evidenceRefs.includes(e.id));
    const spatial = sig.evidenceRefs.map(getSpatialEvidence).find(Boolean);
    const alt = getRoute('ax-barak');
    const planned = movementPlans['m1']?.plannedRoute.established;

    // CHANGE (what happened) and MEANING (what it implies) — the only two lines shown by default.
    const headline = planned && route
      ? `${route.label}, שעליו נשענת תוכנית התנועה של "${opName}", נחסם.`
      : `טרם נקבע מסלול תנועה בר-ביצוע ל"${opName}".`;
    const meaning = 'הנחת התנועה של המבצע אינה מתקיימת כרגע, ונדרשת בחינה מחדש של תוכנית התנועה.';

    const rows: EvView[] = [];
    if (blockEvent) rows.push({ label: `אירוע בטיחות — ${blockEvent.title}`, source: 'ניהול אירועים', freshness: formatRelative(blockEvent.detectedAt), kind: 'fact', fact: spatial?.knownGaps?.[0] });
    if (route) rows.push({ label: `תלות מתועדת: "${opName}" ← ${route.label}`, source: 'מאגר מבצעים', kind: 'fact' });
    if (spatial) rows.push({ label: spatial.statement, source: spatial.provider, freshness: spatial.observedAt ? formatRelative(spatial.observedAt) : undefined, kind: 'fact' });
    rows.push({ label: 'הנחת התנועה אינה מתקיימת — מסקנה מסונתזת מהמקורות שלמעלה', source: sig.provider ?? 'הקשר ומשמעות', kind: 'synthesized', derived: true });
    if (alt) rows.push({ label: `ציר חלופי אפשרי: ${alt.label}`, source: 'גאוגרפיה / מבצעים', kind: 'fact-unverified', issue: 'התאמה, תזמון וזמינות טרם תוקפו.' });

    const why = planned && route
      ? `תוכנית התנועה של "${opName}" נשענת על ${route.label} כמסלול הגישה. ${route.label} דווח חסום (אירוע בטיחות), ולכן לא ניתן להניח שהיציאה תתאפשר במסלול ובזמן שנקבעו.`
      : `טרם נקבע מסלול תנועה בר-ביצוע ל"${opName}", ולכן הנחת התנועה אינה מתקיימת ונדרשת בחינה מחדש.`;
    return { headline, meaning, rows, why };
  };

  const ev = signal ? buildEvidenceView(signal) : null;

  return (
    <div className="csa-wrap">
      {/* PRIMARY — the single dominant Attention Hero, from the derived OperationalSignal (shown only
          to the operation's owner). When this user has no dominant operational-meaning hero, an
          Attention-specific empty state stands in its place — never a fabricated hero, and never a
          global "nothing requires you" claim. */}
      {heroPresent && signal && ev ? (
        <div className="csa-flag">
          <div className="csa-headline">{ev.headline}</div>
          <div className="csa-matters">{ev.meaning}</div>

          <div className="csa-actions">
            <button className="btn btn-primary" onClick={handoffToPlanning}>בחן מחדש את תוכנית התנועה</button>
          </div>

          {/* Quiet, on-demand secondary access — never needed to know what to do. */}
          <div className="csa-quiet-row">
            <button className="csa-quiet" onClick={() => setWhyOpen(o => !o)}>למה?</button>
            <span className="csa-quiet-sep">·</span>
            <button className="csa-quiet" onClick={() => setSourcesOpen(o => !o)}>מקורות</button>
          </div>

          {whyOpen && <div className="csa-why">{ev.why}</div>}

          {sourcesOpen && (
            <div className="csa-sources">
              {ev.rows.map((e, i) => (
                <div className="csa-ev" key={i}>
                  <div className="csa-ev-top">
                    <span className="csa-ev-label">{e.label}</span>
                    <span className={`csa-ev-kind ${kindClass[e.kind]}`}>{EV_KIND_LABEL[e.kind]}</span>
                  </div>
                  <div className="csa-ev-meta">
                    {e.derived
                      ? `${e.source} · נגזר מהמקורות המוצגים · ניתן למעקב למקורות`
                      : `${e.source}${e.freshness ? ' · ' + e.freshness : ''}`}
                  </div>
                  {e.fact && <div className="csa-ev-meta">{e.fact}</div>}
                  {e.issue && <div className="csa-ev-issue">⚠️ {e.issue}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="cs-context-note">אין כרגע פריט חדש באזור הקשב.</div>
      )}

      {/* SECONDARY — specific obligations that require handling but must NOT compete with the hero.
          A semantic subhead keeps them subordinate; they stay actionable, never promoted to heroes. */}
      {secondary.length > 0 && (
        <>
          <div className="cs-subhead" style={{ marginTop: heroPresent ? 18 : 12 }}>דברים נוספים שדורשים טיפול</div>
          {secondary.map(s => (
            <div className="csa-sec" key={s.id}>
          <div style={{ minWidth: 0 }}>
            <div className="s-head">{s.headline}</div>
            <div className="s-sub">{s.sub}</div>
            {s.contextLine && <div className="s-sub" style={{ marginTop: 4 }}>{s.contextLine}</div>}
          </div>
              {s.reviewLabel && (
                <button className="btn btn-sm" onClick={() => s.reviewTo && navigate(s.reviewTo)}>{s.reviewLabel}</button>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
