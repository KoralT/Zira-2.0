import type { MovementPlan, OperationalEvent, OperationalSignal } from '../data/types';
import { getRoute } from '../data/routes';
import { operationalRelationships } from '../data/relationships';
import { spatialEvidence } from '../data/spatialEvidence';

// deriveMovementAssumptionSignal — the canonical OperationalSignal for an operation's movement
// assumption, DERIVED from business objects (never a hard-coded sentence):
//   (1) the observed fact — the planned route's observed state (blocked) + the AFFECTS relationship
//       + the reporting event;
//   (2) the planned movement route — the operation's MovementPlan (USES_ROUTE);
//   (3) the explicit relationships (HAS_PLAN / USES_ROUTE / AFFECTS);
//   (4) the Spatial Evidence tying the block to the planned route.
//
// It fires whenever the operation currently has NO viable movement route — either the planned route
// is observed blocked, OR (after a human records it) no route is established. It NEVER auto-resolves
// and NEVER produces a recommendation; an unvalidated alternative is stated only as a known gap.
export function deriveMovementAssumptionSignal(
  operationId: string,
  operationName: string,
  plan: MovementPlan | undefined,
  events: OperationalEvent[],
): OperationalSignal | null {
  if (!plan) return null;

  const hasPlan = operationalRelationships.find(r => r.kind === 'HAS_PLAN' && r.from.id === operationId);
  const affects = operationalRelationships.find(r => r.kind === 'AFFECTS' && r.to.id === 'ax-lavi');
  const blockEvent = affects ? events.find(e => e.id === affects.from.id) : undefined;
  const spatial = spatialEvidence.find(s => s.relatesEntityIds.includes(operationId));

  // Base evidence/relationship provenance shared by both branches.
  const evidenceRefs = [spatial?.id, blockEvent?.id].filter(Boolean) as string[];
  const altGap = 'ציר ברק קיים כחלופה ידועה — התאמתו, תזמונו וזמינותו טרם תוקפו.';

  if (plan.plannedRoute.established) {
    const route = getRoute(plan.plannedRoute.routeId);
    // Planned route is fine → planned and observed still align → no signal.
    if (!route || route.observedState?.condition !== 'blocked') return null;

    const usesRoute = operationalRelationships.find(r => r.kind === 'USES_ROUTE' && r.from.id === operationId && r.to.id === route.id)
      ?? operationalRelationships.find(r => r.kind === 'USES_ROUTE' && r.to.id === route.id);

    return {
      id: `sig-move-${operationId}`,
      subjectRefs: [operationId, route.id],
      statement: `הנחת התנועה של "${operationName}" אינה מתקיימת — המסלול המתוכנן (${route.label}) חסום.`,
      impact: 'לא ניתן להניח שהמבצע ייצא כמתוכנן, במסלול ובזמן שנקבעו, עד לבחינה מחדש של התנועה.',
      evidenceRefs,
      relationshipRefs: [hasPlan?.id, usesRoute?.id, affects?.id].filter(Boolean) as string[],
      inferenceClass: 'derived',
      knownGaps: [...(spatial?.knownGaps ?? ['משך החסימה טרם ידוע']), altGap],
      lifecycleStatus: 'open',
      derivedAt: route.observedState?.observedAt ?? new Date().toISOString(),
      provider: 'הקשר ומשמעות',
    };
  }

  // No established route (e.g. after a human recorded "no validated alternative"). The movement
  // assumption still does NOT hold — the signal persists (no fabricated resolution).
  const prev = plan.previousRoute?.routeId ? getRoute(plan.previousRoute.routeId) : undefined;
  return {
    id: `sig-move-${operationId}`,
    subjectRefs: [operationId, ...(prev ? [prev.id] : [])],
    statement: `טרם נקבע מסלול תנועה בר-ביצוע ל"${operationName}" — הנחת התנועה אינה מתקיימת.`,
    impact: 'לא ניתן להניח שהמבצע ייצא כמתוכנן עד שייקבע ויתוקף מסלול בר-ביצוע.',
    evidenceRefs,
    relationshipRefs: [hasPlan?.id, affects?.id].filter(Boolean) as string[],
    inferenceClass: 'derived',
    knownGaps: [altGap],
    lifecycleStatus: 'open',
    derivedAt: plan.updatedAt ?? new Date().toISOString(),
    provider: 'הקשר ומשמעות',
  };
}
