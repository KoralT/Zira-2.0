import type { SpatialEvidence } from './types';

// Spatial Evidence — a MOCKED domain result from Geography (an external capability). It is NOT a GIS
// engine and performs no computation: it is a stated, sourced spatial fact with provenance and a
// known gap. The grounded claim stays at the level the fixtures support (the block is ON the planned
// route) — it does NOT claim a computed segment-level intersection.
export const spatialEvidence: SpatialEvidence[] = [
  {
    id: 'se-lavi-block',
    statement: 'החסימה שדווחה חלה על ציר לביא — הציר המשמש כמסלול הגישה המתוכנן בתוכנית התנועה של אופק צפוני.',
    relatesEntityIds: ['ax-lavi', 'm1'],
    provider: 'גאוגרפיה',
    sourceId: 'src-gis',
    observedAt: '2026-07-22T05:20:00',
    knownGaps: ['היקף ומשך החסימה טרם ידועים'],
  },
];

export const getSpatialEvidence = (id: string) => spatialEvidence.find(s => s.id === id);
