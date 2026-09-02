import type { AttentionAlert } from './types';

export const seedAlerts: AttentionAlert[] = [
  // --- Action Required (5) ---
  {
    id: 'a1', type: 'action-required', title: 'מבצע "אופק צפוני" ממתין לאישור שלך',
    description: 'חסר אישור קמ"ן, תיקוף משאב (מסוק תובלה) ו-Evidence אחד אינו מעודכן.',
    urgency: 'critical', relatedEntity: { type: 'mission', id: 'm1', label: 'אופק צפוני' },
    reasonForUser: 'את/ה בעל/ת האחריות לאישור הסופי של המבצע.', detectedAt: '2026-07-21T18:15:00',
    sourceId: 'src-ganttait', confidence: 'medium', recommendedAction: 'בדוק/י את פערי המוכנות ואשר/י או החזר/י לטיפול.',
    assignedToUserId: 'u1', status: 'new',
  },
  {
    id: 'a2', type: 'action-required', title: 'נדרש תיקוף קמ"ן למרשם התנועה של מבצע שחר בטוח',
    description: 'המרשם ממתין לתיקוף מודיעיני לפני שניתן להעביר לאישור סופי.',
    urgency: 'high', relatedEntity: { type: 'mission', id: 'm4', label: 'שחר בטוח' },
    reasonForUser: 'תיקוף המרשם באחריות קצין המודיעין.', detectedAt: '2026-07-21T20:35:00',
    sourceId: 'src-marsham', confidence: 'medium', recommendedAction: 'בצע/י תיקוף קמ"ן ועדכן/י את הסטטוס במרשם.',
    assignedToUserId: 'u3', status: 'new',
  },
  {
    id: 'a3', type: 'action-required', title: 'אישור הקצאת משאבים למבצע מגן מזרחי ממתין לך',
    description: 'הקצאת רכב שריון תגבור טעונה אישור לוגיסטי לפני שנייה.',
    urgency: 'medium', relatedEntity: { type: 'mission', id: 'm2', label: 'מגן מזרחי' },
    reasonForUser: 'האישור משויך לתפקידך כרמ"ד תכנון.', detectedAt: '2026-07-20T15:25:00',
    sourceId: 'src-log', confidence: 'high', recommendedAction: 'בדוק/י את פרטי ההקצאה ואשר/י.',
    assignedToUserId: 'u5', status: 'new',
  },
  {
    id: 'a4', type: 'action-required', title: 'יש להשלים Evidence למבצע גשר דרומי',
    description: 'שכבת ה-GIS לזמינות כוח לא עודכנה 7 ימים — נדרשת השלמה לפני חידוש הפעילות.',
    urgency: 'medium', relatedEntity: { type: 'mission', id: 'm5', label: 'גשר דרומי' },
    reasonForUser: 'המשאב באחריות לוגיסטיקה גזרה.', detectedAt: '2026-07-20T08:00:00',
    sourceId: 'src-gis', confidence: 'low', recommendedAction: 'עדכן/י את שכבת הזמינות או סמן/י כמתוקף.',
    assignedToUserId: 'u4', status: 'new',
  },

  // --- Anomaly Detected (4 in original scope; a5/an1/c1 removed — they are now produced live by
  // publishDirectiveWithImpact() instead of being pre-baked in seed data) ---
  {
    id: 'an2', type: 'anomaly', title: 'קונפליקט משאבים: מסוק תובלה משובץ לשני מבצעים',
    description: 'אותו מסוק תובלה מוקצה גם לאופק צפוני וגם לשחר בטוח באותו חלון זמן.',
    urgency: 'high', relatedEntity: { type: 'resource', id: 'r2', label: 'מסוק תובלה' },
    reasonForUser: 'ניהול המשאב באחריות לוגיסטיקה גזרה.', detectedAt: '2026-07-21T19:00:00',
    sourceId: 'src-log', confidence: 'high', recommendedAction: 'בדוק/י חלופה או קבע/י עדיפות בין המבצעים.',
    assignedToUserId: 'u4', status: 'new',
  },
  {
    id: 'an3', type: 'anomaly', title: 'נתון סותר בין גאנטאיט למרשם — מבצע שחר בטוח',
    description: 'סטטוס המוכנות בגאנטאיט אינו תואם את נתוני המרשם העדכניים.',
    urgency: 'medium', relatedEntity: { type: 'mission', id: 'm4', label: 'שחר בטוח' },
    reasonForUser: 'המבצע בתחום אחריותך הישיר.', detectedAt: '2026-07-21T20:40:00',
    sourceId: 'src-marsham', confidence: 'medium', recommendedAction: 'הצלב/י מקורות וסמן/י איזה נתון נכון.',
    assignedToUserId: 'u2', status: 'new',
  },
  {
    id: 'an4', type: 'anomaly', title: 'פעילות תכנון במבצע "גשר דרומי" לא התקדמה 5 ימים',
    description: 'לא נרשם עדכון תכנון מהותי מזה 5 ימים, בניגוד לקצב המבצע הרגיל.',
    urgency: 'medium', relatedEntity: { type: 'mission', id: 'm5', label: 'גשר דרומי' },
    reasonForUser: 'המבצע באחריותך כבעלים.', detectedAt: '2026-07-19T09:00:00',
    sourceId: 'src-ganttait', confidence: 'medium', recommendedAction: 'בדוק/י מדוע התכנון נעצר וקבע/י המשך.',
    assignedToUserId: 'u4', status: 'read',
  },

  // --- Context Changed (5 in original scope; c1 removed — produced live by publishDirectiveWithImpact()) ---
  {
    id: 'c2', type: 'context-changed', title: 'עדכון סדרי עדיפויות משפיע על מגן מזרחי ושחר בטוח',
    description: 'שני המבצעים קיבלו עדיפות משאבים גבוהה יותר לשבועיים הקרובים.',
    urgency: 'medium', relatedEntity: { type: 'directive', id: 'd2', label: 'עדכון סדרי עדיפויות' },
    reasonForUser: 'אתה בעל תפקיד מושפע מהעדכון.', detectedAt: '2026-07-20T09:05:00',
    sourceId: 'src-orders', confidence: 'high', recommendedAction: 'עדכן/י תכנון משאבים בהתאם.',
    assignedToUserId: 'u5', status: 'read',
  },
  {
    id: 'c3', type: 'context-changed', title: 'מגבלת תנועה חדשה משפיעה על מבצע "גשר דרומי"',
    description: 'הגבלת תנועת רכבים כבדים בציר הדרומי עלולה לעכב פעילות לוגיסטית מתוכננת.',
    urgency: 'medium', relatedEntity: { type: 'directive', id: 'd3', label: 'מגבלת תנועה חדשה' },
    reasonForUser: 'ההנחיה מכוונת ליחידתך.', detectedAt: '2026-07-19T12:05:00',
    sourceId: 'src-orders', confidence: 'high', recommendedAction: 'תאם/י מחדש את חלונות התנועה בציר.',
    assignedToUserId: 'u4', status: 'new',
  },
  {
    id: 'c4', type: 'context-changed', title: 'שינוי בהקצאת משאבים משפיע על מבצע "מגן מזרחי"',
    description: 'העברת רכבי שריון בין מבצעים מחייבת תיאום עם הצוות הלוגיסטי לפני שינוי בפועל.',
    urgency: 'medium', relatedEntity: { type: 'directive', id: 'd4', label: 'שינוי בהקצאת משאבים' },
    reasonForUser: 'המבצע בתחום תכנונך.', detectedAt: '2026-07-20T15:25:00',
    sourceId: 'src-log', confidence: 'medium', recommendedAction: 'תאם/י מול לוגיסטיקה גזרה.',
    assignedToUserId: 'u5', status: 'new',
  },
  {
    id: 'c5', type: 'context-changed', title: 'הנחיית דיווח חדשה לאירועים חריגים נכנסה לתוקף',
    description: 'כל אירוע חריג ידווח תוך 30 דקות משיוך לישות המבצעית הרלוונטית.',
    urgency: 'low', relatedEntity: { type: 'directive', id: 'd5', label: 'הנחיית דיווח לאירועים חריגים' },
    reasonForUser: 'ההנחיה חלה על כלל בעלי התפקידים.', detectedAt: '2026-07-18T08:05:00',
    sourceId: 'src-orders', confidence: 'high', recommendedAction: 'ודא/י היכרות עם הנוהל המעודכן.',
    assignedToUserId: 'u3', status: 'read',
  },

  // --- Risk / Deadline (4) ---
  {
    id: 'rd1', type: 'risk-deadline', title: 'אישור מבצע "שחר בטוח" חורג מ-SLA בעוד 3 שעות',
    description: 'זמן ההמתנה לאישור מתקרב לחריגה מה-SLA המוגדר למבצעים ברמת סיכון גבוהה.',
    urgency: 'critical', relatedEntity: { type: 'mission', id: 'm4', label: 'שחר בטוח' },
    reasonForUser: 'האישור ממתין לך.', detectedAt: '2026-07-22T07:00:00',
    sourceId: 'src-ganttait', confidence: 'high', recommendedAction: 'טפל/י באישור לפני חריגת ה-SLA.',
    assignedToUserId: 'u1', status: 'new',
  },
  {
    id: 'rd2', type: 'risk-deadline', title: 'תוקף הנחיית "מגבלת תנועה חדשה" עומד לפוג בעוד יומיים',
    description: 'אם לא תפורסם גרסה מעודכנת, המגבלה תפוג באופן אוטומטי ב-24/07.',
    urgency: 'medium', relatedEntity: { type: 'directive', id: 'd3', label: 'מגבלת תנועה חדשה' },
    reasonForUser: 'ההנחיה חלה על יחידתך.', detectedAt: '2026-07-22T07:10:00',
    sourceId: 'src-orders', confidence: 'high', recommendedAction: 'בדוק/י אם נדרשת הארכה או ביטול.',
    assignedToUserId: 'u4', status: 'new',
  },
  {
    id: 'rd3', type: 'risk-deadline', title: 'משימה ללא Owner במבצע "גשר דרומי"',
    description: 'דרישת המוכנות "זמינות תחנת תדלוק נייד" נותרה ללא בעלים מוגדר.',
    urgency: 'medium', relatedEntity: { type: 'mission', id: 'm5', label: 'גשר דרומי' },
    reasonForUser: 'המבצע בתחום אחריותך.', detectedAt: '2026-07-19T09:10:00',
    sourceId: 'src-log', confidence: 'medium', recommendedAction: 'שייך/י בעלים לדרישה.',
    assignedToUserId: 'u4', status: 'new',
  },
  {
    id: 'rd4', type: 'risk-deadline', title: 'אישור הקצאת משאבים במבצע "מגן מזרחי" טרם התקבל 48 שעות',
    description: 'האישור פתוח מעל לזמן היעד הרגיל וללא תגובה.',
    urgency: 'medium', relatedEntity: { type: 'mission', id: 'm2', label: 'מגן מזרחי' },
    reasonForUser: 'האישור באחריותך.', detectedAt: '2026-07-22T07:20:00',
    sourceId: 'src-log', confidence: 'high', recommendedAction: 'טפל/י באישור או העבר/י להסלמה.',
    assignedToUserId: 'u5', status: 'new',
  },

  // --- Information Gap (4) ---
  {
    id: 'ig1', type: 'information-gap', title: 'לא נמצא מקור עדכני עבור זמינות כוח במבצע "גשר דרומי"',
    description: 'שכבת ה-GIS לזמינות כוח לא עודכנה שבוע. חוסר עדכניות עלול להטעות בקבלת החלטה.',
    urgency: 'low', relatedEntity: { type: 'mission', id: 'm5', label: 'גשר דרומי' },
    reasonForUser: 'המשאב באחריותך.', detectedAt: '2026-07-20T08:05:00',
    sourceId: 'src-gis', confidence: 'low', recommendedAction: 'בקש/י עדכון שכבה מהמקור.',
    assignedToUserId: 'u4', status: 'resolved',
  },
  {
    id: 'ig2', type: 'information-gap', title: 'Evidence חסר לדרישת מוכנות מודיעין באופק צפוני',
    description: 'דרישת הערכת האיום העדכנית מסומנת חלקית ללא Evidence תומך אחרון.',
    urgency: 'medium', relatedEntity: { type: 'mission', id: 'm1', label: 'אופק צפוני' },
    reasonForUser: 'הדרישה באחריותך כקצין מודיעין.', detectedAt: '2026-07-22T06:10:00',
    sourceId: 'src-intel', confidence: 'medium', recommendedAction: 'צרף/י Evidence עדכני לדרישה.',
    assignedToUserId: 'u3', status: 'new',
  },
  {
    id: 'ig3', type: 'information-gap', title: 'ישות לא מקושרת: תוצר תכנון לא מתויג למבצע "מגן מזרחי"',
    description: 'זוהה תוצר תכנון שייתכן שרלוונטי למבצע אך אינו מתויג אליו.',
    urgency: 'low', relatedEntity: { type: 'mission', id: 'm2', label: 'מגן מזרחי' },
    reasonForUser: 'המבצע בתחום תכנונך.', detectedAt: '2026-07-21T10:00:00',
    sourceId: 'src-ganttait', confidence: 'low', recommendedAction: 'בדוק/י את התוצר המוצע ואשר/י קישור.',
    assignedToUserId: 'u5', status: 'new',
  },
  {
    id: 'ig4', type: 'information-gap', title: 'קישור מוצע בין דיווח חריג לבין מבצע "קו אדום" דורש ולידציה',
    description: 'המערכת זיהתה קשר אפשרי בין דיווח שטח עדכני לבין המבצע, אך הוא טרם תוקף אנושית.',
    urgency: 'low', relatedEntity: { type: 'mission', id: 'm3', label: 'קו אדום' },
    reasonForUser: 'המבצע בתחום אחריותך.', detectedAt: '2026-07-22T06:05:00',
    sourceId: 'src-field', confidence: 'medium', recommendedAction: 'אשר/י או דחה/י את הקישור המוצע.',
    assignedToUserId: 'u1', status: 'new',
  },
];
