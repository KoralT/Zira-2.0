import type { MovementPlan } from './types';

// Movement-plan state (seed), keyed by operation id. The plan holds only the PLANNED route
// designation (a route ref) — never the route's observed condition. אופק צפוני's plan designates
// ציר לביא (ax-lavi) as its route; whether that route is currently blocked is an OBSERVED fact held
// on the route object (data/routes.ts), so planned and observed are kept separate.
export const seedMovementPlans: Record<string, MovementPlan> = {
  m1: { operationId: 'm1', plannedRoute: { established: true, routeId: 'ax-lavi' } },
};

// Known alternatives — contextual REFERENCE only, by route id. Never written into the plan and never
// selectable as the planned route (ציר ברק / ax-barak is validation:'unvalidated' — known context,
// not a plan value).
export const KNOWN_ALTERNATIVES: Record<string, string[]> = {
  m1: ['ax-barak'],
};
