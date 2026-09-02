import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store/StoreContext';
import { KNOWN_ALTERNATIVES } from '../data/planning';
import { getRoute } from '../data/routes';
import type { OperationalRoute } from '../data/types';

// Planning — Movement plan (Vertical Slice 1). One real, persisted plan-state transition: when the
// planned route is no longer viable, record "טרם נקבע מסלול חלופי" — WITHOUT presenting an
// unvalidated alternative as the new plan. Planned vs observed are separate business facts: the plan
// holds only the PLANNED route (a route ref); whether that route is blocked is an OBSERVED fact read
// from the OperationalRoute. "Whether a viable route exists" is DERIVED, never persisted.
const CONDITION_LABEL: Record<string, string> = { blocked: 'חסום', viable: 'בר-ביצוע' };
const altStatusLabel = (r: OperationalRoute) => (r.validation === 'unvalidated' ? 'טרם תוקף' : 'מתוקף');

export function MovementPlanningPage() {
  const { opId = 'm1' } = useParams();
  const navigate = useNavigate();
  const { missions, movementPlans, recordNoAlternativeRoute } = useStore();
  const opName = missions.find(m => m.id === opId)?.name ?? 'מבצע';
  const plan = movementPlans[opId];
  const alternatives = (KNOWN_ALTERNATIVES[opId] ?? []).map(getRoute).filter(Boolean) as OperationalRoute[];

  const [mode, setMode] = useState<'view' | 'edit'>('view');

  if (!plan) {
    return <div className="page" style={{ maxWidth: 720 }}><div className="cs-context-note">אין תוכנית תנועה למבצע זה.</div></div>;
  }

  const established = plan.plannedRoute.established;
  const plannedRoute = plan.plannedRoute.established ? getRoute(plan.plannedRoute.routeId) : undefined;
  // OBSERVED (fact on the route) — the plan never stores this. DERIVED viability: established + not blocked.
  const plannedObserved = plannedRoute?.observedState?.condition;
  const hasViableRoute = established && plannedObserved !== 'blocked';
  const prevRoute = plan.previousRoute?.routeId ? getRoute(plan.previousRoute.routeId) : undefined;

  const fmt = (iso?: string) => iso
    ? new Date(iso).toLocaleString('he-IL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
    : '';

  const Path = () => (
    <div className="plan-path">{opName}<span className="sep">›</span>תכנון<span className="sep">›</span>תנועה</div>
  );

  const AltRow = ({ label = 'חלופה אפשרית' }: { label?: string }) => alternatives.length === 0 ? null : (
    <div className="plan-fact">
      <span className="k">{label}</span>
      <span className="v">{alternatives[0].label} · <span className="unverified">{altStatusLabel(alternatives[0])}</span></span>
    </div>
  );

  // Derived, honestly stated: a viable route has not YET been established (we do not claim none exists).
  const NoViableRouteNote = () => hasViableRoute ? null : (
    <div className="plan-derived">טרם נקבע מסלול בר-ביצוע לתוכנית.</div>
  );

  // ---- Edit mode: a direct single action (no choice UI — there is no real choice in this slice). ----
  if (mode === 'edit') {
    const currentLabel = plannedRoute?.label ?? '—';
    const currentCond = plannedObserved ? CONDITION_LABEL[plannedObserved] : '';
    return (
      <div className="page" style={{ maxWidth: 720 }}>
        <Path />
        <h1 className="plan-title" style={{ marginBottom: 18 }}>עדכון תוכנית התנועה</h1>

        <div className="card plan-facts">
          <div className="plan-fact">
            <span className="k">המסלול המתוכנן כיום</span>
            <span className="v">{currentLabel}{currentCond ? <> · <span className="unverified">{currentCond}</span></> : null}</span>
          </div>
          <AltRow label="חלופה ידועה" />
        </div>

        <p className="plan-line" style={{ marginTop: 16 }}>עדכן את התוכנית כך שתשקף שטרם נקבע מסלול חלופי.</p>

        <div className="plan-actions">
          <button className="btn btn-primary" onClick={() => { recordNoAlternativeRoute(opId); setMode('view'); }}>עדכן את תוכנית התנועה</button>
          <button className="csa-quiet" onClick={() => setMode('view')}>ביטול</button>
        </div>
      </div>
    );
  }

  // ---- View mode: reflects the current persisted plan truth. ----
  if (established) {
    // A route is designated but observed blocked → the plan requires reassessment.
    return (
      <div className="page" style={{ maxWidth: 720 }}>
        <Path />
        <div className="plan-landing">
          <h1 className="plan-title">תוכנית התנועה דורשת בחינה מחדש</h1>
          <p className="plan-line">{plannedRoute?.label}, שעליו נשענת התוכנית, {plannedObserved ? CONDITION_LABEL[plannedObserved] : ''}.</p>
        </div>
        <div className="card plan-facts">
          <div className="plan-fact">
            <span className="k">מסלול מתוכנן</span>
            <span className="v">{plannedRoute?.label}{plannedObserved ? <> · <span className="unverified">{CONDITION_LABEL[plannedObserved]}</span></> : null}</span>
          </div>
          <AltRow />
          <NoViableRouteNote />
        </div>
        <div className="plan-actions">
          <button className="btn btn-primary" onClick={() => setMode('edit')}>פתח את תוכנית התנועה</button>
          <button className="csa-quiet" onClick={() => navigate('/me')}>חזרה למרחב הפיקוד ←</button>
        </div>
      </div>
    );
  }

  // No established route (after the transition) — the plan truthfully reflects that reality.
  return (
    <div className="page" style={{ maxWidth: 720 }}>
      <Path />
      <h1 className="plan-title" style={{ marginBottom: 16 }}>תוכנית התנועה</h1>
      <div className="card plan-facts">
        <div className="plan-fact"><span className="k">מסלול מתוכנן</span><span className="v">טרם נקבע מסלול חלופי</span></div>
        <AltRow />
        {prevRoute && (
          <div className="plan-fact">
            <span className="k">מסלול קודם</span>
            <span className="v muted">{prevRoute.label}{prevRoute.observedState ? ` · ${CONDITION_LABEL[prevRoute.observedState.condition]}` : ''}</span>
          </div>
        )}
        {plan.updatedAt && <div className="plan-fact"><span className="k">עודכן</span><span className="v">{fmt(plan.updatedAt)}</span></div>}
      </div>
      <div className="plan-actions">
        <button className="csa-quiet" onClick={() => navigate('/me')}>חזרה למרחב הפיקוד ←</button>
      </div>
    </div>
  );
}
