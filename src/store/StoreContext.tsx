import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  seedAlerts, seedTasks, seedApprovals, seedWatchlist, directives as seedDirectives,
  timelineEvents as seedTimelineEvents, decisions as seedDecisions, evidenceSources as seedEvidence,
  missions as seedMissions, readinessItems as seedReadinessItems, operationalEvents as seedEvents,
  DEFAULT_USER_ID, getMission, users,
} from '../data';
import type {
  AttentionAlert, AlertStatus, SigmaTask, Approval, Directive, WatchlistItem,
  SituationAssessmentSession, Decision, TimelineEvent, EvidenceSource, TaskSourceType, EntityRef,
  Mission, ReadinessItem, MissionImpact, OperationalEvent, MovementPlan,
} from '../data/types';
import { seedMovementPlans } from '../data/planning';

// v2: the canonical Operation Context model (ce9d523) changed the MovementPlan shape. Bumping the
// key discards incompatible pre-canonical persisted state so the derived Attention hero always
// renders from the seed rather than being silently suppressed by a stale plan blob.
const STORAGE_KEY = 'sigma-prototype-store-v2';

interface StoreState {
  currentUserId: string;
  alerts: AttentionAlert[];
  tasks: SigmaTask[];
  approvals: Approval[];
  directives: Directive[];
  missions: Mission[];
  readinessItems: ReadinessItem[];
  operationalEvents: OperationalEvent[];
  watchlist: WatchlistItem[];
  sessions: SituationAssessmentSession[];
  decisions: Decision[];
  timelineEvents: TimelineEvent[];
  evidence: EvidenceSource[];
  movementPlans: Record<string, MovementPlan>;
}

function initialState(): StoreState {
  return {
    currentUserId: DEFAULT_USER_ID,
    alerts: seedAlerts,
    tasks: seedTasks,
    approvals: seedApprovals,
    directives: seedDirectives,
    missions: seedMissions,
    readinessItems: seedReadinessItems,
    operationalEvents: seedEvents,
    watchlist: seedWatchlist,
    sessions: [],
    decisions: seedDecisions,
    timelineEvents: seedTimelineEvents,
    evidence: seedEvidence,
    movementPlans: seedMovementPlans,
  };
}

function loadState(): StoreState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    // Merge over defaults so a store persisted before a new key existed still gets it.
    if (raw) return { ...initialState(), ...(JSON.parse(raw) as Partial<StoreState>) } as StoreState;
  } catch {
    /* ignore corrupt storage */
  }
  return initialState();
}

const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
const nowIso = () => new Date().toISOString();
// The policy readiness requirement carries 21 of the 100 readiness points; blocking it
// deterministically removes exactly that weight. This makes the 82→61 drop explainable, not magic.
const POLICY_REQUIREMENT_WEIGHT = 21;

export interface PublishImpactSummary {
  directiveId: string;
  directiveTitle: string;
  affectedMissionsCount: number;
  primaryMissionId?: string;
  blockedReadinessId?: string;
  createdAlertIds: string[];
  createdTaskId?: string;
  taskAssigneeName?: string;
  readinessDrop?: { missionName: string; from: number; to: number };
  impacts: MissionImpact[];
  alertsCreatedCount: number;
  tasksCreatedCount: number;
  ackRequiredCount: number;
  ackedCount: number;
  alreadyApplied: boolean;
}

interface StoreApi extends StoreState {
  setCurrentUserId: (id: string) => void;
  updateAlertStatus: (id: string, status: AlertStatus, assigneeUserId?: string) => void;
  createTask: (input: { title: string; priority: 'low' | 'medium' | 'high'; dueDate: string; missionId?: string; assigneeUserId: string; sourceType: TaskSourceType; sourceId?: string }) => SigmaTask;
  updateTaskStatus: (id: string, status: SigmaTask['status']) => void;
  ackDirective: (directiveId: string, userId: string) => void;
  createDirective: (input: Omit<Directive, 'id' | 'version' | 'ackUserIds' | 'derivedTaskIds' | 'evidenceIds' | 'status' | 'affectedMissionIds' | 'impacts'> & { status: Directive['status'] }) => Directive;
  updateDirectiveStatus: (directiveId: string, status: Directive['status']) => void;
  updateApprovalStatus: (approvalId: string, status: Approval['status']) => void;
  addWatchlist: (item: Omit<WatchlistItem, 'id' | 'addedAt'>) => void;
  removeWatchlist: (id: string) => void;
  createSession: (input: { templateName: string; timeWindow: string; scopeMissionIds: string[] }) => SituationAssessmentSession;
  updateSession: (id: string, patch: Partial<SituationAssessmentSession>) => void;
  addDecisionToSession: (sessionId: string, text: string) => void;
  finishSession: (sessionId: string, summary: string) => void;
  validateEvidence: (id: string, status: EvidenceSource['validationStatus']) => void;
  logTimeline: (entry: Omit<TimelineEvent, 'id' | 'timestamp'>) => void;
  publishDirectiveWithImpact: (directiveId: string) => PublishImpactSummary | null;
  resetDemoScenario: (directiveId: string) => void;
  applyEventImpact: (eventId: string) => EventImpactSummary | null;
  resetEventScenario: (eventId: string) => void;
  // Control proof (prototype): the ONE meaningful transition — record a handling outcome and close
  // the event. Deliberately narrow: it does NOT create tasks, change risk/readiness/blockers, or
  // create alerts (unlike applyEventImpact). It appends a single Timeline entry as the prototype's
  // continuity/persistence mechanism only.
  closeEvent: (eventId: string, outcome: string) => void;
  // Planning slice 1 — the single valid movement-plan transition: record that no alternative route
  // has been established. Moves the current planned route to previous/context; never sets an
  // unvalidated alternative as the planned route.
  recordNoAlternativeRoute: (opId: string) => void;
  resetDemo: () => void;
}

export interface EventImpactSummary {
  eventId: string;
  eventTitle: string;
  missionId?: string;
  missionName?: string;
  createdTaskId?: string;
  taskAssigneeName?: string;
  riskRaised: boolean;
  alreadyApplied: boolean;
}

const StoreContext = createContext<StoreApi | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreState>(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const api = useMemo<StoreApi>(() => {
    const logTimeline: StoreApi['logTimeline'] = (entry) => {
      setState(prev => ({
        ...prev,
        timelineEvents: [{ id: uid('te'), timestamp: nowIso(), ...entry }, ...prev.timelineEvents],
      }));
    };

    return {
      ...state,
      setCurrentUserId: (id) => setState(prev => ({ ...prev, currentUserId: id })),

      updateAlertStatus: (id, status, assigneeUserId) => {
        setState(prev => ({
          ...prev,
          alerts: prev.alerts.map(a => a.id === id ? { ...a, status, assignedToUserId: assigneeUserId ?? a.assignedToUserId } : a),
        }));
        const alert = state.alerts.find(a => a.id === id);
        if (alert) {
          logTimeline({
            type: 'status-change',
            relatedEntity: alert.relatedEntity,
            description: `התראה "${alert.title}" עודכנה לסטטוס: ${status}.`,
          });
        }
      },

      createTask: (input) => {
        const task: SigmaTask = { id: uid('t'), status: 'open', createdAt: nowIso(), ...input };
        setState(prev => ({ ...prev, tasks: [task, ...prev.tasks] }));
        logTimeline({
          type: 'event',
          relatedEntity: input.missionId
            ? { type: 'mission', id: input.missionId, label: getMission(input.missionId)?.name ?? input.missionId }
            : { type: 'unit', id: 'general', label: 'כללי' },
          description: `נוצרה משימת המשך: "${input.title}".`,
        });
        return task;
      },

      updateTaskStatus: (id, status) => {
        setState(prev => ({ ...prev, tasks: prev.tasks.map(t => t.id === id ? { ...t, status } : t) }));
      },

      ackDirective: (directiveId, userId) => {
        setState(prev => ({
          ...prev,
          directives: prev.directives.map(d => d.id === directiveId && !d.ackUserIds.includes(userId)
            ? { ...d, ackUserIds: [...d.ackUserIds, userId] }
            : d),
        }));
        const directive = state.directives.find(d => d.id === directiveId);
        const user = users.find(u => u.id === userId);
        if (directive && !directive.ackUserIds.includes(userId)) {
          logTimeline({
            type: 'directive',
            relatedEntity: { type: 'directive', id: directive.id, label: directive.title },
            description: `${user?.name ?? userId} אישר/ה קריאה להנחיה: "${directive.title}".`,
            actorUserId: userId,
          });
        }
      },

      createDirective: (input) => {
        const directive: Directive = {
          id: uid('d'), version: 1, ackUserIds: [], derivedTaskIds: [], evidenceIds: [],
          affectedMissionIds: [], impacts: [], ...input,
        };
        setState(prev => ({ ...prev, directives: [directive, ...prev.directives] }));
        logTimeline({
          type: 'directive',
          relatedEntity: { type: 'directive', id: directive.id, label: directive.title },
          description: `הנחיה חדשה פורסמה: "${directive.title}".`,
        });
        return directive;
      },

      updateDirectiveStatus: (directiveId, status) => {
        setState(prev => ({ ...prev, directives: prev.directives.map(d => d.id === directiveId ? { ...d, status } : d) }));
        const directive = state.directives.find(d => d.id === directiveId);
        if (directive) {
          logTimeline({
            type: 'directive',
            relatedEntity: { type: 'directive', id: directive.id, label: directive.title },
            description: `סטטוס ההנחיה "${directive.title}" עודכן ל: ${status}.`,
          });
        }
      },

      updateApprovalStatus: (approvalId, status) => {
        setState(prev => ({ ...prev, approvals: prev.approvals.map(a => a.id === approvalId ? { ...a, status } : a) }));
        const approval = state.approvals.find(a => a.id === approvalId);
        if (approval) {
          const mission = approval.missionId ? getMission(approval.missionId) : undefined;
          const statusLabel = status === 'approved' ? 'אושר' : status === 'rejected' ? 'נדחה' : 'ממתין';
          logTimeline({
            type: 'approval',
            relatedEntity: mission ? { type: 'mission', id: mission.id, label: mission.name } : { type: 'unit', id: 'general', label: 'כללי' },
            description: `אישור "${approval.title}" ${statusLabel}.`,
          });
        }
      },

      addWatchlist: (item) => {
        setState(prev => ({ ...prev, watchlist: [{ id: uid('wl'), addedAt: nowIso(), ...item }, ...prev.watchlist] }));
      },

      removeWatchlist: (id) => {
        setState(prev => ({ ...prev, watchlist: prev.watchlist.filter(w => w.id !== id) }));
      },

      createSession: (input) => {
        const session: SituationAssessmentSession = {
          id: uid('sa'), createdById: state.currentUserId, createdAt: nowIso(),
          widgetInstances: [], decisions: [], derivedTaskIds: [], status: 'draft', ...input,
        };
        setState(prev => ({ ...prev, sessions: [session, ...prev.sessions] }));
        return session;
      },

      updateSession: (id, patch) => {
        setState(prev => ({ ...prev, sessions: prev.sessions.map(s => s.id === id ? { ...s, ...patch } : s) }));
      },

      addDecisionToSession: (sessionId, text) => {
        const decision: Decision = { id: uid('dec'), text, decidedById: state.currentUserId, timestamp: nowIso(), sessionId, relatedMissionIds: [] };
        setState(prev => ({
          ...prev,
          decisions: [decision, ...prev.decisions],
          sessions: prev.sessions.map(s => s.id === sessionId ? { ...s, decisions: [...s.decisions, decision] } : s),
        }));
      },

      finishSession: (sessionId, summary) => {
        setState(prev => ({
          ...prev,
          sessions: prev.sessions.map(s => s.id === sessionId ? { ...s, status: 'published', publishedSummary: summary, snapshotAt: nowIso() } : s),
        }));
        logTimeline({
          type: 'decision',
          relatedEntity: { type: 'unit', id: 'situation-assessment', label: 'הערכת מצב' } as EntityRef,
          description: `הערכת מצב פורסמה: ${summary}`,
        });
      },

      validateEvidence: (id, status) => {
        setState(prev => ({ ...prev, evidence: prev.evidence.map(e => e.id === id ? { ...e, validationStatus: status } : e) }));
      },

      logTimeline,

      // --- Central causal engine: publishing/updating "שינוי במדיניות אש" (or any directive)
      // fans out through the SAME shared store — no hidden pre-baked seed results. ---
      publishDirectiveWithImpact: (directiveId) => {
        const directive = state.directives.find(d => d.id === directiveId);
        if (!directive) return null;

        const now = nowIso();
        const wasPublished = directive.status === 'published';
        const alreadyApplied = directive.affectedMissionIds.length > 0;
        const relatedMissionIds = directive.relatedMissionIds;
        const affectedMissions = relatedMissionIds.map(id => state.missions.find(m => m.id === id)).filter((m): m is Mission => !!m);

        // Primary mission = the affected mission whose 'policy' readiness requirement will be blocked.
        const policyItemFor = (mid: string) => state.readinessItems.find(r => r.missionId === mid && r.category === 'policy');
        const primaryReadinessItem = affectedMissions.map(m => policyItemFor(m.id)).find(Boolean);
        const primaryMission = primaryReadinessItem ? affectedMissions.find(m => m.id === primaryReadinessItem!.missionId) : affectedMissions[0];
        const secondaryMissions = affectedMissions.filter(m => m.id !== primaryMission?.id);

        const fromReadiness = primaryMission?.readiness;
        const toReadiness = primaryMission ? Math.max(0, primaryMission.readiness - POLICY_REQUIREMENT_WEIGHT) : undefined;

        // Per-mission defined impact — each affected mission gets an explicit, distinct consequence.
        const impacts: MissionImpact[] = [];
        // The directive's consequence is expressed as a factual gap + its operational meaning + what
        // needs handling — NOT as a machine-computed readiness-point drop (severity is subjective).
        if (primaryMission) impacts.push({ missionId: primaryMission.id, impactType: 'פער מדיניות אש', meaning: 'מדיניות האש המעודכנת אינה מתוקפת מול קווי התיאום', requiredAction: 'תיאום מחדש מול קמ"ן ותיקוף קווי התיאום', readinessFrom: fromReadiness, readinessTo: toReadiness });
        secondaryMissions.forEach(m => impacts.push({ missionId: m.id, impactType: 'פער מדיניות', meaning: 'נדרש לוודא את התאמת המבצע למדיניות האש המעודכנת', requiredAction: 'תיקוף על ידי מפקד המבצע' }));
        const primaryImpact = primaryMission ? impacts.find(i => i.missionId === primaryMission.id) : undefined;

        const opsOfficer = users.find(u => u.role === 'ops-officer');
        const contextAlertId = `demo-${directiveId}-context`;
        const actionAlertId = `demo-${directiveId}-action`;
        const taskId = `demo-${directiveId}-task`;
        const readinessNote = primaryMission
          ? `המוכנות ירדה מ-${fromReadiness}% ל-${toReadiness}% משום שדרישת מדיניות קריטית (משקל ${POLICY_REQUIREMENT_WEIGHT} נק׳ מתוך 100 בציון המוכנות) עברה לסטטוס חסום / נדרש תיקוף בעקבות פרסום ההנחיה.`
          : undefined;

        const contextAlert: AttentionAlert = {
          id: contextAlertId, type: 'context-changed',
          title: `הנחיית "${directive.title}" פורסמה ומשפיעה על ${affectedMissions.length || 1} מבצעים`,
          description: `לאחר פרסום ההנחיה, ${affectedMissions.map(m => m.name).join(' ו-') || 'המבצעים הרלוונטיים'} מסומנים כמושפעים. לכל מבצע נגזרה השפעה מוגדרת ופעולה נדרשת.`,
          urgency: 'high', relatedEntity: { type: 'directive', id: directiveId, label: directive.title },
          reasonForUser: 'המבצעים המושפעים בתחום אחריותך.', detectedAt: now,
          sourceId: 'src-orders', confidence: 'high', recommendedAction: 'פתח/י את ההנחיה ובדוק/י את ההשפעה על כל מבצע.',
          assignedToUserId: primaryMission?.ownerId ?? directive.publishedById, status: 'new',
        };

        const actionAlert: AttentionAlert | null = primaryMission ? {
          id: actionAlertId, type: 'action-required',
          title: `נדרשת פעולה: פער במדיניות אש במבצע "${primaryMission.name}" בעקבות "${directive.title}"`,
          description: `דרישת "${primaryReadinessItem?.requirement ?? 'מדיניות האש'}" נחסמה, המבצע סומן בסיכון גבוה ומספר החסמים עלה. נדרש תיאום מחדש מול קמ"ן.`,
          urgency: 'critical', relatedEntity: { type: 'mission', id: primaryMission.id, label: primaryMission.name },
          reasonForUser: 'המבצע בטיפולך הישיר ודורש תיאום מחדש מול קמ"ן.', detectedAt: now,
          sourceId: 'src-ganttait', confidence: 'high', recommendedAction: 'תאם/י מחדש מול קמ"ן ועדכן/י Evidence.',
          assignedToUserId: opsOfficer?.id, status: 'new',
        } : null;

        const task: SigmaTask | null = primaryMission && opsOfficer ? {
          id: taskId, title: `לתאם מחדש דרישת מדיניות אש ולעדכן Evidence — ${primaryMission.name}`,
          priority: 'high', dueDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
          missionId: primaryMission.id, sourceType: 'directive', sourceId: directiveId,
          status: 'open', assigneeUserId: opsOfficer.id, createdAt: now,
        } : null;

        setState(prev => {
          const nextDirectives = prev.directives.map(d => d.id === directiveId
            ? { ...d, status: 'published' as const, publishedAt: d.status === 'published' ? d.publishedAt : now, version: wasPublished ? d.version + 1 : d.version, affectedMissionIds: relatedMissionIds, impacts }
            : d);

          const nextMissions = prev.missions.map(m => {
            if (alreadyApplied) return m;
            if (primaryMission && m.id === primaryMission.id) {
              return { ...m, readiness: toReadiness!, previousReadiness: fromReadiness, riskLevel: 'high' as const, riskReason: `דרישת מדיניות אש קריטית אינה מתוקפת בעקבות פרסום "${directive.title}".`, readinessNote, blockersCount: m.blockersCount + 1, lastUpdated: now };
            }
            if (secondaryMissions.some(s => s.id === m.id)) {
              return { ...m, riskLevel: m.riskLevel === 'low' ? ('medium' as const) : m.riskLevel, riskReason: `נדרש תיקוף התאמה למדיניות האש המעודכנת שפורסמה ב"${directive.title}".`, blockersCount: m.blockersCount + 1, lastUpdated: now };
            }
            return m;
          });

          const secondaryPolicyIds = secondaryMissions.map(s => policyItemFor(s.id)?.id).filter(Boolean);
          const nextReadinessItems = prev.readinessItems.map(r => {
            if (alreadyApplied) return r;
            if (primaryReadinessItem && r.id === primaryReadinessItem.id) return { ...r, status: 'missing' as const, requiresValidation: true, lastUpdated: now };
            if (secondaryPolicyIds.includes(r.id)) return { ...r, requiresValidation: true, lastUpdated: now };
            return r;
          });

          const upsertAlert = (list: AttentionAlert[], alert: AttentionAlert) =>
            list.some(a => a.id === alert.id) ? list.map(a => a.id === alert.id ? alert : a) : [alert, ...list];
          let nextAlerts = upsertAlert(prev.alerts, contextAlert);
          if (actionAlert) nextAlerts = upsertAlert(nextAlerts, actionAlert);

          const nextTasks = task
            ? (prev.tasks.some(t => t.id === task.id) ? prev.tasks.map(t => t.id === task.id ? task : t) : [task, ...prev.tasks])
            : prev.tasks;

          const nextEvidence = prev.evidence.map(e => directive.evidenceIds.includes(e.id)
            ? { ...e, auditTrail: [...e.auditTrail, { timestamp: now, actor: 'Sigma', action: `פרסום ההנחיה הפעיל את שרשרת ההשפעה: ${affectedMissions.length} מבצעים סומנו כמושפעים${primaryMission ? `, ובמבצע "${primaryMission.name}" נדרש תיאום מחדש ותיקוף קווי התיאום` : ''}.` }] }
            : e);

          const newTimelineEntries: TimelineEvent[] = [
            { id: uid(`demo-${directiveId}-te`), timestamp: now, type: 'directive', relatedEntity: { type: 'directive', id: directiveId, label: directive.title }, description: `הנחיה "${directive.title}" ${wasPublished ? 'עודכנה ופורסמה מחדש' : 'פורסמה'} (גרסה ${wasPublished ? directive.version + 1 : directive.version}).`, actorUserId: directive.publishedById },
            ...affectedMissions.map(m => ({ id: uid(`demo-${directiveId}-te`), timestamp: now, type: 'directive' as const, relatedEntity: { type: 'mission' as const, id: m.id, label: m.name }, description: `מבצע "${m.name}" סומן כמושפע מהנחיה: "${directive.title}" (${impacts.find(i => i.missionId === m.id)?.impactType ?? 'השפעה'}).` })),
            ...(primaryMission && !alreadyApplied ? [{ id: uid(`demo-${directiveId}-te`), timestamp: now, type: 'anomaly' as const, relatedEntity: { type: 'mission' as const, id: primaryMission.id, label: primaryMission.name }, description: `הנחיית "${directive.title}" יצרה פער בתוכנית המבצעית של "${primaryMission.name}": ${primaryImpact?.meaning ?? ''}. נדרש לטיפול: ${primaryImpact?.requiredAction ?? ''}.` }] : []),
            ...(primaryReadinessItem ? [{ id: uid(`demo-${directiveId}-te`), timestamp: now, type: 'event' as const, relatedEntity: { type: 'mission' as const, id: primaryReadinessItem.missionId, label: primaryMission?.name ?? primaryReadinessItem.missionId }, description: `דרישת מוכנות "${primaryReadinessItem.requirement}" עברה לסטטוס חסום / נדרש תיקוף.` }] : []),
            { id: uid(`demo-${directiveId}-te`), timestamp: now, type: 'event' as const, relatedEntity: { type: 'directive' as const, id: directiveId, label: directive.title }, description: `התראה חדשה נוצרה: "${contextAlert.title}".` },
            ...(actionAlert ? [{ id: uid(`demo-${directiveId}-te`), timestamp: now, type: 'event' as const, relatedEntity: { type: 'mission' as const, id: primaryMission!.id, label: primaryMission!.name }, description: `התראה חדשה נוצרה: "${actionAlert.title}".` }] : []),
            ...(task ? [{ id: uid(`demo-${directiveId}-te`), timestamp: now, type: 'event' as const, relatedEntity: { type: 'mission' as const, id: task.missionId ?? primaryMission!.id, label: primaryMission?.name ?? '' }, description: `נוצרה משימת המשך: "${task.title}".` }] : []),
          ];

          return {
            ...prev,
            directives: nextDirectives,
            missions: nextMissions,
            readinessItems: nextReadinessItems,
            alerts: nextAlerts,
            tasks: nextTasks,
            evidence: nextEvidence,
            timelineEvents: [...newTimelineEntries, ...prev.timelineEvents],
          };
        });

        return {
          directiveId,
          directiveTitle: directive.title,
          affectedMissionsCount: affectedMissions.length,
          primaryMissionId: primaryMission?.id,
          blockedReadinessId: primaryReadinessItem?.id,
          createdAlertIds: actionAlert ? [contextAlertId, actionAlertId] : [contextAlertId],
          createdTaskId: task?.id,
          taskAssigneeName: opsOfficer?.name,
          readinessDrop: primaryMission && !alreadyApplied ? { missionName: primaryMission.name, from: fromReadiness!, to: toReadiness! } : undefined,
          impacts,
          alertsCreatedCount: actionAlert ? 2 : 1,
          tasksCreatedCount: task ? 1 : 0,
          ackRequiredCount: directive.affectedUserIds.length,
          ackedCount: directive.ackUserIds.length,
          alreadyApplied,
        };
      },

      resetDemoScenario: (directiveId) => {
        const seedDirective = seedDirectives.find(d => d.id === directiveId);
        const contextAlertId = `demo-${directiveId}-context`;
        const actionAlertId = `demo-${directiveId}-action`;
        const taskId = `demo-${directiveId}-task`;
        const relatedMissionIds = seedDirective?.relatedMissionIds ?? [];

        setState(prev => ({
          ...prev,
          directives: prev.directives.map(d => d.id === directiveId && seedDirective ? { ...seedDirective } : d),
          missions: prev.missions.map(m => {
            const seedMission = relatedMissionIds.includes(m.id) ? seedMissions.find(sm => sm.id === m.id) : undefined;
            return seedMission ? { ...seedMission } : m;
          }),
          readinessItems: prev.readinessItems.map(r => {
            if (!relatedMissionIds.includes(r.missionId)) return r;
            const seedItem = seedReadinessItems.find(sr => sr.id === r.id);
            return seedItem ? { ...seedItem } : r;
          }),
          alerts: prev.alerts.filter(a => a.id !== contextAlertId && a.id !== actionAlertId),
          tasks: prev.tasks.filter(t => t.id !== taskId),
          evidence: prev.evidence.map(e => {
            const seedEv = seedEvidence.find(se => se.id === e.id);
            return seedDirective?.evidenceIds.includes(e.id) && seedEv ? { ...seedEv } : e;
          }),
          timelineEvents: prev.timelineEvents.filter(t => !t.id.startsWith(`demo-${directiveId}-`)),
        }));
      },

      // --- Event → decision loop (v1.1): the SAME causal engine as directives, entered from an
      // operational event. Event → impact on mission → handoff task → risk/blocker propagation →
      // Timeline. The event itself is the Attention/Recommendation decision item; this applies its
      // consequence and routes the follow-up. Idempotent (deterministic `event-${id}-*`). ---
      applyEventImpact: (eventId) => {
        const event = state.operationalEvents.find(e => e.id === eventId);
        if (!event || !event.impact) return null;

        const now = nowIso();
        const alreadyApplied = event.status === 'handled';
        const mission = state.missions.find(m => m.id === event.impact!.missionId);
        const opsOfficer = users.find(u => u.role === 'ops-officer');
        const taskId = `event-${eventId}-task`;
        const raiseRisk = event.severity === 'high' || event.severity === 'critical';
        const nextRisk = (r: Mission['riskLevel']): Mission['riskLevel'] => r === 'low' ? 'medium' : 'high';

        const task: SigmaTask | null = mission && opsOfficer ? {
          id: taskId, title: `טיפול באירוע — ${event.impact.requiredAction} (${mission.name})`,
          priority: raiseRisk ? 'high' : 'medium', dueDate: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
          missionId: mission.id, sourceType: 'event', sourceId: eventId,
          status: 'open', assigneeUserId: opsOfficer.id, createdAt: now,
        } : null;

        setState(prev => {
          const nextEvents = prev.operationalEvents.map(e => e.id === eventId
            ? { ...e, status: 'handled' as const, assignedToUserId: opsOfficer?.id ?? e.assignedToUserId }
            : e);

          const nextMissions = prev.missions.map(m => {
            if (alreadyApplied || !mission || m.id !== mission.id) return m;
            return {
              ...m,
              riskLevel: raiseRisk ? nextRisk(m.riskLevel) : m.riskLevel,
              riskReason: `אירוע "${event.title}" משפיע על המבצע — ${event.impact!.meaning}.`,
              blockersCount: m.blockersCount + 1,
              lastUpdated: now,
            };
          });

          const nextTasks = task
            ? (prev.tasks.some(t => t.id === task.id) ? prev.tasks.map(t => t.id === task.id ? task : t) : [task, ...prev.tasks])
            : prev.tasks;

          const newTimeline: TimelineEvent[] = [
            { id: uid(`event-${eventId}-te`), timestamp: now, type: 'decision', relatedEntity: mission ? { type: 'mission', id: mission.id, label: mission.name } : { type: 'area', id: event.sector, label: event.sector }, description: `טופל אירוע "${event.title}" — נפתחה שרשרת טיפול${mission ? ` על מבצע "${mission.name}"` : ''}.`, actorUserId: state.currentUserId },
            ...(mission && !alreadyApplied ? [{ id: uid(`event-${eventId}-te`), timestamp: now, type: 'anomaly' as const, relatedEntity: { type: 'mission' as const, id: mission.id, label: mission.name }, description: `אירוע "${event.title}" סומן כמשפיע על המבצע (${event.impact!.impactType})${raiseRisk ? ' והסיכון עודכן' : ''}.` }] : []),
            ...(task ? [{ id: uid(`event-${eventId}-te`), timestamp: now, type: 'event' as const, relatedEntity: { type: 'mission' as const, id: task.missionId ?? mission!.id, label: mission?.name ?? '' }, description: `נוצרה משימת המשך: "${task.title}".` }] : []),
          ];

          return {
            ...prev,
            operationalEvents: nextEvents,
            missions: nextMissions,
            tasks: nextTasks,
            timelineEvents: [...newTimeline, ...prev.timelineEvents],
          };
        });

        return {
          eventId, eventTitle: event.title,
          missionId: mission?.id, missionName: mission?.name,
          createdTaskId: task?.id, taskAssigneeName: opsOfficer?.name,
          riskRaised: raiseRisk && !alreadyApplied, alreadyApplied,
        };
      },

      resetEventScenario: (eventId) => {
        const seedEvent = seedEvents.find(e => e.id === eventId);
        const missionId = seedEvent?.impact?.missionId;
        const taskId = `event-${eventId}-task`;
        setState(prev => ({
          ...prev,
          operationalEvents: prev.operationalEvents.map(e => e.id === eventId && seedEvent ? { ...seedEvent } : e),
          missions: prev.missions.map(m => {
            const seedMission = missionId && m.id === missionId ? seedMissions.find(sm => sm.id === m.id) : undefined;
            return seedMission ? { ...seedMission } : m;
          }),
          tasks: prev.tasks.filter(t => t.id !== taskId),
          timelineEvents: prev.timelineEvents.filter(t => !t.id.startsWith(`event-${eventId}-`)),
        }));
      },

      closeEvent: (eventId, outcome) => {
        const event = state.operationalEvents.find(e => e.id === eventId);
        const now = nowIso();
        setState(prev => ({
          ...prev,
          operationalEvents: prev.operationalEvents.map(e => e.id === eventId
            ? { ...e, status: 'closed' as const, handlingOutcome: outcome, handledAt: now }
            : e),
        }));
        if (event) {
          const mission = event.impact?.missionId ? getMission(event.impact.missionId) : undefined;
          logTimeline({
            type: 'decision',
            relatedEntity: mission
              ? { type: 'mission', id: mission.id, label: mission.name }
              : { type: 'area', id: event.sector, label: event.sector } as EntityRef,
            description: `אירוע "${event.title}" טופל ונסגר — ${outcome}`,
          });
        }
      },

      recordNoAlternativeRoute: (opId) => {
        setState(prev => {
          const plan = prev.movementPlans[opId];
          if (!plan) return prev;
          const previousRoute = plan.plannedRoute.established
            ? { routeId: plan.plannedRoute.routeId }
            : plan.previousRoute;
          const opName = prev.missions.find(m => m.id === opId)?.name ?? opId;
          const now = nowIso();
          // Continuity: the human action is a real decision — record it so בשבילי reflects it. This
          // does NOT resolve the OperationalSignal (no viable route still holds).
          const timelineEntry = {
            id: uid(`plan-${opId}-te`), timestamp: now, type: 'decision' as const,
            relatedEntity: { type: 'mission' as const, id: opId, label: opName },
            description: `תוכנית התנועה של "${opName}" עודכנה — טרם נקבע מסלול חלופי מתוקף.`,
          };
          return {
            ...prev,
            movementPlans: {
              ...prev.movementPlans,
              [opId]: { operationId: opId, plannedRoute: { established: false }, previousRoute, updatedAt: now },
            },
            timelineEvents: [timelineEntry, ...prev.timelineEvents],
          };
        });
      },

      resetDemo: () => {
        localStorage.removeItem(STORAGE_KEY);
        setState(initialState());
      },
    };
  }, [state]);

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
