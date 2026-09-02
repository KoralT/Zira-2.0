export interface SourceSystem {
  id: string;
  name: string;
  domain: string;
  owner: string;
  lastSync: string;
  readOnly: boolean;
  itemsLinked: number;
}

export const sourceSystems: SourceSystem[] = [
  { id: 'src-ganttait', name: 'גאנטאיט', domain: 'מבצעים ותכנון', owner: 'אג"ם גזרה', lastSync: '2026-07-22T07:40:00', readOnly: true, itemsLinked: 5 },
  { id: 'src-orders', name: 'מערכת פקודות ומדיניות', domain: 'הנחיות ומדיניות', owner: 'מפקדת גזרה צפון', lastSync: '2026-07-21T18:00:00', readOnly: true, itemsLinked: 5 },
  { id: 'src-log', name: 'מערכת לוגיסטיקה', domain: 'משאבים וסד"כ', owner: 'לוגיסטיקה גזרה', lastSync: '2026-07-22T07:40:00', readOnly: true, itemsLinked: 5 },
  { id: 'src-sadkal', name: 'מערכת סד"כ ותכנון', domain: 'כוח אדם ותכנון', owner: 'מדור תכנון', lastSync: '2026-07-20T09:00:00', readOnly: true, itemsLinked: 3 },
  { id: 'src-intel', name: 'מערכת מודיעין', domain: 'מודיעין', owner: 'מודיעין גזרה', lastSync: '2026-07-22T06:05:00', readOnly: true, itemsLinked: 3 },
  { id: 'src-gis', name: 'GIS — שכבות מרחביות', domain: 'מרחב גאוגרפי ואש', owner: 'לוגיסטיקה גזרה', lastSync: '2026-07-15T08:00:00', readOnly: true, itemsLinked: 2 },
  { id: 'src-marsham', name: 'מערכת מרשמים', domain: 'מרחב גאוגרפי ואש', owner: 'מודיעין גזרה', lastSync: '2026-07-19T10:00:00', readOnly: true, itemsLinked: 1 },
  { id: 'src-field', name: 'דיווחי שטח', domain: 'אירועים ודיווחים', owner: 'יחידות שטח', lastSync: '2026-07-22T06:00:00', readOnly: true, itemsLinked: 2 },
  { id: 'src-fire', name: 'מערכת אש', domain: 'אש ותקיפה', owner: 'תא אש גזרה', lastSync: '2026-07-22T07:10:00', readOnly: true, itemsLinked: 7 },
  { id: 'src-collect', name: 'מערכת איסוף', domain: 'איסוף ותצפית', owner: 'מודיעין גזרה', lastSync: '2026-07-22T06:40:00', readOnly: true, itemsLinked: 5 },
];
