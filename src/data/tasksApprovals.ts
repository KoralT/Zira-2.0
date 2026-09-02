import type { SigmaTask, Approval } from './types';

export const seedTasks: SigmaTask[] = [
  // t1 removed — the fire-policy follow-up task is now produced live by publishDirectiveWithImpact()
  { id: 't2', title: 'להשלים תיקוף קמ"ן למרשם שחר בטוח', priority: 'high', dueDate: '2026-07-22T18:00:00', missionId: 'm4', sourceType: 'alert', sourceId: 'a2', status: 'open', assigneeUserId: 'u3', createdAt: '2026-07-21T20:35:00' },
  { id: 't3', title: 'לבדוק זמינות חלופה למסוק התובלה', priority: 'medium', dueDate: '2026-07-23T10:00:00', missionId: 'm1', sourceType: 'alert', sourceId: 'an2', status: 'open', assigneeUserId: 'u4', createdAt: '2026-07-21T19:00:00' },
  { id: 't4', title: 'לעדכן תוכנית תיאום מול גזרה שכנה — מגן מזרחי', priority: 'medium', dueDate: '2026-07-24T09:00:00', missionId: 'm2', sourceType: 'manual', status: 'in-progress', assigneeUserId: 'u5', createdAt: '2026-07-20T10:00:00' },
  { id: 't5', title: 'לסקור דוח מוכנות שבועי — קו אדום', priority: 'low', dueDate: '2026-07-25T12:00:00', missionId: 'm3', sourceType: 'manual', status: 'open', assigneeUserId: 'u1', createdAt: '2026-07-20T08:00:00' },
  { id: 't6', title: 'לתאם תחנת תדלוק חלופית — גשר דרומי', priority: 'medium', dueDate: '2026-07-23T12:00:00', missionId: 'm5', sourceType: 'alert', sourceId: 'ig1', status: 'done', assigneeUserId: 'u4', createdAt: '2026-07-19T12:00:00' },
];

export const seedApprovals: Approval[] = [
  { id: 'ap1', title: 'אישור סופי למבצע אופק צפוני', missionId: 'm1', requiredFromUserId: 'u1', status: 'pending', waitingSince: '2026-07-21T18:10:00', missingItems: ['אישור קמ"ן', 'תיקוף משאב (מסוק תובלה)'], riskLevel: 'high', evidenceIds: ['e2'] },
  { id: 'ap2', title: 'אישור מוכנות מבצע שחר בטוח', missionId: 'm4', requiredFromUserId: 'u1', status: 'pending', waitingSince: '2026-07-21T20:30:00', missingItems: ['תיקוף קמ"ן', 'רכב שריון ליווי'], riskLevel: 'high', evidenceIds: ['e4'] },
  { id: 'ap3', title: 'אישור הקצאת משאבים — מגן מזרחי', missionId: 'm2', requiredFromUserId: 'u5', status: 'pending', waitingSince: '2026-07-20T15:20:00', missingItems: ['אישור לוגיסטיקה'], riskLevel: 'medium', evidenceIds: ['e3'] },
  { id: 'ap4', title: 'אישור תקציב לוגיסטי — גשר דרומי', missionId: 'm5', requiredFromUserId: 'u4', status: 'approved', waitingSince: '2026-07-18T09:00:00', missingItems: [], riskLevel: 'low', evidenceIds: [] },
];

export const tasksForUser = (userId: string) => seedTasks.filter(t => t.assigneeUserId === userId);
export const approvalsForUser = (userId: string) => seedApprovals.filter(a => a.requiredFromUserId === userId);
