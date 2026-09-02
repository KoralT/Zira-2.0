// Sigma prototype — shared domain types

export type RoleId = 'sector-commander' | 'ops-officer' | 'intel-officer' | 'logistics-officer' | 'planning-officer';

export interface SigmaUser {
  id: string;
  name: string;
  role: RoleId;
  roleLabel: string;
  unit: string;
  initials: string;
}

export type MissionStatus = 'planned' | 'active' | 'paused' | 'completed';

export interface Mission {
  id: string;
  name: string;
  purpose: string;
  status: MissionStatus;
  statusLabel: string;
  stage: string;
  readiness: number; // 0-100
  previousReadiness?: number;
  ownerId: string;
  participantIds: string[];
  lastUpdated: string; // ISO
  timelineStart: string;
  timelineEnd: string;
  dueDate: string;
  riskLevel: 'low' | 'medium' | 'high';
  riskReason?: string;        // why the mission is at its current risk level
  readinessNote?: string;     // explanation of the latest readiness change (weighted model)
  blockersCount: number;
  openApprovalsCount: number;
  atRiskResourcesCount: number;
  sector: string;
  dependsOnMissionIds: string[];
  blockedByMissionIds: string[];
  evidenceIds: string[];
  directiveIds: string[];
  coord?: { x: number; y: number }; // schematic 0-100 position for the map instrument
}

export type ReadinessCategory = 'personnel' | 'intel' | 'resources' | 'planning' | 'approvals' | 'policy' | 'coordination';

export interface ReadinessItem {
  id: string;
  missionId: string;
  category: ReadinessCategory;
  categoryLabel: string;
  requirement: string;
  status: 'met' | 'partial' | 'missing';
  ownerId?: string;
  sourceId: string;
  lastUpdated: string;
  evidenceId?: string;
  requiresValidation: boolean;
}

export interface MissionResource {
  id: string;
  missionId: string;
  resourceId: string;
}

export interface Resource {
  id: string;
  name: string;
  type: string;
  quantity: string;
  availability: 'available' | 'partial' | 'unavailable';
  allocatedToMissionId?: string;
  conflict: boolean;
  conflictDescription?: string;
  alternatives: string[];
  ownerId?: string;
  sourceId: string;
}

export type DirectiveStatus = 'draft' | 'published' | 'cancelled' | 'superseded';

// A defined, per-mission consequence of publishing a directive. Distinguishes what actually
// changed for each mission — not just "affected".
export interface MissionImpact {
  missionId: string;
  impactType: string;      // e.g. 'ירידת מוכנות' | 'פער מדיניות'
  meaning: string;         // what it means operationally
  requiredAction: string;  // what the commander must do
  readinessFrom?: number;
  readinessTo?: number;
}

export interface Directive {
  id: string;
  title: string;
  content: string;
  type: string;
  status: DirectiveStatus;
  publishedById: string;
  publishedAt: string;
  effectiveDate: string;
  expiryDate?: string;
  audienceUnits: string[];
  audienceRoles: RoleId[];
  relatedMissionIds: string[];   // linked BEFORE publish (scope of possible impact)
  affectedMissionIds: string[];  // actually affected AFTER publish
  impacts: MissionImpact[];      // per-mission defined impact, populated on publish
  relatedAreas: string[];
  requiresAck: boolean;
  requiresAction: boolean;
  version: number;
  previousVersionId?: string;
  sourceRefs: string[];
  derivedTaskIds: string[];
  evidenceIds: string[];
  ackUserIds: string[]; // users who acknowledged
  affectedUserIds: string[]; // full audience resolved to users
}

export type TaskStatus = 'open' | 'in-progress' | 'done';
export type TaskSourceType = 'alert' | 'directive' | 'manual' | 'situation-assessment' | 'event';

export interface SigmaTask {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  missionId?: string;
  sourceType: TaskSourceType;
  sourceId?: string;
  status: TaskStatus;
  assigneeUserId: string;
  createdAt: string;
}

export interface Approval {
  id: string;
  title: string;
  missionId?: string;
  directiveId?: string;
  requiredFromUserId: string;
  status: 'pending' | 'approved' | 'rejected';
  waitingSince: string;
  missingItems: string[];
  riskLevel: 'low' | 'medium' | 'high';
  evidenceIds: string[];
}

export type AlertType = 'action-required' | 'anomaly' | 'context-changed' | 'risk-deadline' | 'information-gap';
export type AlertStatus = 'new' | 'read' | 'snoozed' | 'resolved' | 'escalated';

export interface EntityRef {
  type: 'mission' | 'directive' | 'resource' | 'approval' | 'unit' | 'area';
  id: string;
  label: string;
}

export interface AttentionAlert {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  relatedEntity: EntityRef;
  reasonForUser: string;
  detectedAt: string;
  sourceId: string;
  confidence: 'low' | 'medium' | 'high';
  recommendedAction: string;
  assignedToUserId?: string;
  status: AlertStatus;
}

// --- Operational Event (v1.1) — a discrete occurrence in the sector that may affect a
// decision. It is a decision TRIGGER, not a display object: an event with no possible
// decision/impact is suppressed (never surfaced to the commander). Reuses MissionImpact and
// feeds the SAME causal loop as directives (Attention · Recommendation · Timeline · handoff). ---
export type EventCategory = 'security-breach' | 'enemy-change' | 'readiness-fault' | 'safety' | 'field-report' | 'schedule-change';
export type EventStatus = 'new' | 'under-assessment' | 'linked' | 'handled' | 'closed';

export interface OperationalEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  categoryLabel: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: EventStatus;
  occurredAt: string;
  detectedAt: string;
  sector: string;
  relatedMissionIds: string[];
  impact?: MissionImpact;            // present only when the event affects a mission (decision trigger)
  sourceId: string;
  confidence: 'low' | 'medium' | 'high';
  assignedToUserId?: string;
  evidenceIds: string[];
  recommendedAction?: string;        // present when there is a recommended next action
  reasonForUser?: string;
  coord?: { x: number; y: number };  // schematic 0-100 position for the map instrument
  locationLabel?: string;
  // Control proof (prototype): a recorded handling outcome on close. This is a prototype
  // persistence field, NOT a canonical organizational-data / knowledge model.
  handlingOutcome?: string;
  handledAt?: string;
}

export interface EvidenceSource {
  id: string;
  sourceSystem: string;
  ownerUserId: string;
  lastUpdated: string;
  confidence: 'low' | 'medium' | 'high';
  hasContradiction: boolean;
  contradictionNote?: string;
  missingInfo: string[];
  relatedEntityIds: string[];
  deepLinkLabel: string;
  deepLinkUrl: string;
  reasoning: string;
  auditTrail: { timestamp: string; actor: string; action: string }[];
  validationStatus?: 'confirmed' | 'rejected' | 'outdated' | 'clarification-requested';
}

export type TimelineEventType = 'event' | 'status-change' | 'directive' | 'approval' | 'anomaly' | 'decision';

export interface TimelineEvent {
  id: string;
  timestamp: string;
  type: TimelineEventType;
  relatedEntity: EntityRef;
  description: string;
  actorUserId?: string;
}

export interface Decision {
  id: string;
  text: string;
  decidedById: string;
  timestamp: string;
  sessionId?: string;
  relatedMissionIds: string[];
}

export type KnowledgeType = 'decision' | 'lesson' | 'similar-op' | 'past-directive' | 'incident' | 'document';

export interface KnowledgeItem {
  id: string;
  type: KnowledgeType;
  title: string;
  summary: string;
  date: string;
  domain: string;
  unit: string;
  relevanceReason: string;
  confidence: 'low' | 'medium' | 'high';
  sourceLink: string;
  relatedMissionIds: string[];
  relatedResourceIds?: string[];
  // --- Knowledge continuity layer: a decision/context layer ON TOP of existing knowledge
  // infrastructure (SharePoint / drives) — Sigma references them, it does not replace them. ---
  fileKind?: 'folder' | 'document';        // when this item is a file/folder reference
  fileFormat?: string;                     // e.g. 'PDF' | 'DOCX' | 'XLSX' | 'תיקייה'
  sourceSystem?: string;                   // e.g. 'SharePoint — מפקדת גזרה צפון'
  ownerUserId?: string;                    // knowledge owner (freshness/trust)
  lastUpdated?: string;                    // source freshness
  deepLinkLabel?: string;                  // e.g. 'פתח ב-SharePoint'
  deepLinkUrl?: string;                    // read-only deep link into the source system
}

// --- Canonical Operation Context objects (Business-Logic Alignment; ציר לביא vertical slice) ---
// A route/axis as a first-class business object. Its OBSERVED current state is a sourced FACT that
// lives here — it is never written into a plan, so planned ≠ observed.
export interface OperationalRoute {
  id: string;
  label: string;
  observedState?: { condition: 'blocked' | 'viable'; sourceId: string; observedAt: string };
  validation?: 'validated' | 'unvalidated'; // for a known alternative whose suitability is not established
}

// An explicit, inspectable relationship between business objects (NOT a graph engine).
export type RelationKind = 'HAS_PLAN' | 'USES_ROUTE' | 'AFFECTS';
export interface OperationalRelationship {
  id: string;
  kind: RelationKind;
  from: { type: string; id: string };
  to: { type: string; id: string };
  note?: string;
}

// A mocked domain result from Geography (an external capability) — Spatial Evidence, NOT a GIS engine.
export interface SpatialEvidence {
  id: string;
  statement: string;            // the grounded spatial fact
  relatesEntityIds: string[];   // which entities it relates (route + operation/plan)
  provider: string;             // user-facing provider (e.g. 'גאוגרפיה')
  sourceId?: string;            // source system
  observedAt?: string;          // freshness, when available
  knownGaps?: string[];         // what remains unknown
}

// The canonical Operational Signal — the established operational MEANING, derived from facts +
// relationships + evidence. Distinct from Attention (relevance) and from Recommendation (advice).
export type InferenceClass = 'observed' | 'derived';
export type SignalLifecycle = 'open' | 'acknowledged' | 'resolved';
export interface OperationalSignal {
  id: string;
  subjectRefs: string[];        // operation / plan / route the meaning is about
  statement: string;            // what operational meaning has been established
  impact: string;               // the operational consequence
  evidenceRefs: string[];       // spatial-evidence ids, event ids
  relationshipRefs: string[];   // relationship ids used in the derivation
  inferenceClass: InferenceClass;
  knownGaps: string[];          // uncertainty / what is not established (never converted to advice)
  lifecycleStatus: SignalLifecycle;
  derivedAt: string;
  provider?: string;            // producer of the meaning (e.g. 'הקשר ומשמעות' — C&M)
}

// --- Movement plan (canonical) — PLANNED designation only. The route's OBSERVED state lives on the
// OperationalRoute; the plan never stores observed condition, so planned and observed never overwrite.
// Three concepts stay separate: plannedRoute (a route ref) · previousRoute (history) · known
// alternatives (contextual, outside the plan — see data/planning.ts / OperationalRoute.validation). ---
export interface MovementPlan {
  operationId: string;                                                          // HAS_PLAN anchor
  plannedRoute: { established: true; routeId: string } | { established: false }; // USES_ROUTE (planned)
  previousRoute?: { routeId: string };
  updatedAt?: string;
}

export interface WatchlistItem {
  id: string;
  userId: string;
  entityType: 'mission' | 'resource' | 'unit' | 'area' | 'directive';
  entityId: string;
  label: string;
  addedAt: string;
}

export type WidgetKind =
  | 'operational-map' | 'mission-status' | 'readiness' | 'resource-status' | 'timeline'
  | 'directive' | 'approval' | 'risk' | 'missing-information' | 'evidence-trust'
  | 'impact' | 'dependencies' | 'events-feed'
  | 'gantt' | 'blockers' | 'decisions-today' | 'fire' | 'means';

// Situation-assessment context — mirrors the reference SituationBoardBuilder model.
export type ContextType = 'single' | 'multi' | 'sector' | 'timewindow';

// --- Fire domain (תמונת אש ותקיפה) — new live domain ---
export interface FireItem {
  id: string;
  category: 'target' | 'strike-activity' | 'prescription' | 'strike-window' | 'strike-approval';
  categoryLabel: string;
  title: string;
  status: string;
  statusTone: 'red' | 'amber' | 'green' | 'gray';
  relatedMissionId?: string;
  sourceId: string;
  requiresValidation: boolean;
}

// --- Means / assets domain (הקצאת אמצעים) — new live domain ---
export interface MeansItem {
  id: string;
  name: string;
  type: 'collection' | 'strike' | 'fire' | 'observation';
  typeLabel: string;
  status: 'allocated' | 'partial' | 'pending' | 'unavailable';
  relatedMissionId?: string;
  sourceId: string;
}

export interface WidgetDef {
  id: string;
  kind: WidgetKind;
  name: string;
  description: string;
  sourceSystem: string;
  sourceColor: string;
  contexts: ContextType[];
  entityType: string;
  lastUpdated: string;
  actions: string[];
  sizes: ('small' | 'medium' | 'large')[];
  permissions: string;
}

export interface WidgetInstance {
  id: string;
  widgetKind: WidgetKind;
  size: 'small' | 'medium' | 'large';
  filterMissionId?: string;
}

export interface SituationAssessmentSession {
  id: string;
  templateName: string;
  createdById: string;
  createdAt: string;
  timeWindow: string;
  scopeMissionIds: string[];
  widgetInstances: WidgetInstance[];
  decisions: Decision[];
  derivedTaskIds: string[];
  status: 'draft' | 'published';
  publishedSummary?: string;
  snapshotAt?: string;
}
