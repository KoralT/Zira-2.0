import type { OperationalEvent } from './types';

// Operational events (v1.1). Two kinds, intentionally:
//  • Decision events (impact + recommendedAction present) — these drive the loop and surface to
//    the commander in Attention / Mission / HQ / Map.
//  • Ambient events (no impact, no recommendedAction, no coord) — these exist ONLY to prove
//    suppression: Sigma does NOT surface them (no-noise). They never become a feed.
export const operationalEvents: OperationalEvent[] = [
  {
    id: 'ev1', title: 'זוהתה תנועת אויב חריגה מול "קו אדום"',
    description: 'דיווח שדה על תנועת כוח אויב בלתי מזוהה סמוך לקו התיאום המזרחי של מבצע קו אדום, מחוץ לדפוס הפעילות המוכר.',
    category: 'enemy-change', categoryLabel: 'שינוי מצב אויב', severity: 'critical', status: 'new',
    occurredAt: '2026-07-22T05:20:00', detectedAt: '2026-07-22T05:38:00', sector: 'צפון',
    relatedMissionIds: ['m3'],
    impact: { missionId: 'm3', impactType: 'שינוי מצב אויב', meaning: 'התנועה מחייבת עדכון קווי התיאום לתקיפה מול קמ"ן לפני המשך הפעילות', requiredAction: 'עדכון קווי תיאום ותיקוף מול קמ"ן' },
    sourceId: 'src-intel', confidence: 'medium', evidenceIds: ['e1'],
    recommendedAction: 'עדכן/י את קווי התיאום ותקף/י מול קמ"ן לפני המשך הפעילות',
    reasonForUser: 'האירוע משפיע על מבצע פעיל באחריותך ומחייב החלטת תיאום.',
    coord: { x: 58, y: 22 }, locationLabel: 'קו תיאום מזרחי — קו אדום',
  },
  {
    id: 'ev2', title: 'תקלת כשירות ברכב שריון הליווי — "שחר בטוח"',
    description: 'רכב השריון המיועד לליווי תנועת האוכלוסייה במבצע שחר בטוח דווח כלא כשיר עקב תקלה טכנית.',
    category: 'readiness-fault', categoryLabel: 'תקלת כשירות', severity: 'high', status: 'new',
    occurredAt: '2026-07-21T19:05:00', detectedAt: '2026-07-21T19:22:00', sector: 'מרכז',
    relatedMissionIds: ['m4'],
    impact: { missionId: 'm4', impactType: 'תקלת כשירות', meaning: 'ללא רכב ליווי כשיר לא ניתן לאשר את תנועת האוכלוסייה במועד', requiredAction: 'החלטה על חלופת ליווי או דחיית התנועה' },
    sourceId: 'src-sadkal', confidence: 'high', evidenceIds: ['e4'],
    recommendedAction: 'החלט/י על חלופת ליווי זמינה או על דחיית התנועה',
    reasonForUser: 'האירוע חוסם מבצע בסטטוס אישורים עם יעד קרוב.',
    coord: { x: 50, y: 60 }, locationLabel: 'ריכוז כוחות — מרכז',
  },
  {
    id: 'ev3', title: 'חסימת ציר אספקה דרומי בעקבות אירוע בטיחות',
    description: 'אירוע בטיחות בציר האספקה הדרומי גרם לחסימה זמנית המשפיעה על רציפות האספקה למבצע גשר דרומי.',
    category: 'safety', categoryLabel: 'אירוע בטיחות', severity: 'high', status: 'new',
    occurredAt: '2026-07-22T04:10:00', detectedAt: '2026-07-22T04:25:00', sector: 'דרום',
    relatedMissionIds: ['m5'],
    impact: { missionId: 'm5', impactType: 'חסימת ציר', meaning: 'חסימת הציר פוגעת ברציפות הלוגיסטית ומעכבת אספקה לכוחות בשטח', requiredAction: 'הפעלת ציר חלופי או תיאום פינוי החסימה' },
    sourceId: 'src-field', confidence: 'high', evidenceIds: ['e5'],
    recommendedAction: 'הפעל/י ציר אספקה חלופי או תאם/י פינוי החסימה',
    reasonForUser: 'האירוע פוגע ברציפות הלוגיסטית של מבצע באחריות הגזרה.',
    coord: { x: 42, y: 80 }, locationLabel: 'ציר אספקה דרומי',
  },
  // --- Ambient events: no impact, no recommended action → suppressed (proof of no-noise). ---
  {
    id: 'ev4', title: 'דיווח שגרתי: סיור תצפית הושלם ללא ממצא',
    description: 'סיור תצפית שגרתי בגזרה הדרומית הושלם ללא ממצאים חריגים.',
    category: 'field-report', categoryLabel: 'דיווח שדה', severity: 'low', status: 'new',
    occurredAt: '2026-07-22T03:00:00', detectedAt: '2026-07-22T03:05:00', sector: 'דרום',
    relatedMissionIds: [], sourceId: 'src-field', confidence: 'medium', evidenceIds: [],
  },
  {
    id: 'ev5', title: 'דיווח מזג אוויר: ראות מופחתת זמנית במזרח',
    description: 'ירידה זמנית בראות בגזרה המזרחית ללא השפעה מבצעית מדווחת.',
    category: 'field-report', categoryLabel: 'דיווח שדה', severity: 'low', status: 'new',
    occurredAt: '2026-07-22T02:15:00', detectedAt: '2026-07-22T02:20:00', sector: 'מזרח',
    relatedMissionIds: [], sourceId: 'src-field', confidence: 'low', evidenceIds: [],
  },
  // --- GP1 (v1.4) — the Context Intelligence showcase. A bare schedule change from the planning
  // system; it carries NO pre-baked impact/recommendedAction. The meaning is DERIVED cross-source
  // at read time (deriveScheduleShiftInsight): shared מסוק conflict + approval coverage gap. ---
  {
    id: 'ev6', title: 'שעת מבצע "אופק צפוני" נדחתה ב-4 שעות (04:00 → 08:00)',
    description: 'עדכון לוח זמנים ממערכת התכנון: מועד היציאה של אופק צפוני נדחה ב-4 שעות.',
    category: 'schedule-change', categoryLabel: 'שינוי לוח זמנים', severity: 'critical', status: 'new',
    occurredAt: '2026-07-22T05:50:00', detectedAt: '2026-07-22T06:02:00', sector: 'צפון',
    relatedMissionIds: ['m1'], sourceId: 'src-ganttait', confidence: 'high', evidenceIds: ['e2'],
    coord: { x: 33, y: 27 }, locationLabel: 'לוח זמנים — אופק צפוני',
  },
  // ev7 — the OBSERVED FACT behind the ציר לביא canonical slice: a field report that ציר לביא is
  // blocked. It is intentionally an OBSERVED fact only (no impact / no recommendedAction), so it is
  // NOT a decision-surface item (suppressed from /events, HQ, map). Its decision-MEANING is the
  // derived OperationalSignal (see lib/operationalSignal.ts) consumed by Attention. Relationship
  // ev7 AFFECTS ax-lavi is declared explicitly in data/relationships.ts.
  {
    id: 'ev7', title: 'דיווח חסימה על ציר לביא',
    description: 'דיווח שדה על חסימת בטיחות בציר לביא — הציר המשמש כמסלול הגישה המתוכנן של אופק צפוני.',
    category: 'safety', categoryLabel: 'אירוע בטיחות', severity: 'high', status: 'new',
    occurredAt: '2026-07-22T05:00:00', detectedAt: '2026-07-22T05:20:00', sector: 'צפון',
    relatedMissionIds: ['m1'], sourceId: 'src-field', confidence: 'medium', evidenceIds: [],
  },
];

// A decision event is one that can actually produce attention/decision — it has an assessed
// impact, a recommended action, OR it is a schedule-change (whose meaning is derived at read
// time). Everything else is suppressed (never surfaced to the commander).
export const isDecisionEvent = (e: OperationalEvent) =>
  !!e.impact || !!e.recommendedAction || e.category === 'schedule-change';
