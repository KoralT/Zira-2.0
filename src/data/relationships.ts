import type { OperationalRelationship } from './types';

// Explicit, inspectable relationships for the ציר לביא canonical slice. These are records, not a
// graph engine — the scenario is derived from them rather than from duplicated IDs or prose.
//   Operation אופק צפוני  HAS_PLAN   Movement Plan (m1)
//   Movement Plan (m1)     USES_ROUTE ציר לביא (ax-lavi)
//   Operational Event ev7  AFFECTS    ציר לביא (ax-lavi)   [blocked]
export const operationalRelationships: OperationalRelationship[] = [
  { id: 'rel-hasplan-m1', kind: 'HAS_PLAN', from: { type: 'operation', id: 'm1' }, to: { type: 'movement-plan', id: 'm1' } },
  { id: 'rel-usesroute-m1', kind: 'USES_ROUTE', from: { type: 'movement-plan', id: 'm1' }, to: { type: 'route', id: 'ax-lavi' } },
  { id: 'rel-affects-ev7', kind: 'AFFECTS', from: { type: 'event', id: 'ev7' }, to: { type: 'route', id: 'ax-lavi' }, note: 'blocked' },
];

export const relationshipsTo = (type: string, id: string) => operationalRelationships.filter(r => r.to.type === type && r.to.id === id);
export const relationshipsFrom = (type: string, id: string) => operationalRelationships.filter(r => r.from.type === type && r.from.id === id);
export const getRelationship = (id: string) => operationalRelationships.find(r => r.id === id);
