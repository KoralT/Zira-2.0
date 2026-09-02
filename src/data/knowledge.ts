import type { KnowledgeItem } from './types';

export const knowledgeItems: KnowledgeItem[] = [
  {
    id: 'k1', type: 'lesson', title: 'לקח: עדכוני מדיניות אש דורשים תיקוף מוכנות מיידי',
    summary: 'בעדכון מדיניות אש קודם, מבצעים שלא תוקפו תוך 24 שעות ספגו ירידת מוכנות שלא זוהתה בזמן.',
    date: '2026-03-14', domain: 'מרחב גאוגרפי ואש', unit: 'מפקדת גזרה צפון',
    relevanceReason: 'מבצע אופק צפוני נמצא באותה נקודת סיכון כרגע.', confidence: 'high',
    sourceLink: '#/deep-link/knowledge/k1', relatedMissionIds: ['m1', 'm3'],
  },
  {
    id: 'k2', type: 'similar-op', title: 'מבצע דומה: "שער צפוני" (2025)',
    summary: 'מבצע דומה באופיו לאופק צפוני, כלל אתגרי תיאום משאבי אוויר דומים ונפתר בהקצאה מוקדמת.',
    date: '2025-11-02', domain: 'מבצעים ותכנון', unit: 'מפקדת גזרה צפון',
    relevanceReason: 'דפוס קונפליקט משאבי אוויר זהה למצב הנוכחי במבצע אופק צפוני.', confidence: 'medium',
    sourceLink: '#/deep-link/knowledge/k2', relatedMissionIds: ['m1'], relatedResourceIds: ['r2'],
  },
  {
    id: 'k3', type: 'decision', title: 'החלטת עבר: תיעדוף משאבי לוגיסטיקה בציר דרומי',
    summary: 'בעבר הוחלט להעביר תחנות תדלוק ניידות בין גזרות בהתראה קצרה — התהליך יצר פער זמני בבעלות.',
    date: '2025-09-01', domain: 'משאבים וסד"כ', unit: 'לוגיסטיקה גזרה',
    relevanceReason: 'תחנת התדלוק במבצע גשר דרומי כרגע ללא Owner מוגדר — דפוס חוזר.', confidence: 'medium',
    sourceLink: '#/deep-link/knowledge/k3', relatedMissionIds: ['m5'], relatedResourceIds: ['r5'],
  },
  {
    id: 'k4', type: 'past-directive', title: 'הנחיה קודמת: מגבלת תנועה בציר דרומי (2025)',
    summary: 'הנחיית מגבלת תנועה קודמת בציר הדרומי חייבה תיאום מוקדם מול לוגיסטיקה גזרה למניעת עיכובי אספקה.',
    date: '2025-12-10', domain: 'מרחב גאוגרפי ואש', unit: 'לוגיסטיקה גזרה',
    relevanceReason: 'מגבלת התנועה הנוכחית (d3) חוזרת על אותו דפוס בציר הדרומי.', confidence: 'high',
    sourceLink: '#/deep-link/knowledge/k4', relatedMissionIds: ['m5'],
  },
  {
    id: 'k5', type: 'incident', title: 'אירוע חוזר: קונפליקט הקצאת מסוקי תובלה',
    summary: 'זהו האירוע השלישי בשנה האחרונה שבו אותו כלי אוויר משובץ לשני מבצעים באותו חלון זמן.',
    date: '2026-05-22', domain: 'משאבים וסד"כ', unit: 'לוגיסטיקה גזרה',
    relevanceReason: 'קונפליקט זהה זוהה כרגע במסוק התובלה המשובץ לאופק צפוני.', confidence: 'high',
    sourceLink: '#/deep-link/knowledge/k5', relatedMissionIds: ['m1'], relatedResourceIds: ['r2'],
  },
  {
    id: 'k6', type: 'document', title: 'מסמך: נוהל תיקוף קמ"ן למרשמי תנועה',
    summary: 'נוהל מטה המפרט את שלבי התיקוף הנדרשים למרשם לפני אישור מבצעי.',
    date: '2025-06-01', domain: 'מבצעים ותכנון', unit: 'מודיעין גזרה',
    relevanceReason: 'רלוונטי לפער התיקוף הפתוח במבצע שחר בטוח.', confidence: 'medium',
    sourceLink: '#/deep-link/knowledge/k6', relatedMissionIds: ['m4'],
    fileKind: 'document', fileFormat: 'PDF', sourceSystem: 'SharePoint — מודיעין גזרה',
    ownerUserId: 'u3', lastUpdated: '2026-07-19T08:00:00',
    deepLinkLabel: 'פתח ב-SharePoint', deepLinkUrl: 'https://sharepoint.mil/intel/kaman-validation-sop.pdf',
  },
  {
    id: 'k7', type: 'document', title: 'תיקיית מבצע: אופק צפוני — מסמכי תכנון',
    summary: 'תיקיית התכנון המרכזית של אופק צפוני: פקודת מבצע, נספחי אש, טבלת תיאום משאבי אוויר וגרסאות קודמות.',
    date: '2026-07-15', domain: 'מבצעים ותכנון', unit: 'מפקדת גזרה צפון',
    relevanceReason: 'מרכזת את כלל מסמכי התכנון של אופק צפוני — נקודת הפתיחה לכל החלטה על המבצע.', confidence: 'high',
    sourceLink: '#/deep-link/knowledge/k7', relatedMissionIds: ['m1'],
    fileKind: 'folder', fileFormat: 'תיקייה', sourceSystem: 'SharePoint — מפקדת גזרה צפון',
    ownerUserId: 'u2', lastUpdated: '2026-07-21T16:30:00',
    deepLinkLabel: 'פתח את התיקייה ב-SharePoint', deepLinkUrl: 'https://sharepoint.mil/ops/ofek-tsofoni',
  },
  {
    id: 'k8', type: 'document', title: 'מסמך: מדיניות אש מעודכנת — נספח קווי תיאום',
    summary: 'הנספח המחייב של מדיניות האש המעודכנת, כולל קווי התיאום שדורשים תיקוף מול קמ"ן.',
    date: '2026-07-20', domain: 'מרחב גאוגרפי ואש', unit: 'אג"ם גזרה',
    relevanceReason: 'המסמך שעליו מבוססת ההשפעה הנוכחית על אופק צפוני — בסיס להחלטת התיאום מחדש.', confidence: 'high',
    sourceLink: '#/deep-link/knowledge/k8', relatedMissionIds: ['m1', 'm3'],
    fileKind: 'document', fileFormat: 'DOCX', sourceSystem: 'SharePoint — אג"ם גזרה',
    ownerUserId: 'u2', lastUpdated: '2026-07-20T11:15:00',
    deepLinkLabel: 'פתח ב-SharePoint', deepLinkUrl: 'https://sharepoint.mil/agam/fire-policy-annex.docx',
  },
  {
    id: 'k9', type: 'document', title: 'טבלת סד"כ ומשאבים — גזרה צפון (חי)',
    summary: 'קובץ מעקב הקצאת אמצעים וסד"כ המתעדכן ידנית ע"י לוגיסטיקה גזרה; כולל מסוקי תובלה ותחנות תדלוק.',
    date: '2026-07-18', domain: 'משאבים וסד"כ', unit: 'לוגיסטיקה גזרה',
    relevanceReason: 'מקור האמת הנוכחי להקצאת מסוקי התובלה שבקונפליקט — נדרש לפני החלטת תיעדוף.', confidence: 'medium',
    sourceLink: '#/deep-link/knowledge/k9', relatedMissionIds: ['m1', 'm5'], relatedResourceIds: ['r2', 'r5'],
    fileKind: 'document', fileFormat: 'XLSX', sourceSystem: 'SharePoint — לוגיסטיקה גזרה',
    ownerUserId: 'u4', lastUpdated: '2026-07-18T07:45:00',
    deepLinkLabel: 'פתח ב-SharePoint', deepLinkUrl: 'https://sharepoint.mil/log/sadak-north.xlsx',
  },
];

export const knowledgeForMission = (missionId: string) =>
  knowledgeItems.filter(k => k.relatedMissionIds.includes(missionId));
