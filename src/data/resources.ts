import type { Resource } from './types';

export const resources: Resource[] = [
  {
    id: 'r1', name: 'צוות רפואי נייד', type: 'רפואה', quantity: '2 צוותים',
    availability: 'partial', allocatedToMissionId: 'm1', conflict: false,
    alternatives: ['צוות רפואי גזרתי', 'תגבור מגזרה שכנה'], ownerId: 'u4', sourceId: 'src-log',
  },
  {
    id: 'r2', name: 'מסוק תובלה', type: 'אוויר', quantity: '1 כלי',
    availability: 'partial', allocatedToMissionId: 'm1', conflict: true,
    conflictDescription: 'אותו כלי משובץ גם למבצע שחר בטוח באותו חלון זמן.',
    alternatives: ['מסוק תובלה רזרבי (טעון אישור)'], ownerId: 'u4', sourceId: 'src-log',
  },
  {
    id: 'r3', name: 'מחלקת רגלים', type: 'כוח אדם', quantity: '1 מחלקה',
    availability: 'available', allocatedToMissionId: 'm2', conflict: false,
    alternatives: [], ownerId: 'u5', sourceId: 'src-sadkal',
  },
  {
    id: 'r4', name: 'רכב שריון', type: 'שריון', quantity: '3 כלים',
    availability: 'unavailable', allocatedToMissionId: 'm4', conflict: true,
    conflictDescription: 'תחזוקה מתוכננת חופפת לחלון הביצוע.', alternatives: ['שריון תגבור מגדוד עתודה'],
    ownerId: 'u4', sourceId: 'src-log',
  },
  {
    id: 'r5', name: 'תחנת תדלוק נייד', type: 'לוגיסטיקה', quantity: '1 תחנה',
    availability: 'available', allocatedToMissionId: 'm5', conflict: false,
    alternatives: [], ownerId: undefined, sourceId: 'src-log',
  },
];

export const getResource = (id: string) => resources.find(r => r.id === id);
