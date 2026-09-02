import type { ReadinessItem, ReadinessCategory } from './types';

const CATS: { key: ReadinessCategory; label: string }[] = [
  { key: 'personnel', label: 'כוח אדם' },
  { key: 'intel', label: 'מודיעין' },
  { key: 'resources', label: 'משאבים' },
  { key: 'planning', label: 'תכנון' },
  { key: 'approvals', label: 'אישורים' },
  { key: 'policy', label: 'מדיניות' },
  { key: 'coordination', label: 'תיאום' },
];

export const readinessCategories = CATS;

export const readinessItems: ReadinessItem[] = [
  // Mission m1 — אופק צפוני — flagship narrative (readiness dropped 82 -> 61)
  { id: 'ri-m1-1', missionId: 'm1', category: 'personnel', categoryLabel: 'כוח אדם', requirement: 'שיבוץ כוח מלא למשימה', status: 'met', ownerId: 'u1', sourceId: 'src-sadkal', lastUpdated: '2026-07-20T08:00:00', requiresValidation: false },
  { id: 'ri-m1-2', missionId: 'm1', category: 'intel', categoryLabel: 'מודיעין', requirement: 'הערכת איום עדכנית לציר התנועה', status: 'partial', ownerId: 'u3', sourceId: 'src-intel', lastUpdated: '2026-07-22T06:00:00', evidenceId: 'e6', requiresValidation: true },
  { id: 'ri-m1-3', missionId: 'm1', category: 'resources', categoryLabel: 'משאבים', requirement: 'מסוק תובלה זמין לחלון הביצוע', status: 'missing', ownerId: 'u4', sourceId: 'src-log', lastUpdated: '2026-07-22T07:40:00', evidenceId: 'e2', requiresValidation: true },
  { id: 'ri-m1-4', missionId: 'm1', category: 'planning', categoryLabel: 'תכנון', requirement: 'תוכנית ביצוע מעודכנת', status: 'met', ownerId: 'u2', sourceId: 'src-ganttait', lastUpdated: '2026-07-20T10:00:00', requiresValidation: false },
  { id: 'ri-m1-5', missionId: 'm1', category: 'approvals', categoryLabel: 'אישורים', requirement: 'אישור סופי מפקד גזרה', status: 'missing', ownerId: 'u1', sourceId: 'src-ganttait', lastUpdated: '2026-07-22T07:40:00', evidenceId: 'e2', requiresValidation: true },
  { id: 'ri-m1-6', missionId: 'm1', category: 'policy', categoryLabel: 'מדיניות', requirement: 'תיאום עם מדיניות האש העדכנית', status: 'met', ownerId: 'u2', sourceId: 'src-orders', lastUpdated: '2026-07-20T09:00:00', evidenceId: 'e1', requiresValidation: false },
  { id: 'ri-m1-7', missionId: 'm1', category: 'coordination', categoryLabel: 'תיאום', requirement: 'תיאום מול גזרה שכנה', status: 'met', ownerId: 'u1', sourceId: 'src-orders', lastUpdated: '2026-07-19T09:00:00', requiresValidation: false },

  // m2 — מגן מזרחי
  { id: 'ri-m2-1', missionId: 'm2', category: 'personnel', categoryLabel: 'כוח אדם', requirement: 'שיבוץ מחלקת רגלים', status: 'met', ownerId: 'u5', sourceId: 'src-sadkal', lastUpdated: '2026-07-20T09:00:00', requiresValidation: false },
  { id: 'ri-m2-2', missionId: 'm2', category: 'resources', categoryLabel: 'משאבים', requirement: 'הקצאת רכב שריון תגבור', status: 'partial', ownerId: 'u4', sourceId: 'src-log', lastUpdated: '2026-07-20T15:20:00', requiresValidation: true },
  { id: 'ri-m2-3', missionId: 'm2', category: 'planning', categoryLabel: 'תכנון', requirement: 'תוכנית הגנה שכבתית', status: 'met', ownerId: 'u5', sourceId: 'src-ganttait', lastUpdated: '2026-07-21T16:10:00', requiresValidation: false },
  { id: 'ri-m2-4', missionId: 'm2', category: 'approvals', categoryLabel: 'אישורים', requirement: 'אישור הקצאת משאבים', status: 'missing', ownerId: 'u5', sourceId: 'src-log', lastUpdated: '2026-07-20T15:20:00', requiresValidation: true },
  { id: 'ri-m2-5', missionId: 'm2', category: 'coordination', categoryLabel: 'תיאום', requirement: 'תיאום מול כוחות שכנים', status: 'met', ownerId: 'u2', sourceId: 'src-orders', lastUpdated: '2026-07-19T09:00:00', requiresValidation: false },

  // m3 — קו אדום
  { id: 'ri-m3-1', missionId: 'm3', category: 'intel', categoryLabel: 'מודיעין', requirement: 'רצף מודיעיני על קווי תיאום', status: 'met', ownerId: 'u3', sourceId: 'src-intel', lastUpdated: '2026-07-22T06:05:00', requiresValidation: false },
  { id: 'ri-m3-2', missionId: 'm3', category: 'policy', categoryLabel: 'מדיניות', requirement: 'תיאום עם מדיניות האש העדכנית', status: 'partial', ownerId: 'u1', sourceId: 'src-orders', lastUpdated: '2026-07-21T18:00:00', evidenceId: 'e1', requiresValidation: true },
  { id: 'ri-m3-3', missionId: 'm3', category: 'coordination', categoryLabel: 'תיאום', requirement: 'תיאום מול תאי אינטגרציה', status: 'met', ownerId: 'u1', sourceId: 'src-orders', lastUpdated: '2026-07-18T09:00:00', requiresValidation: false },

  // m4 — שחר בטוח
  { id: 'ri-m4-1', missionId: 'm4', category: 'intel', categoryLabel: 'מודיעין', requirement: 'תיקוף קמ"ן למרשם', status: 'missing', ownerId: 'u3', sourceId: 'src-intel', lastUpdated: '2026-07-19T10:00:00', evidenceId: 'e4', requiresValidation: true },
  { id: 'ri-m4-2', missionId: 'm4', category: 'resources', categoryLabel: 'משאבים', requirement: 'רכב שריון ליווי', status: 'missing', ownerId: 'u4', sourceId: 'src-log', lastUpdated: '2026-07-21T20:30:00', requiresValidation: true },
  { id: 'ri-m4-3', missionId: 'm4', category: 'approvals', categoryLabel: 'אישורים', requirement: 'אישור מוכנות מפקד גזרה', status: 'missing', ownerId: 'u1', sourceId: 'src-ganttait', lastUpdated: '2026-07-21T20:30:00', requiresValidation: true },
  { id: 'ri-m4-4', missionId: 'm4', category: 'planning', categoryLabel: 'תכנון', requirement: 'תוכנית ליווי מעודכנת', status: 'met', ownerId: 'u2', sourceId: 'src-ganttait', lastUpdated: '2026-07-20T09:00:00', requiresValidation: false },

  // m5 — גשר דרומי
  { id: 'ri-m5-1', missionId: 'm5', category: 'resources', categoryLabel: 'משאבים', requirement: 'זמינות תחנת תדלוק נייד', status: 'partial', ownerId: undefined, sourceId: 'src-log', lastUpdated: '2026-07-15T08:00:00', evidenceId: 'e5', requiresValidation: true },
  { id: 'ri-m5-2', missionId: 'm5', category: 'planning', categoryLabel: 'תכנון', requirement: 'תוכנית תחזוקת ציר', status: 'met', ownerId: 'u4', sourceId: 'src-ganttait', lastUpdated: '2026-07-18T09:00:00', requiresValidation: false },
  { id: 'ri-m5-3', missionId: 'm5', category: 'policy', categoryLabel: 'מדיניות', requirement: 'עמידה במגבלת התנועה החדשה', status: 'partial', ownerId: 'u4', sourceId: 'src-orders', lastUpdated: '2026-07-19T12:00:00', requiresValidation: true },
];

export const readinessForMission = (missionId: string) => readinessItems.filter(r => r.missionId === missionId);
