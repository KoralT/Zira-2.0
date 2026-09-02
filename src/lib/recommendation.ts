import type { AttentionAlert, Mission, ReadinessItem, Directive, Approval, EvidenceSource, OperationalEvent } from '../data/types';
import { computeAlertPriority } from './priority';
import { deriveScheduleShiftInsight } from './contextInsight';

// The Recommendation Contract, made concrete (v1.0 capability #15).
// Every field is DERIVED from existing store data — never fabricated. When Sigma cannot
// responsibly recommend, the contract degrades to `no-recommendation` and says so, rather
// than inventing a recommendation, a confidence, or an alternative.

export interface RecommendationContract {
  state: 'recommend' | 'no-recommendation';
  situation?: string;                            // what happened, plain language — the LEAD (commander-first)
  impact?: string;                               // what it means / affects (the emergent connection)
  requiredAttention?: string;                    // what needs reassessment/action, when there is no formulated decision
  reasoningChain?: string[];                     // derived reasoning, step by step — inline progressive disclosure
  decision?: string;                             // the choice framed for the commander, e.g. "לאשר · או לדחות"
  headline: string;                              // the recommended next action, as a verb (Sigma's pick)
  confidence?: 'low' | 'medium' | 'high';
  confidenceReason?: string;                     // why we're this sure (source-based, honest)
  consequence?: string;                          // consequence of INACTION
  alternatives: string[];                        // real alternative paths; [] when none exist
  tradeoffs?: { act: string; inaction: string }; // "אם תטפל… · אם לא… "
  evidenceId?: string;                           // one click to the basis
  sourceLabel?: string;
  note?: string;                                 // honesty note (e.g. low-confidence caveat)
}

export interface RecommendationDeriveCtx {
  missionById: (id: string) => Mission | undefined;
  readinessItems: ReadinessItem[];
  directives: Directive[];
  approvals: Approval[];
  evidence: EvidenceSource[];
  sourceNameById?: (id: string) => string | undefined;
}

// Consequence of leaving an alert untreated — built from the same live signals the priority
// engine uses (linked-mission risk + deadline), so it is defensible, not decorative.
function alertInactionConsequence(alert: AttentionAlert, mission: Mission | undefined): string | undefined {
  if (mission) {
    if (mission.riskLevel === 'high') return `אי-טיפול משאיר את "${mission.name}" בסיכון גבוה וללא תיאום מחדש.`;
    if (mission.blockersCount > 0) return `אי-טיפול משאיר ${mission.blockersCount} חסמים פתוחים ב"${mission.name}".`;
    if (mission.riskLevel === 'medium') return `אי-טיפול עלול להעלות את הסיכון ב"${mission.name}".`;
  }
  if (alert.urgency === 'critical' || alert.urgency === 'high') return 'פריט קריטי שיישאר פתוח וללא בעל טיפול.';
  return undefined;
}

export function recommendationFromAlert(alert: AttentionAlert, ctx: RecommendationDeriveCtx): RecommendationContract {
  const mission = alert.relatedEntity.type === 'mission' ? ctx.missionById(alert.relatedEntity.id) : undefined;
  const relatedEvidence = ctx.evidence.find(e => e.relatedEntityIds.includes(alert.relatedEntity.id));
  const sourceLabel = ctx.sourceNameById?.(alert.sourceId) ?? alert.sourceId;

  // Without a concrete recommended action there is no recommendation — say so honestly.
  if (!alert.recommendedAction || alert.recommendedAction.trim() === '') {
    const priority = computeAlertPriority(alert, ctx.missionById);
    return {
      state: 'no-recommendation',
      headline: alert.title,
      consequence: alertInactionConsequence(alert, mission) ?? priority.reason,
      alternatives: [],
      evidenceId: relatedEvidence?.id,
      sourceLabel,
      note: 'Sigma לא מגבשת כאן פעולה מומלצת — מוצג הפריט והבסיס בלבד. ההחלטה בידיך.',
    };
  }

  const consequence = alertInactionConsequence(alert, mission);
  const confidenceReason = mission
    ? `מבוסס על ${sourceLabel} ועל מצב מבצע "${mission.name}".`
    : `מבוסס על ${sourceLabel}.`;

  // Real alternative paths that the system actually supports (not invented tactics).
  const alternatives = ['הקצאה לבעל תפקיד מתאים לטיפול', 'השהיה עד לתיקוף המקור'];

  // The choice framed for the commander, by what kind of attention item this is.
  const ALERT_DECISION: Record<string, string> = {
    'action-required': 'לטפל עכשיו · או לדחות',
    'risk-deadline': 'לטפל עכשיו · או לדחות את היעד',
    'anomaly': 'לבדוק ולפעול · או לסמן כמובן',
    'context-changed': 'לבחון את המשמעות · או לסמן כמובן',
    'information-gap': 'לתקף את המידע · או להמשיך בלעדיו',
  };

  return {
    state: 'recommend',
    situation: alert.title,                       // what happened, in plain language — the lead
    decision: ALERT_DECISION[alert.type],
    headline: alert.recommendedAction,            // Sigma's pick within that choice
    confidence: alert.confidence,
    confidenceReason,
    consequence,
    alternatives,
    tradeoffs: consequence ? { act: alert.recommendedAction, inaction: consequence } : undefined,
    evidenceId: relatedEvidence?.id,
    sourceLabel,
    note: alert.confidence === 'low' ? 'ביטחון נמוך — מומלץ לתקף את המקור לפני פעולה.' : undefined,
  };
}

// An operational event, expressed as a recommendation (v1.1). Derived only from the event's own
// assessed fields — an event with no impact and no recommended action returns no-recommendation
// (and is suppressed upstream, so this never fabricates a decision).
export function recommendationFromEvent(event: OperationalEvent, ctx: RecommendationDeriveCtx): RecommendationContract {
  // GP1 — schedule-change: the meaning is DERIVED cross-source, and Sigma recommends only when the
  // data justifies a validated resolution (here it does not → honest no-recommendation).
  if (event.category === 'schedule-change') {
    const ins = deriveScheduleShiftInsight(event, { missionById: ctx.missionById, approvals: ctx.approvals });
    const srcLabel = ctx.sourceNameById?.(event.sourceId) ?? event.sourceId;
    if (ins) {
      return {
        state: ins.recommendation ? 'recommend' : 'no-recommendation',
        situation: ins.situation,
        impact: ins.meaning,
        consequence: ins.consequence,
        requiredAttention: ins.requiredAttention,
        reasoningChain: ins.chain,
        headline: ins.recommendation ?? ins.requiredAttention,
        confidence: event.confidence,
        confidenceReason: `דווח ממקור ${srcLabel} · ${event.categoryLabel}. Sigma חיברה בין שינוי הלוז, הקצאת המשאב ותוקף האישור.`,
        alternatives: ins.alternativeFact ? [ins.alternativeFact] : [],
        evidenceId: event.evidenceIds[0],
        sourceLabel: srcLabel,
        note: ins.recommendation ? undefined : 'זיהיתי מה דורש בחינה מחדש, אך איני ממליצה כרגע על פתרון ספציפי — אין בנתונים חלופה מתוקפת.',
      };
    }
  }

  const mission = event.impact ? ctx.missionById(event.impact.missionId) : undefined;
  const sourceLabel = ctx.sourceNameById?.(event.sourceId) ?? event.sourceId;
  const headline = event.recommendedAction ?? event.impact?.requiredAction;

  if (!headline) {
    return {
      state: 'no-recommendation',
      headline: event.title,
      alternatives: [],
      evidenceId: event.evidenceIds[0],
      sourceLabel,
      note: 'אירוע ללא השלכה החלטתית — לא מוצף לטיפול.',
    };
  }

  const consequence = event.impact
    ? `${event.impact.meaning}${mission ? ` — חשיפה למבצע "${mission.name}"` : ''}.`
    : undefined;

  return {
    state: 'recommend',
    situation: event.title,                       // the event itself — what happened
    decision: 'לטפל עכשיו · או למסור לטיפול',
    headline,
    confidence: event.confidence,
    confidenceReason: `דווח ממקור ${sourceLabel} · ${event.categoryLabel}${event.locationLabel ? ` · ${event.locationLabel}` : ''}.`,
    consequence,
    alternatives: ['מסירה לבעל תפקיד אחר לטיפול', 'סימון כאירוע ללא טיפול (Override)'],
    tradeoffs: consequence ? { act: `${headline} — ותיפתח שרשרת טיפול מנוהלת.`, inaction: consequence } : undefined,
    evidenceId: event.evidenceIds[0],
    sourceLabel,
    note: event.confidence === 'low' ? 'ביטחון נמוך — מומלץ לתקף את המקור לפני פעולה.' : undefined,
  };
}

// A pending approval, expressed as a recommendation. Sigma RECOMMENDS — it never limits: the
// commander can approve even with missing deliverables; Sigma states the meaning of doing so and
// advises completing them first. The human owns the decision.
export function recommendationFromApproval(approval: Approval, ctx: RecommendationDeriveCtx): RecommendationContract {
  const mission = approval.missionId ? ctx.missionById(approval.missionId) : undefined;
  const missing = approval.missingItems.filter(Boolean);
  const consequence = missing.length > 0
    ? `אישור ללא [${missing.join(', ')}] משמעו שהמבצע יאושר בלי שהתנאים תוקפו.`
    : `האישור ממתין ומעכב את קידום ${mission ? `"${mission.name}"` : 'המבצע'}.`;
  return {
    state: 'recommend',
    situation: mission ? `מבצע "${mission.name}" ממתין להחלטתך כדי להתקדם — ${approval.title}.` : `${approval.title} ממתין לאישורך.`,
    decision: missing.length > 0 ? 'לאשר עכשיו · או להשלים תנאים תחילה' : 'לאשר · או לדחות',
    headline: 'לאשר את הבקשה',
    confidence: missing.length > 0 ? 'medium' : 'high',
    confidenceReason: missing.length > 0 ? `חסרים תנאים: ${missing.join(', ')}.` : 'כל תנאי הסף התקיימו.',
    consequence,
    alternatives: ['דחיית האישור', ...(missing.length > 0 ? ['השלמת התנאים החסרים תחילה'] : [])],
    tradeoffs: { act: 'אישור יקדם את מוכנות המבצע ויירשם ב-Timeline.', inaction: consequence },
    evidenceId: approval.evidenceIds[0],
    note: missing.length > 0 ? 'Sigma ממליצה להשלים את התנאים תחילה — אך אינה מגבילה. ההחלטה בידיך.' : undefined,
  };
}

// The mission's recommended next action, derived from the active directive impact and/or a
// pending approval. Where an approval is pending, the executable (Layer-3) path is preferred.
export function recommendationFromMission(mission: Mission, ctx: RecommendationDeriveCtx): RecommendationContract {
  const impactingDirective = ctx.directives.find(d => d.status === 'published' && d.affectedMissionIds.includes(mission.id) && d.impacts.some(i => i.missionId === mission.id));
  const impact = impactingDirective?.impacts.find(i => i.missionId === mission.id);
  const pendingApproval = ctx.approvals.find(a => a.missionId === mission.id && a.status === 'pending');
  const blockedPolicy = ctx.readinessItems.find(r => r.missionId === mission.id && r.status === 'missing');
  const evidenceForMission = ctx.evidence.find(e => e.relatedEntityIds.includes(mission.id));

  // No active impact and no pending decision → nothing to recommend; show status + evidence.
  if (!impact && !pendingApproval) {
    return {
      state: 'no-recommendation',
      headline: `מוכנות ${mission.readiness}% · ${mission.riskLevel === 'high' ? 'סיכון גבוה' : mission.riskLevel === 'medium' ? 'סיכון בינוני' : 'סיכון נמוך'}`,
      alternatives: [],
      evidenceId: evidenceForMission?.id,
      note: 'אין כרגע החלטה פתוחה למבצע זה — מוצג מצב המבצע בלבד.',
    };
  }

  // Prefer the in-system executable path when an approval is pending.
  if (pendingApproval) {
    const missing = pendingApproval.missingItems.filter(Boolean);
    const consequence = missing.length > 0
      ? `אישור ללא [${missing.join(', ')}] משמעו שהמבצע יאושר בלי שהתנאים תוקפו.`
      : impact
        ? `${impact.meaning}. ${impact.requiredAction}.`
        : `האישור "${pendingApproval.title}" ממתין ומעכב את קידום המבצע.`;
    return {
      state: 'recommend',
      situation: `מבצע "${mission.name}" ממתין להחלטתך כדי להתקדם — ${pendingApproval.title}.`,
      decision: missing.length > 0 ? 'לאשר עכשיו · או להשלים תנאים תחילה' : 'לאשר · או לדחות',
      headline: 'לאשר את הבקשה',
      confidence: missing.length > 0 ? 'medium' : 'high',
      confidenceReason: missing.length > 0 ? `חסרים תנאים: ${missing.join(', ')}.` : 'כל תנאי הסף התקיימו.',
      consequence,
      alternatives: ['דחיית האישור', ...(missing.length > 0 ? ['השלמת התנאים החסרים תחילה'] : []), ...(impact ? ['פתיחת ההנחיה לבחינת ההשפעה'] : [])],
      tradeoffs: { act: 'אישור יקדם את מוכנות המבצע ויירשם ב-Timeline.', inaction: consequence },
      evidenceId: pendingApproval.evidenceIds[0] ?? evidenceForMission?.id,
      sourceLabel: impactingDirective?.title,
      note: missing.length > 0 ? 'Sigma ממליצה להשלים את התנאים תחילה — אך אינה מגבילה. ההחלטה בידיך.' : undefined,
    };
  }

  // Impact present but no in-system approval → recommend the required action; the place to act
  // is the source directive (Sigma orchestrates; the commander owns the operational step).
  const consequence = `${impact!.meaning}${blockedPolicy ? ` — דרישת "${blockedPolicy.requirement}" חסומה` : ''}.`;
  return {
    state: 'recommend',
    situation: `מבצע "${mission.name}" הושפע מפרסום "${impactingDirective!.title}".`,
    decision: 'לטפל בשורש · או לתעד החלטה חלופית',
    headline: impact!.requiredAction,
    confidence: 'high',
    confidenceReason: `נגזר מהשפעת "${impactingDirective!.title}" על המבצע.`,
    consequence,
    alternatives: ['תיעוד החלטה חלופית (Override)'],
    tradeoffs: {
      act: `${impact!.requiredAction} — יטפל בשורש ירידת המוכנות.`,
      inaction: `${consequence} המוכנות תישאר ${mission.readiness}% והסיכון ${mission.riskLevel === 'high' ? 'גבוה' : 'לא יורד'}.`,
    },
    evidenceId: evidenceForMission?.id,
    sourceLabel: impactingDirective!.title,
  };
}
