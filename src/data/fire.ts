import type { FireItem } from './types';

// תמונת אש ותקיפה — דומיין חדש. הנתונים מקושרים למבצעים הקיימים (m1/m3 בגזרה הצפונית).
export const fireItems: FireItem[] = [
  { id: 'f1', category: 'target', categoryLabel: 'מטרות לתקיפה', title: 'מטרה 118 — צומת ציר מרכזי', status: 'ממתינה לאישור', statusTone: 'amber', relatedMissionId: 'm1', sourceId: 'src-fire', requiresValidation: true },
  { id: 'f2', category: 'target', categoryLabel: 'מטרות לתקיפה', title: 'מטרה 204 — עמדת תצפית', status: 'ממתינה לתיקוף קווי תיאום', statusTone: 'red', relatedMissionId: 'm3', sourceId: 'src-fire', requiresValidation: true },
  { id: 'f3', category: 'strike-activity', categoryLabel: 'פעילויות תקיפה', title: 'פעילות תקיפה — ציר צפוני', status: 'בתכנון', statusTone: 'gray', relatedMissionId: 'm1', sourceId: 'src-fire', requiresValidation: false },
  { id: 'f4', category: 'prescription', categoryLabel: 'מרשמי אש', title: 'מרשם אש 51', status: 'ממתין לאימות', statusTone: 'amber', relatedMissionId: 'm1', sourceId: 'src-fire', requiresValidation: true },
  { id: 'f5', category: 'prescription', categoryLabel: 'מרשמי אש', title: 'מרשם אש 52', status: 'מאומת', statusTone: 'green', relatedMissionId: 'm3', sourceId: 'src-fire', requiresValidation: false },
  { id: 'f6', category: 'strike-window', categoryLabel: 'חלונות תקיפה', title: 'חלון תקיפה 09:00–11:00', status: 'ממתין לאישור מפקד', statusTone: 'amber', relatedMissionId: 'm1', sourceId: 'src-fire', requiresValidation: true },
  { id: 'f7', category: 'strike-approval', categoryLabel: 'אישורי תקיפה', title: 'אישור תקיפה למטרה 118', status: 'טרם נפתח — חסום ע"י מדיניות האש', statusTone: 'red', relatedMissionId: 'm1', sourceId: 'src-fire', requiresValidation: true },
];

export const fireForMission = (missionId?: string) =>
  missionId ? fireItems.filter(f => f.relatedMissionId === missionId) : fireItems;
