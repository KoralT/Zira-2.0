// Commander Space vNext — Prototype 01 · Attention content model + fixtures
//
// IMPORTANT (product boundary):
//  - Commander Space CONSUMES what other Sigma capabilities produce. Nothing here is computed
//    in the UI. The cross-domain relationship (event → axis closed → the plan's movement
//    assumption no longer holds → reassess) is represented as an already-produced Context &
//    Meaning "Operational Signal" (see `signal` + the synthesized evidence piece). The safety
//    event, the axis status and the plan dependency are represented as source facts.
//  - There is NO machine readiness score anywhere. Consequence is expressed as a plain
//    operational statement ("cannot be assumed to proceed as planned until reassessed").
//  - "Operation Commander" is illustrative only — not a canonical persona / RBAC model.

export type AttentionForm = 'awareness' | 'decision' | 'approval' | 'action';

// A form is NOT a priority level. An item may carry more than one form (the flagship is
// Awareness + Action). Ordering below is a deliberate fixture choice, not a computed score.
export const FORM_LABEL: Record<AttentionForm, string> = {
  awareness: 'מודעות',
  decision: 'החלטה',
  approval: 'אישור',
  action: 'פעולה',
};

export type RecommendationState = 'none' | 'exists' | 'insufficient-evidence';
export type EvidenceKind = 'fact' | 'synthesized' | 'fact-unverified';

export const EVIDENCE_KIND_LABEL: Record<EvidenceKind, string> = {
  fact: 'עובדה',
  synthesized: 'משמעות מסונתזת',
  'fact-unverified': 'עובדה לא מתוקפת',
};

export interface EvidencePiece {
  label: string;
  sourceOwner: string; // the domain / system that OWNS this — Commander Space only consumes it
  freshness: string;
  kind: EvidenceKind;
  uncertainty: string;
  note?: string;
}

export type ActionKind =
  | 'reassess'            // records intent + follow-up, hands the re-plan to Planning
  | 'handoff-control'     // opens the Control-owned event (read context)
  | 'handoff-operation'   // opens the operation context
  | 'approve' | 'reject'  // entry-level only; gate-vs-advisory intentionally NOT decided
  | 'acknowledge';        // mark an awareness item understood

export interface AttentionAction {
  id: string;
  label: string;
  kind: ActionKind;
  belief: string; // what the user believes will happen
  effect: string; // what actually happens
  locus: 'in-commander-space' | 'handoff';
  handoffTarget?: string;
}

export interface AttentionItem {
  id: string;
  forms: AttentionForm[];
  // The hierarchy hypothesis lives here. Prototype 01 ships "one dominant + quieter secondary".
  // Change these values (or HIERARCHY_MODE below) to test a peer hierarchy — nothing else needs
  // to change. Hierarchy is what we are validating; it is NOT Product Truth.
  prominence: 'dominant' | 'secondary';
  order: number; // contextual ordering in the fixture — not a score

  headline: string;   // what changed, in plain language
  matters: string;    // why it matters
  relevance: string;  // why it requires THIS user

  // Flagship-depth fields (secondary items leave most of these empty):
  consequence?: string;             // plain consequence framing (never a readiness score)
  signal?: string;                  // the consumed C&M Operational Signal statement
  understand?: {
    affected: string;
    dependency: string;
    consequenceForPlan: string;
    knownUnknowns: string[];
  };
  recommendationState: RecommendationState;
  noRecommendationNote?: string;    // why there is no preferred action
  insufficientEvidenceNote?: string;// distinct: not enough trustworthy info to advise
  evidence?: EvidencePiece[];

  actions: AttentionAction[];
  // Secondary-item context line (e.g. an approval's missing condition), shown as context only.
  contextLine?: string;
}

// ── Hierarchy switch for validation ────────────────────────────────────────────
// 'dominant-plus-secondary' (default hypothesis) or 'peers' (renders every item equally).
export type HierarchyMode = 'dominant-plus-secondary' | 'peers';
export const HIERARCHY_MODE: HierarchyMode = 'dominant-plus-secondary';

// ── The illustrative anchor user (NOT a canonical persona) ──────────────────────
export const ANCHOR_USER = {
  name: 'מפקד המבצע',
  operation: 'רכס צפוני',
  note: 'תפקיד להמחשה בלבד — לא מודל משתמש/הרשאות',
};

// ── The Attention set (3 items; only #1 is the flagship) ────────────────────────
export const ATTENTION_ITEMS: AttentionItem[] = [
  // 1 · FLAGSHIP — Awareness + Action, honest no-recommendation (+ insufficient-evidence facet)
  {
    id: 'axis-closure',
    forms: ['awareness', 'action'],
    prominence: 'dominant',
    order: 1,
    headline: 'ציר תנועה שהמבצע "רכס צפוני" מסתמך עליו נחסם',
    matters: 'תוכנית התנועה של המבצע הניחה שציר "לביא" פתוח למעבר — הנחה זו אינה מתקיימת עוד.',
    relevance: 'אתה מפקד "רכס צפוני" — ההחלטה אם המבצע יכול לצאת כמתוכנן היא באחריותך.',
    consequence: 'לא ניתן להניח שהמבצע יֵצא כמתוכנן עד לבחינה מחדש של התנועה.',
    signal:
      'הנחת התנועה שהמבצע מסתמך עליה אינה מתקיימת עוד — נדרשת בחינה מחדש לפני שמניחים שהמבצע יכול לצאת כמתוכנן.',
    understand: {
      affected: 'ציר "לביא" — סטטוס נוכחי: חסום (חסימת בטיחות).',
      dependency: 'תוכנית "רכס צפוני" מגדירה את ציר לביא כציר התנועה העיקרי לגישה.',
      consequenceForPlan:
        'חלון היציאה המתוכנן מבוסס על מעבר דרך הציר; החסימה מבטלת את ההנחה שהתנועה אפשרית כמתוכנן.',
      knownUnknowns: [
        'משך החסימה אינו ידוע — לא ברור אם תוסר בזמן הרלוונטי ליציאה.',
        'קיים ציר חלופי ("ציר ברק"), אך התאמתו, תזמונו וזמינותו למבצע לא תוקפו.',
      ],
    },
    recommendationState: 'none',
    noRecommendationNote:
      'Sigma חיברה את התמונה והציפה מה דורש אותך — אך אין פעולה מומלצת אחת עדיפה. הבחירה בין המתנה, ניתוב מחדש או דחייה היא שיקול מפקדי שלך.',
    insufficientEvidenceNote:
      'ציר ברק קיים כאפשרות, אך אין מספיק מידע מהימן (התאמה · תזמון · זמינות) כדי להמליץ עליו כעת.',
    evidence: [
      {
        label: 'אירוע בטיחות — חסימת ציר לביא',
        sourceOwner: 'ניהול אירועים (Control) · אירוע EV-2231',
        freshness: 'לפני ~40 דק׳',
        kind: 'fact',
        uncertainty: 'נמוכה — עצם החסימה מדווח',
        note: 'משך החסימה טרם ידוע. האירוע מנוהל ב-Control — לא כאן.',
      },
      {
        label: 'תלות מתועדת: תוכנית "רכס צפוני" ← ציר לביא',
        sourceOwner: 'מאגר מבצעים (Operations Store)',
        freshness: 'עודכן לפני יומיים',
        kind: 'fact',
        uncertainty: 'נמוכה — תלות מוגדרת בתוכנית',
      },
      {
        label: 'מצב הציר במרחב',
        sourceOwner: 'מודיעין מרחבי / גאוגרפיה (Spatial Evidence)',
        freshness: 'לפני ~40 דק׳',
        kind: 'fact',
        uncertainty: 'נמוכה — הציר מסומן חסום',
      },
      {
        label: 'המשמעות: הנחת התנועה אינה מתקיימת — נדרשת בחינה מחדש',
        sourceOwner: 'הקשר ומשמעות (Context & Meaning) · Operational Signal',
        freshness: 'התקבל עכשיו, נגזר מהעובדות מעלה',
        kind: 'synthesized',
        uncertainty: 'פרשנות — ניתנת למעקב חזרה לעובדות שמעליה',
        note: 'Sigma אינה מחשבת זאת בתוך המסך — היא צורכת אות מוכן מ-C&M.',
      },
      {
        label: 'ציר חלופי אפשרי: ציר ברק',
        sourceOwner: 'גאוגרפיה / מבצעים',
        freshness: 'לא מתוקף',
        kind: 'fact-unverified',
        uncertainty: 'גבוהה — התאמה, תזמון וזמינות לא תוקפו',
        note: 'קיים כאפשרות, אך אין בסיס מספיק כדי להמליץ עליו.',
      },
    ],
    actions: [
      {
        id: 'reassess',
        label: 'התחל בחינה מחדש',
        kind: 'reassess',
        belief: 'אני מסמן את "רכס צפוני" לבחינה מחדש ומניע את הטיפול.',
        effect: 'המרחב רושם את הפעולה, יוצר מעקב באחריותך, ומעביר את התכנון־מחדש לתא התכנון.',
        locus: 'in-commander-space',
        handoffTarget: 'תכנון (Operations Management)',
      },
      {
        id: 'open-event',
        label: 'פתח את האירוע',
        kind: 'handoff-control',
        belief: 'אני רואה את אירוע הבטיחות שגרם לחסימה.',
        effect: 'נפתח הקשר האירוע שבבעלות Control (צפייה) — מחוץ למרחב הפיקוד.',
        locus: 'handoff',
        handoffTarget: 'ניהול אירועים (Control)',
      },
      {
        id: 'open-operation',
        label: 'פתח את המבצע',
        kind: 'handoff-operation',
        belief: 'אני רואה את המבצע ואת התלות המושפעת בתוכנית.',
        effect: 'נפתח הקשר המבצע/התוכנית — מחוץ למרחב הפיקוד.',
        locus: 'handoff',
        handoffTarget: 'הקשר המבצע (Operations)',
      },
    ],
  },

  // 2 · SECONDARY — Approval need (entry-level only; gate-vs-advisory intentionally undecided)
  {
    id: 'approval-move',
    forms: ['approval'],
    prominence: 'secondary',
    order: 2,
    headline: 'אישור ממתין לך — הרשאת תנועה למבצע "שחר בטוח"',
    matters: 'ההרשאה מעכבת את המשך ההיערכות של המבצע.',
    relevance: 'אתה הגורם המאשר.',
    contextLine: 'תנאי אחד טרם הושלם: תיאום עם גורם שכן. (מוצג כהקשר — כלל החסימה טרם הוכרע)',
    recommendationState: 'none',
    actions: [
      {
        id: 'approve',
        label: 'אשר',
        kind: 'approve',
        belief: 'אני משלים את האישור.',
        effect: 'האישור נרשם (השלמה מתוך המרחב, כשההרשאה מאפשרת). התנאי החסר מוצג כהקשר.',
        locus: 'in-commander-space',
      },
      {
        id: 'reject',
        label: 'דחה',
        kind: 'reject',
        belief: 'אני דוחה את הבקשה.',
        effect: 'הדחייה נרשמת.',
        locus: 'in-commander-space',
      },
    ],
  },

  // 3 · SECONDARY — Awareness only (no action owned by this user)
  {
    id: 'directive-published',
    forms: ['awareness'],
    prominence: 'secondary',
    order: 3,
    headline: 'פורסמה הנחיה חדשה הרלוונטית לגזרת המבצע שלך',
    matters: 'משפיעה על ההקשר של המבצע; מטופלת ע"י גורם אחר.',
    relevance: 'כדאי שתדע — אך לא נדרשת ממך פעולה כרגע.',
    recommendationState: 'none',
    actions: [
      {
        id: 'ack',
        label: 'סמן שהובן',
        kind: 'acknowledge',
        belief: 'אני מאשר שראיתי; אין לי מה לעשות עם זה.',
        effect: 'המודעות נרשמת כנקראה ומודגשת פחות.',
        locus: 'in-commander-space',
      },
    ],
  },
];
