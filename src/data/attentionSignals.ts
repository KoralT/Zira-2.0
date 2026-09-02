// Commander Space — Attention signals (consumed, not synthesized).
//
// These represent outputs Commander Space CONSUMES from the rest of Sigma. Nothing here is computed
// in the UI: the cross-domain relationship (safety event → axis closed → the plan's movement
// assumption no longer holds → reassess) is an already-produced Context & Meaning Operational Signal
// (see `signal` + the synthesized evidence piece). No machine readiness score. No fabricated
// recommendation. The flagship references an existing operation ("אופק צפוני") so the Attention
// entry ties into the operations the user already sees below.

export type AttForm = 'awareness' | 'decision' | 'approval' | 'action';

export const ATT_FORM_LABEL: Record<AttForm, string> = {
  awareness: 'מודעות',
  decision: 'החלטה',
  approval: 'אישור',
  action: 'פעולה',
};

export type EvKind = 'fact' | 'synthesized' | 'fact-unverified';
export const EV_KIND_LABEL: Record<EvKind, string> = {
  fact: 'עובדה',
  synthesized: 'משמעות מסונתזת',
  'fact-unverified': 'טרם תוקף',
};

// Trust by exception, provenance by default. A normal fact shows only source · freshness.
// Synthesized meaning is traceable to the shown sources (not "uncertain / interpretation").
// An `issue` is surfaced only when there is a real trust problem (e.g. unverified).
export interface EvPiece {
  label: string;
  source: string;      // user-facing source — no internal architecture / debug terms
  freshness?: string;  // provenance by default
  kind: EvKind;
  derived?: boolean;   // synthesized meaning derived from the shown sources
  fact?: string;       // a useful factual unknown (not a trust issue)
  issue?: string;      // trust-by-exception warning, shown prominently
}

export interface FlagshipSignal {
  id: string;
  forms: AttForm[];
  // Primary view — the only things the user must consume: what happened · what it means · what to do.
  headline: string;    // what happened
  meaning: string;     // what it means for me
  actionLabel: string; // what to do (a single primary action → hands off to Planning)
  why: string;         // short causal explanation, on demand ("למה?")
  // --- Underlying model (kept, NOT surfaced as primary UI) ---
  matters: string;
  consequence: string;
  signal: string; // the consumed C&M Operational Signal statement
  understand: {
    affected: string;
    dependency: string;
    consequenceForPlan: string;
    knownUnknowns: string[];
  };
  // Decision-space support (NOT recommendations, NOT equal CTAs). Helps the user understand the
  // shape of the decision when Sigma cannot responsibly recommend a preferred action.
  decisionSpace: {
    options: { label: string; note: string }[];
    noPreferred: string;
  };
  evidence: EvPiece[];
}

export interface SecondaryItem {
  id: string;
  forms: AttForm[];
  headline: string;
  sub: string;
  contextLine?: string;
  reviewLabel?: string; // entry-level review action (approval); Awareness-only items have none
  reviewTo?: string;    // route the review/view opens
}

// Flagship — Awareness + Action; honest no-recommendation (+ insufficient-evidence facet).
export const FLAGSHIP: FlagshipSignal = {
  id: 'axis-closure',
  forms: ['awareness', 'action'],
  headline: 'ציר לביא, שעליו נשענת תוכנית התנועה של אופק צפוני, נחסם.',
  meaning: 'היציאה המתוכננת עלולה לא להתאפשר במסלול ובזמן שנקבעו.',
  actionLabel: 'בחן מחדש את תוכנית התנועה',
  why: 'תוכנית התנועה של אופק צפוני נשענת על ציר לביא כמסלול הגישה. הציר נחסם (חסימת בטיחות), ולכן לא ניתן להניח שהיציאה תתאפשר במסלול ובזמן שנקבעו.',
  matters: 'התכנון הניח שציר "לביא" פתוח למעבר — הנחה זו אינה מתקיימת עוד.',
  consequence: 'לא ניתן להניח שהמבצע יֵצא כמתוכנן עד לבחינה מחדש של התנועה.',
  signal:
    'הנחת התנועה שהמבצע מסתמך עליה אינה מתקיימת עוד — נדרשת בחינה מחדש לפני שמניחים שהמבצע יכול לצאת כמתוכנן.',
  understand: {
    affected: 'ציר "לביא" — סטטוס נוכחי: חסום (חסימת בטיחות).',
    dependency: 'תוכנית "אופק צפוני" מגדירה את ציר לביא כציר התנועה העיקרי לגישה.',
    consequenceForPlan: 'חלון היציאה המתוכנן מבוסס על מעבר דרך הציר; החסימה מבטלת את ההנחה שהתנועה אפשרית כמתוכנן.',
    knownUnknowns: [
      'משך החסימה אינו ידוע — לא ברור אם תוסר בזמן הרלוונטי ליציאה.',
      'קיים ציר חלופי ("ציר ברק"), אך התאמתו, תזמונו וזמינותו למבצע לא תוקפו.',
    ],
  },
  decisionSpace: {
    options: [
      { label: 'לבחון חלופה', note: 'ציר ברק קיים, אך התאמתו וזמינותו טרם תוקפו.' },
      { label: 'להמתין לעדכון', note: 'משך החסימה עדיין אינו ידוע.' },
      { label: 'לבחון שינוי בתוכנית', note: 'אם חלון היציאה לא יכול להישמר.' },
    ],
    noPreferred: 'אין כרגע חלופה מועדפת על בסיס המידע הקיים.',
  },
  evidence: [
    { label: 'אירוע בטיחות — חסימת ציר לביא', source: 'ניהול אירועים', freshness: 'לפני 40 דק׳', kind: 'fact', fact: 'משך החסימה טרם ידוע.' },
    { label: 'תלות מתועדת: "אופק צפוני" ← ציר לביא', source: 'מאגר מבצעים', freshness: 'עודכן לפני יומיים', kind: 'fact' },
    { label: 'החסימה נמצאת על ציר לביא, המשמש כציר הגישה המתועד בתוכנית התנועה של אופק צפוני', source: 'גאוגרפיה', freshness: 'לפני 40 דק׳', kind: 'fact' },
    { label: 'המשמעות: הנחת התנועה אינה מתקיימת — נדרשת בחינה מחדש', source: 'הקשר ומשמעות', kind: 'synthesized', derived: true },
    { label: 'ציר חלופי אפשרי: ציר ברק', source: 'גאוגרפיה / מבצעים', kind: 'fact-unverified', issue: 'התאמה, תזמון וזמינות טרם תוקפו.' },
  ],
};

// Secondary Attention — only what genuinely requires the user. The approval is waiting on this
// user, so it belongs here (entry-level review only). A merely-relevant directive that requires
// nothing from the user is NOT Attention — it lives under "מאז שהיית כאן" (continuity) instead.
export const SECONDARY: SecondaryItem[] = [
  {
    id: 'approval-move',
    forms: ['approval'],
    headline: '"שחר בטוח" ממתין לאישורך',
    sub: 'המשך ההיערכות תלוי בהחלטתך. תנאי אחד טרם הושלם: תיאום עם גורם שכן.',
    reviewLabel: 'בחן את האישור',
    reviewTo: '/portfolio',
  },
  {
    // An unresolved directive obligation — belongs in Attention (requires a response from this user).
    // Routes to the existing directive detail; the Directives workflow is not changed here.
    id: 'directive-policy',
    forms: ['awareness'],
    headline: 'שינוי במדיניות אש דורש את התייחסותך',
    sub: 'ההנחיה חלה על הגזרה שלך וטרם טופלה.',
    reviewLabel: 'פתח את ההנחיה',
    reviewTo: '/directives/d1',
  },
];
