import type { EvidenceSource } from './types';

export const evidenceSources: EvidenceSource[] = [
  {
    id: 'e1', sourceSystem: 'מערכת פקודות ומדיניות', ownerUserId: 'u1',
    lastUpdated: '2026-07-21T18:00:00', confidence: 'high', hasContradiction: false,
    missingInfo: [], relatedEntityIds: ['d1', 'm1', 'm3'],
    deepLinkLabel: 'פתח במערכת הפקודות', deepLinkUrl: '#/deep-link/orders/policy-fire-v2',
    reasoning: 'המסמך פורסם רשמית במקור החיצוני, אך ההנחיה המקבילה במערכת עדיין בטיוטה — לחיצה על "פרסם והפעל השפעה" בעמוד ההנחיה תפעיל את שרשרת הקישור למבצעים.',
    auditTrail: [
      { timestamp: '2026-07-21T18:00:00', actor: 'אל"מ דן שגיא', action: 'פרסום מדיניות אש גרסה 2 (מקור חיצוני)' },
    ],
  },
  {
    id: 'e2', sourceSystem: 'גאנטאיט — סטטוס מבצע', ownerUserId: 'u2',
    lastUpdated: '2026-07-22T07:40:00', confidence: 'medium', hasContradiction: true,
    contradictionNote: 'רמת המוכנות שדווחה בגאנטאיט (61%) שונה מהדיווח הידני האחרון של קמ"ן (68%).',
    missingInfo: ['תיקוף קמ"ן עדכני'], relatedEntityIds: ['m1'],
    deepLinkLabel: 'פתח בגאנטאיט', deepLinkUrl: '#/deep-link/ganttait/m1',
    reasoning: 'זוהה פער בין מדיניות האש המעודכנת לבין התוכנית המבצעית, מהצלבת דרישות ה-Readiness הפתוחות מול הסטטוס העדכני של המשאבים והאישורים. נדרש תיאום מחדש ותיקוף קווי התיאום.',
    auditTrail: [
      { timestamp: '2026-07-21T18:10:00', actor: 'Sigma', action: 'זוהה פער בין מדיניות האש המעודכנת לבין התוכנית המבצעית. נדרש תיאום מחדש ותיקוף קווי התיאום.' },
      { timestamp: '2026-07-22T07:40:00', actor: 'מערכת גאנטאיט', action: 'עדכון סטטוס אוטומטי' },
    ],
  },
  {
    id: 'e3', sourceSystem: 'מערכת סד"כ ותכנון', ownerUserId: 'u5',
    lastUpdated: '2026-07-20T09:00:00', confidence: 'high', hasContradiction: false,
    missingInfo: [], relatedEntityIds: ['d2', 'm2'],
    deepLinkLabel: 'פתח במערכת התכנון', deepLinkUrl: '#/deep-link/planning/priorities',
    reasoning: 'עדכון סדרי העדיפויות נקלט ממערכת התכנון ומקושר למבצעים לפי שיוך יחידתי.',
    auditTrail: [{ timestamp: '2026-07-20T09:05:00', actor: 'Sigma', action: 'קישור הנחיה למבצעים מושפעים' }],
  },
  {
    id: 'e4', sourceSystem: 'מערכת מרשמים', ownerUserId: 'u3',
    lastUpdated: '2026-07-19T10:00:00', confidence: 'low', hasContradiction: false,
    missingInfo: ['תיקוף קמ"ן', 'אישור תנועת אוכלוסייה'], relatedEntityIds: ['m4'],
    deepLinkLabel: 'פתח במערכת המרשמים', deepLinkUrl: '#/deep-link/marsham/m4',
    reasoning: 'המרשם טרם אושר סופית ולכן רמת האמון נמוכה עד להשלמת התיקוף.',
    auditTrail: [{ timestamp: '2026-07-19T10:00:00', actor: 'מערכת מרשמים', action: 'טיוטת מרשם נוצרה' }],
    validationStatus: undefined,
  },
  {
    id: 'e5', sourceSystem: 'GIS — שכבות מרחביות', ownerUserId: 'u4',
    lastUpdated: '2026-07-15T08:00:00', confidence: 'low', hasContradiction: false,
    missingInfo: ['עדכון שכבת זמינות כוח אחרון מ-7 ימים'], relatedEntityIds: ['m5', 'd3'],
    deepLinkLabel: 'פתח ב-GIS', deepLinkUrl: '#/deep-link/gis/m5',
    reasoning: 'לא זוהה עדכון מקור בשבוע האחרון עבור זמינות הכוח באזור הציר הדרומי.',
    auditTrail: [{ timestamp: '2026-07-15T08:00:00', actor: 'GIS', action: 'עדכון שכבה אחרון' }],
  },
  {
    id: 'e6', sourceSystem: 'דיווח שטח', ownerUserId: 'u3',
    lastUpdated: '2026-07-22T06:00:00', confidence: 'medium', hasContradiction: false,
    missingInfo: [], relatedEntityIds: ['m1'],
    deepLinkLabel: 'פתח בדיווחי שטח', deepLinkUrl: '#/deep-link/field-reports/m1',
    reasoning: 'דיווח שטח עדכני מאשש חלקית את הצורך בתיקוף מחודש של קווי התיאום.',
    auditTrail: [{ timestamp: '2026-07-22T06:00:00', actor: 'מוצב תצפית 4', action: 'דיווח שטח שוטף' }],
  },
];

export const getEvidence = (id: string) => evidenceSources.find(e => e.id === id);
