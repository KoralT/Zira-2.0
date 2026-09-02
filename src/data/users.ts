import type { SigmaUser } from './types';

export const users: SigmaUser[] = [
  { id: 'u1', name: 'אל"מ דן שגיא', role: 'sector-commander', roleLabel: 'מפקד גזרה', unit: 'מפקדת גזרה צפון', initials: 'דש' },
  { id: 'u2', name: 'רס"ן נעה כהן', role: 'ops-officer', roleLabel: 'קצין אג"ם', unit: 'אג"ם גזרה', initials: 'נכ' },
  { id: 'u3', name: 'סרן איתי לביא', role: 'intel-officer', roleLabel: 'קצין מודיעין', unit: 'מודיעין גזרה', initials: 'אל' },
  { id: 'u4', name: 'סרן רותם אזולאי', role: 'logistics-officer', roleLabel: 'קצין לוגיסטיקה', unit: 'לוגיסטיקה גזרה', initials: 'רא' },
  { id: 'u5', name: 'סג"מ ליאור ברק', role: 'planning-officer', roleLabel: 'רמ"ד תכנון', unit: 'מדור תכנון', initials: 'לב' },
];

export const getUser = (id: string) => users.find(u => u.id === id);
export const DEFAULT_USER_ID = 'u1';
