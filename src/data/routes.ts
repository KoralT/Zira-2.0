import type { OperationalRoute } from './types';

// Routes/axes as first-class business objects for the ציר לביא slice. The OBSERVED state (ציר לביא
// is currently blocked) is a sourced fact held here — it never overwrites any plan's planned route.
// ציר ברק is a known alternative whose suitability is explicitly NOT validated.
export const operationalRoutes: OperationalRoute[] = [
  { id: 'ax-lavi', label: 'ציר לביא', observedState: { condition: 'blocked', sourceId: 'src-field', observedAt: '2026-07-22T05:20:00' } },
  { id: 'ax-barak', label: 'ציר ברק', validation: 'unvalidated' },
];

export const getRoute = (id: string) => operationalRoutes.find(r => r.id === id);
