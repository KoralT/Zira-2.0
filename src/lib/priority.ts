import type { AttentionAlert, Mission, SigmaTask } from '../data/types';

// Explainable, contextual priority. Priority is not a flat urgency sort — it is derived from
// several live signals and always carries its own concise "why" so the ranking is trustworthy.
// (Maturity: Attention M2 Functional -> M4 Operational.)
//
// The UI communicates a priority LEVEL + the main operational reason (deadline / linked-mission
// risk / blockers). The numeric score exists only to order items — it is not shown raw.

export interface PriorityFactor {
  label: string;
  points: number;
}

export interface PriorityResult {
  score: number;                 // internal, for sorting only
  factors: PriorityFactor[];     // full breakdown (available for a "why" detail)
  reason: string;                // concise operational reason, derived from the same factors
  band: 'critical' | 'high' | 'medium' | 'low';
}

const NOW = new Date('2026-07-23T09:00:00').getTime();

const URGENCY_HE: Record<string, string> = { critical: 'קריטית', high: 'גבוהה', medium: 'בינונית', low: 'נמוכה' };

function deadlineFactor(iso: string | undefined, label: string): PriorityFactor | null {
  if (!iso) return null;
  const hours = (new Date(iso).getTime() - NOW) / 3600000;
  if (hours <= 0) return { label: `${label} חורג`, points: 26 };
  if (hours <= 6) return { label: `${label} בתוך ${Math.max(1, Math.round(hours))} שע׳`, points: 22 };
  if (hours <= 24) return { label: `${label} בתוך יממה`, points: 14 };
  if (hours <= 72) return { label: `${label} בימים הקרובים`, points: 6 };
  return null;
}

function missionRiskFactor(m: Mission | undefined): PriorityFactor | null {
  if (!m) return null;
  if (m.riskLevel === 'high') return { label: `מבצע "${m.name}" בסיכון גבוה`, points: 18 };
  if (m.riskLevel === 'medium') return { label: `מבצע "${m.name}" בסיכון בינוני`, points: 9 };
  return null;
}

function blockersFactor(m: Mission | undefined): PriorityFactor | null {
  if (!m || m.blockersCount <= 0) return null;
  return { label: `${m.blockersCount} חסמים פתוחים במבצע`, points: Math.min(m.blockersCount * 4, 12) };
}

const band = (score: number): PriorityResult['band'] =>
  score >= 75 ? 'critical' : score >= 50 ? 'high' : score >= 28 ? 'medium' : 'low';

// Build the concise reason from the operationally-meaningful factors (deadline, mission risk,
// blockers) — the same factors that feed the score. Falls back to the base signal.
function buildReason(parts: (PriorityFactor | null)[], fallback: string): string {
  const meaningful = parts.filter((p): p is PriorityFactor => !!p).map(p => p.label);
  return meaningful.length > 0 ? meaningful.slice(0, 3).join(' · ') : fallback;
}

const URGENCY_BASE: Record<string, number> = { critical: 42, high: 28, medium: 15, low: 6 };
const ALERT_TYPE_BONUS: Record<string, PriorityFactor | null> = {
  'action-required': { label: 'דורש פעולה ממך', points: 12 },
  'risk-deadline': { label: 'סיכון / דדליין', points: 12 },
  'anomaly': { label: 'חריגה שזוהתה', points: 6 },
  'context-changed': null,
  'information-gap': null,
};

export function computeAlertPriority(alert: AttentionAlert, missionById: (id: string) => Mission | undefined): PriorityResult {
  const factors: PriorityFactor[] = [];
  factors.push({ label: `דחיפות ${URGENCY_HE[alert.urgency] ?? alert.urgency}`, points: URGENCY_BASE[alert.urgency] ?? 8 });

  const typeBonus = ALERT_TYPE_BONUS[alert.type];
  if (typeBonus) factors.push(typeBonus);

  const mission = alert.relatedEntity.type === 'mission' ? missionById(alert.relatedEntity.id) : undefined;
  const riskF = missionRiskFactor(mission);
  const blockF = blockersFactor(mission);
  const deadlineF = alert.type === 'risk-deadline' ? deadlineFactor(mission?.dueDate, 'דדליין המבצע') : null;
  const lowConfF = alert.confidence === 'low' ? { label: 'אמון נמוך — דורש תיקוף', points: 5 } : null;

  [riskF, blockF, deadlineF, lowConfF].forEach(f => f && factors.push(f));

  const score = Math.min(100, factors.reduce((s, f) => s + f.points, 0));
  const reason = buildReason([deadlineF, riskF, blockF], typeBonus?.label ?? `דחיפות ${URGENCY_HE[alert.urgency] ?? alert.urgency}`);
  return { score, factors, reason, band: band(score) };
}

const TASK_PRIORITY_BASE: Record<string, number> = { high: 34, medium: 18, low: 8 };

export function computeTaskPriority(task: SigmaTask, missionById: (id: string) => Mission | undefined): PriorityResult {
  if (task.status === 'done') return { score: 0, factors: [{ label: 'הושלמה', points: 0 }], reason: 'הושלמה', band: 'low' };

  const factors: PriorityFactor[] = [];
  factors.push({ label: `עדיפות ${URGENCY_HE[task.priority] ?? task.priority}`, points: TASK_PRIORITY_BASE[task.priority] ?? 8 });

  const mission = task.missionId ? missionById(task.missionId) : undefined;
  const deadlineF = deadlineFactor(task.dueDate, 'יעד המשימה');
  const riskF = missionRiskFactor(mission);
  const blockF = blockersFactor(mission);

  [deadlineF, riskF, blockF].forEach(f => f && factors.push(f));

  const score = Math.min(100, factors.reduce((s, f) => s + f.points, 0));
  const reason = buildReason([deadlineF, riskF, blockF], `עדיפות ${URGENCY_HE[task.priority] ?? task.priority}`);
  return { score, factors, reason, band: band(score) };
}

export const priorityBandMeta: Record<PriorityResult['band'], { label: string; short: string; tone: 'red' | 'amber' | 'blue' | 'gray' }> = {
  critical: { label: 'עדיפות קריטית', short: 'קריטית', tone: 'red' },
  high: { label: 'עדיפות גבוהה', short: 'גבוהה', tone: 'red' },
  medium: { label: 'עדיפות בינונית', short: 'בינונית', tone: 'amber' },
  low: { label: 'עדיפות נמוכה', short: 'נמוכה', tone: 'gray' },
};
