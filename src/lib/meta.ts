import type { AlertType } from '../data/types';

export type Tone = 'blue' | 'teal' | 'green' | 'amber' | 'red' | 'purple' | 'gray';

export const meansStatusMeta: Record<string, { label: string; tone: Tone }> = {
  allocated: { label: 'מוקצה ואושר', tone: 'green' },
  partial: { label: 'מוקצה חלקית', tone: 'amber' },
  pending: { label: 'ממתין להקצאה', tone: 'amber' },
  unavailable: { label: 'לא זמין', tone: 'red' },
};

export const alertTypeMeta: Record<AlertType, { label: string; tone: Tone }> = {
  'action-required': { label: 'דורש פעולה', tone: 'red' },
  'anomaly': { label: 'חריגה', tone: 'amber' },
  'context-changed': { label: 'שינוי הקשר', tone: 'purple' },
  'risk-deadline': { label: 'סיכון / דדליין', tone: 'red' },
  'information-gap': { label: 'פער מידע', tone: 'gray' },
};

export const urgencyMeta: Record<string, { label: string; tone: Tone }> = {
  low: { label: 'נמוכה', tone: 'gray' },
  medium: { label: 'בינונית', tone: 'amber' },
  high: { label: 'גבוהה', tone: 'red' },
  critical: { label: 'קריטית', tone: 'red' },
};

export const missionStatusMeta: Record<string, { label: string; tone: Tone }> = {
  planned: { label: 'בתכנון', tone: 'blue' },
  active: { label: 'פעיל', tone: 'green' },
  paused: { label: 'מוקפא', tone: 'amber' },
  completed: { label: 'הסתיים', tone: 'gray' },
};

export const riskMeta: Record<string, { label: string; tone: Tone }> = {
  low: { label: 'סיכון נמוך', tone: 'green' },
  medium: { label: 'סיכון בינוני', tone: 'amber' },
  high: { label: 'סיכון גבוה', tone: 'red' },
};

export const confidenceMeta: Record<string, { label: string; tone: Tone }> = {
  low: { label: 'Confidence: נמוך', tone: 'red' },
  medium: { label: 'Confidence: בינוני', tone: 'amber' },
  high: { label: 'Confidence: גבוה', tone: 'green' },
};

export const readinessStatusMeta: Record<string, { label: string; tone: Tone }> = {
  met: { label: 'מולא', tone: 'green' },
  partial: { label: 'חלקי', tone: 'amber' },
  missing: { label: 'חסר', tone: 'red' },
};

export const approvalStatusMeta: Record<string, { label: string; tone: Tone }> = {
  pending: { label: 'ממתין', tone: 'amber' },
  approved: { label: 'אושר', tone: 'green' },
  rejected: { label: 'נדחה', tone: 'red' },
};

export const taskStatusMeta: Record<string, { label: string; tone: Tone }> = {
  open: { label: 'פתוח', tone: 'blue' },
  'in-progress': { label: 'בטיפול', tone: 'amber' },
  done: { label: 'הושלם', tone: 'green' },
};

export const directiveStatusMeta: Record<string, { label: string; tone: Tone }> = {
  draft: { label: 'טיוטה', tone: 'gray' },
  published: { label: 'פורסם', tone: 'green' },
  cancelled: { label: 'בוטל', tone: 'red' },
  superseded: { label: 'הוחלף', tone: 'gray' },
};

export const alertStatusMeta: Record<string, { label: string; tone: Tone }> = {
  new: { label: 'חדש', tone: 'red' },
  read: { label: 'נקרא', tone: 'blue' },
  snoozed: { label: 'הושהה', tone: 'gray' },
  resolved: { label: 'טופל', tone: 'green' },
  escalated: { label: 'הוסלם', tone: 'purple' },
};

export const resourceAvailabilityMeta: Record<string, { label: string; tone: Tone }> = {
  available: { label: 'זמין', tone: 'green' },
  partial: { label: 'זמינות חלקית', tone: 'amber' },
  unavailable: { label: 'לא זמין', tone: 'red' },
};

export const eventSeverityMeta: Record<string, { label: string; tone: Tone }> = {
  low: { label: 'חומרה נמוכה', tone: 'gray' },
  medium: { label: 'חומרה בינונית', tone: 'amber' },
  high: { label: 'חומרה גבוהה', tone: 'red' },
  critical: { label: 'חומרה קריטית', tone: 'red' },
};

export const eventCategoryMeta: Record<string, { label: string; tone: Tone }> = {
  'security-breach': { label: 'חדירה / ביטחון', tone: 'red' },
  'enemy-change': { label: 'שינוי מצב אויב', tone: 'purple' },
  'readiness-fault': { label: 'תקלת כשירות', tone: 'amber' },
  'safety': { label: 'בטיחות', tone: 'amber' },
  'field-report': { label: 'דיווח שדה', tone: 'blue' },
  'schedule-change': { label: 'שינוי לוח זמנים', tone: 'purple' },
};

export const eventStatusMeta: Record<string, { label: string; tone: Tone }> = {
  new: { label: 'חדש', tone: 'red' },
  'under-assessment': { label: 'בהערכה', tone: 'amber' },
  linked: { label: 'מקושר', tone: 'blue' },
  handled: { label: 'טופל', tone: 'green' },
  closed: { label: 'סגור', tone: 'gray' },
};

export const knowledgeTypeMeta: Record<string, { label: string; tone: Tone }> = {
  decision: { label: 'החלטת עבר', tone: 'blue' },
  lesson: { label: 'לקח', tone: 'amber' },
  'similar-op': { label: 'מבצע דומה', tone: 'purple' },
  'past-directive': { label: 'הנחיה קודמת', tone: 'teal' },
  incident: { label: 'אירוע דומה', tone: 'red' },
  document: { label: 'מסמך', tone: 'gray' },
};
