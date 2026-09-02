import type { TimelineEvent, Decision } from './types';

export const timelineEvents: TimelineEvent[] = [
  { id: 'te1', timestamp: '2026-07-18T08:00:00', type: 'directive', relatedEntity: { type: 'directive', id: 'd5', label: 'הנחיית דיווח לאירועים חריגים' }, description: 'הנחיית דיווח לאירועים חריגים פורסמה.', actorUserId: 'u1' },
  { id: 'te2', timestamp: '2026-07-19T12:00:00', type: 'directive', relatedEntity: { type: 'directive', id: 'd3', label: 'מגבלת תנועה חדשה' }, description: 'מגבלת תנועה חדשה פורסמה עבור הציר הדרומי.', actorUserId: 'u1' },
  { id: 'te3', timestamp: '2026-07-20T09:00:00', type: 'directive', relatedEntity: { type: 'directive', id: 'd2', label: 'עדכון סדרי עדיפויות' }, description: 'עדכון סדרי עדיפויות פורסם — מגן מזרחי ושחר בטוח קיבלו עדיפות גבוהה.', actorUserId: 'u1' },
  { id: 'te4', timestamp: '2026-07-20T15:20:00', type: 'directive', relatedEntity: { type: 'directive', id: 'd4', label: 'שינוי בהקצאת משאבים' }, description: 'הנחיה לשינוי בהקצאת משאבים פורסמה.', actorUserId: 'u5' },
  // te5/te6/te9 removed — the fire-policy publish + readiness-drop events are now produced live
  // by publishDirectiveWithImpact() so the Timeline reflects a real, replayable action.
  { id: 'te7', timestamp: '2026-07-21T20:30:00', type: 'status-change', relatedEntity: { type: 'mission', id: 'm4', label: 'שחר בטוח' }, description: 'מבצע שחר בטוח עבר לשלב אישורים.', actorUserId: 'u2' },
  { id: 'te8', timestamp: '2026-07-22T06:05:00', type: 'event', relatedEntity: { type: 'mission', id: 'm3', label: 'קו אדום' }, description: 'עדכון מודיעיני שוטף התקבל וקושר למבצע.', actorUserId: 'u3' },
];

export const decisions: Decision[] = [
  { id: 'dec1', text: 'להקפיא הרחבת מבצע גשר דרומי עד לפתרון קונפליקט המשאבים.', decidedById: 'u1', timestamp: '2026-07-19T11:15:00', relatedMissionIds: ['m5'] },
];

export const getTimelineForEntity = (entityType: string, entityId: string) =>
  timelineEvents.filter(t => t.relatedEntity.type === entityType && t.relatedEntity.id === entityId);
