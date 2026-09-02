import type { Mission, Approval, OperationalEvent } from '../data/types';
import { resources, missions as allMissions } from '../data';

// GP1 — the Context Intelligence derivation (v1.4). A bare schedule change is NOT an insight; the
// value is the EMERGENT connection Sigma computes across three information worlds that no single
// source stated: time shift → shared resource conflict → approval coverage gap → readiness impact.
// It derives ONLY what the data supports and does NOT invent a resolution (honors the contract's
// "never invent a decision, alternative, or tradeoff"). The single real alternative in the data is
// unvalidated, so it is surfaced as a FACT, never as a recommendation.

export interface ScheduleShiftInsight {
  found: boolean;
  situation: string;
  meaning: string;            // the emergent cross-source connection
  consequence: string;       // operational consequence (readiness to launch)
  requiredAttention: string;
  connections: { label: string; sub: string; route?: string }[];
  chain: string[];           // the derived reasoning, step by step (for inline progressive disclosure)
  alternativeFact?: string;  // real-but-unvalidated option — shown as a fact, not a recommendation
  recommendation?: string;   // only when the data justifies a validated resolution (here: none)
}

export function deriveScheduleShiftInsight(
  event: OperationalEvent,
  ctx: { missionById: (id: string) => Mission | undefined; approvals: Approval[] },
): ScheduleShiftInsight | null {
  const mission = event.relatedMissionIds[0] ? ctx.missionById(event.relatedMissionIds[0]) : undefined;
  if (!mission) return null;

  // Cross-source #1 — a resource allocated to this mission that is already contended by another.
  const contended = resources.find(r => r.allocatedToMissionId === mission.id && r.conflict);
  const otherMission = contended
    ? allMissions.find(m => m.id !== mission.id && contended.conflictDescription?.includes(m.name))
    : undefined;

  // Cross-source #2 — this mission's pending approval whose basis does not cover the new window.
  const approval = ctx.approvals.find(a => a.missionId === mission.id && a.status === 'pending'
    && a.missingItems.some(mi => mi.includes('משאב') || mi.includes('מסוק') || (contended && mi.includes(contended.type))));

  const situation = event.title;

  const meaningParts: string[] = [];
  if (contended) meaningParts.push(`חלון הזמן החדש יוצר חפיפה על ${contended.name}${otherMission ? ` עם "${otherMission.name}"` : ''}`);
  if (approval) meaningParts.push(`והאישור הקיים ("${approval.title}") אינו מכסה את התנאים בחלון החדש`);
  const meaning = meaningParts.length
    ? `${meaningParts.join(', ')}.`
    : 'שינוי הלוז מחייב בחינה מחדש של ההקצאות והאישורים הקשורים.';

  const consequence = `"${mission.name}" אינו עומד כרגע בתנאי המוכנות ליציאה בחלון החדש.`;
  const requiredAttention = `בחינה מחדש של הקצאת ${contended?.name ?? 'המשאב'} ושל תוקף האישור לפני היציאה.`;

  const connections: ScheduleShiftInsight['connections'] = [
    { label: mission.name, sub: 'מבצע שהושפע', route: `/portfolio/${mission.id}` },
  ];
  if (contended) connections.push({ label: contended.name, sub: `משאב בהתנגשות${otherMission ? ` · משותף עם "${otherMission.name}"` : ''}` });
  if (otherMission) connections.push({ label: otherMission.name, sub: 'מבצע מתחרה על המשאב', route: `/portfolio/${otherMission.id}` });
  if (approval) connections.push({ label: approval.title, sub: 'אישור ללא כיסוי לחלון החדש', route: `/entity/approval/${approval.id}` });

  // The one alternative in the data (r2.alternatives) is unvalidated → a fact, not a recommendation.
  const alt = contended?.alternatives?.[0];
  const alternativeFact = alt ? `חלופה קיימת בנתונים: ${alt} — טעונה תיקוף, אינה מהווה פתרון מאושר.` : undefined;

  // The reasoning, step by step — for inline progressive disclosure ("how did Sigma get here?")
  // so understanding needs zero navigation.
  const chain = [
    situation,
    contended ? `נוצרה חפיפה על ${contended.name}` : 'נדרשת בחינת הקצאות',
    otherMission ? `"${otherMission.name}" משובץ לאותו משאב` : '',
    approval ? 'האישור הקיים אינו מכסה את חלון הזמן החדש' : '',
    consequence,
  ].filter(Boolean);

  return {
    found: true,
    situation, meaning, consequence, requiredAttention, connections, chain, alternativeFact,
    recommendation: undefined, // no validated resolution in the data → Sigma does not recommend
  };
}
