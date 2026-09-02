# Sigma — Product Vision & Definition (FROZEN)

> **Status: FROZEN Vision.** Change this document only if (a) we learned something new from real users, or (b) the organization's strategy changed — not because "we found a nicer phrasing." That is the maturity test of a Vision doc.

## Job to Be Done (the one sentence everything is tested against)
> **Sigma exists to reduce the time and cognitive effort required for a commander to reach a confident operational decision.**

Every screen, capability, and design choice must be justified against this sentence. If a screen doesn't reduce time-to-decision or cognitive load, it's displaying information, not producing value.

## The Bet (what we believe that others don't)
> **We believe the commander's biggest problem is not lack of information, but the cognitive effort required to transform fragmented operational signals into a confident decision.**

This is the whole reason Sigma exists. Competitors add more information; Sigma removes the cognitive effort between signals and a confident decision. If this belief is wrong, the product is wrong.

## Context — why this document
After strong technical progress (live causal chain, single source of truth, two-workspace IA, contextual priority), the biggest risk is no longer bugs — it's a system whose **technology impresses but whose value isn't sharp**. Grounded finding (read-only): Sigma still reads as a **Dashboard** ("what's happening"), not a **Decision Support System** ("what must I do now, and why").
- `src/components/hq/OperationalBrief.tsx` — landing "brief" = *what changed* + top-3 urgent + **three counts**. Counts, not decisions-with-consequence-and-CTA.
- `src/App.tsx` — default route `/hq` (the *picture*), not the *decisions*.
- The "why / what-to-do" blocks exist at the **data** level (`MissionImpact.meaning`+`requiredAction`, `AttentionAlert.recommendedAction`+`reasonForUser`) but are rendered as **information**, not as an **owned recommendation with a consequence**.

**Direction (agreed):** pause engineering. Define the commander's **Decision Journey** and the product's **value proposition** first. Only then choose the implementation vehicle. **No code this iteration.**

## Sigma's output — the felt promise is **Confidence**
The platform's *identity* is a Decision Readiness Platform; the thing the commander actually **walks away with** — the emotional output we sell — is **Confidence**:
> **"אני בטוח מספיק כדי להחליט."**

Decision Readiness is the capability; Confidence is the felt result. "אני יודע מה קורה, למה, ומה עליי לעשות" is the *content* of that confidence. Every screen is judged by whether it raises the commander's confidence to the point of decision — not by how much information it shows.

One-minute test: *"אם למפקד יש דקה אחת לפני דיון — האם Sigma מקצרת זמן-הבנה וזמן-החלטה ומעלה את הביטחון שלו, או רק מייפה מידע?"*

## The Moment of Value (the one sentence that summarizes the product)
> **Sigma creates value at the exact moment a commander would otherwise stop, search for more information, or ask another person.**

That moment — the pause before a decision — is where Sigma either earns its place or doesn't. Every capability should shorten or eliminate that pause.

## The Exchange — why a commander switches to Sigma
Today the commander uses phone / WhatsApp / a deck / Excel / a call with the קמ"ן. Sigma asks him to *work through it instead*. The exchange must be explicit:

| בלי Sigma (היום) | עם Sigma |
|---|---|
| אוסף מידע מ-7 מערכות | מקבל **סינתזה** במקום אחד |
| מחפש קשרים בראש | Sigma **מוצאת** את הקשרים |
| מחליט לבד מה חשוב | Sigma **מדרגת ומנמקת** — עם השלכה |
| רודף אחרי בעלי תפקיד | Sigma **מנהלת Ownership** ו-handoff |
| מגלה השפעות מאוחר | Sigma **מציפה השפעה שלא זוהתה** מראש |

אם אי אפשר למלא את הטבלה בכל מסך — המוצר עדיין לא חד.

## Where AI adds *unique* value (beyond good BI)
Summarize / display is table-stakes BI. Sigma earns its place only where it does what the commander **couldn't do alone quickly**:
1. **Ruthless prioritization (the most important AI in the system)** — "מתוך 27 דברים, אלה שלושת היחידים ששווים את זמנך עכשיו." Not detecting everything — deciding *what deserves attention* and defending it. This is the core of "one free minute."
2. **Cross-source conflict detection** — "שלוש הנחיות, משני גופים שונים, יוצרות יחד התנגשות שלא זוהתה." (Sigma models directives→impact; the leap is detecting *emergent* conflict across them.)
3. **Historical-lesson surfacing at the decision moment** — "לפני חצי שנה התקבלה החלטה דומה שהובילה לעיכוב — הלקח רלוונטי כאן." (Command Knowledge surfaced *contextually, unprompted*, at the point of decision.)
4. **Foreseen-impact projection** — "אי-טיפול ב-2 שעות יעכב את 'אופק צפוני'." (Consequence of *inaction*, not just current state.)
These four are the difference between "BI that looks nice" and "a system a commander trusts with his decision process."

## Product identity (LOCKED): Sigma is a **Decision Readiness Platform**
Not "Decision Support" (too strong — not every operational decision happens in-system) and not "Decision Preparation" (too weak — Sigma already intervenes in the workflow: ranks, creates ownership, generates tasks, runs the causal chain, manages approvals, updates readiness). The precise model is **"Decision Preparation with In-System Decision Execution"** — Sigma accompanies the *full decision lifecycle*:

> **Preparation → Recommendation → Execution (when possible) → Propagation → Follow-up**

Expressed as **three layers** — every screen is judged by which layers it delivers:
- **Layer 1 — Understand:** collect · filter · link · explain.
- **Layer 2 — Recommend:** rank · explain why · show consequences · recommend the next action.
- **Layer 3 — Execute:** where the decision *can* be made in-system — approve / reject / assign / open task / ack directive → do it. Where it *can't* — Sigma **records the decision** and keeps managing its consequences.

**The boundary (keeps the product focused):** Sigma **orchestrates** *understand → recommend → enable execution where possible → track consequences* — it does not *own* the decision. **The commander owns the decision; Sigma orchestrates it.** Deep operational execution (fire systems, C2, logistics) stays in the execution systems. As long as that line holds, Sigma stays focused.

**Why this framing wins strategically:** it future-proofs for Agentic AI — adding autonomy later means only *deepening Layer 3*, with no change to the product's identity.

## Types of Decisions (so Layer 3 is unambiguous)
"Decision" is not one thing. This table bounds what Sigma can recommend and what it can execute:

| סוג החלטה | דוגמה | מי מחליט | Sigma ממליצה? | ניתן לביצוע במערכת? |
|---|---|---|---|---|
| Tactical | אישור הנחיה | קצין אג"ם | כן | **כן** (Execute) |
| Operational | שינוי מוכנות | מפקד | כן | חלקית |
| Strategic | שינוי תוכנית | מפקד בכיר | המלצה בלבד | **לא** (offline) — Sigma מתעדת ומנהלת השלכות |
| Informational | אישור קריאה | כל משתמש | לא נדרש AI | כן |

Rule: Sigma always delivers Layer 1+2. Layer 3 applies to Tactical/Informational and partly Operational; for Strategic it **records the offline decision and keeps managing its consequences.**

## The Recommendation contract (Decision Intelligence, not "spitting recommendations")
Every recommendation carries, in order:
1. **Recommendation** — the next action as a verb ("אשר את הנחיית האש").
2. **Confidence** — how sure, and why (never feels like guessing).
3. **Evidence** — one click to the basis (source · freshness).
4. **Alternatives** — "אפשרות ב׳: …".
5. **Tradeoffs** — "אם תאשר: … · אם לא תאשר: …".
Without confidence + alternatives + tradeoffs it's an opinion; with them it's decision intelligence the commander can trust *or override*.

## Two modes — not every visit is a decision
Sometimes the commander only wants to understand. Sigma supports both and should know which mode he's in:
- **Awareness mode** — "רק להבין מה קורה." (orient, no pressure to act)
- **Decision mode** — "יש לי החלטה לקבל." (recommend → execute)
Same data, different emphasis; the entry moment offers both paths.

## Product Principles (the lines we never break)
Every future feature is tested against these:
1. **Never ask the commander to synthesize what Sigma can synthesize.**
2. **Every recommendation must explain itself** (confidence + evidence + alternatives).
3. **Every important change must show its operational consequence.**
4. **Every decision should be executable in Sigma whenever operationally possible.**
5. **Evidence is always one click away.**

## What Sigma is NOT (the anti-scope that protects the product)
Defining the boundaries is how we prevent Sigma from becoming a monster over time. When someone later says "let's also add chat / reporting / BI / GIS / planning / resource management" — this section is the answer.
- Sigma is **not** a BI dashboard — it does not exist to expose all available operational information.
- Sigma is **not** a command & control system — it does not replace execution systems.
- Sigma is **not** a knowledge repository — knowledge exists only to improve decisions.
- Sigma is **not** another task-management tool — tasks exist only as *consequences of operational decisions*.
- Sigma is **not** an autonomous decision maker — the commander always owns the decision.

## The Decision Journey (the Story) — and it is NOT linear
Sigma's job at each stage: **remove cognitive work** the commander does today in his head. Commanders **explore** — they jump: decision → evidence → "show me the mission" → "who else is affected?" → back to decision → approve. Sigma must support **exploration**, not only a one-way flow. The stages are anchors, not a rigid funnel:

1. **כניסה / התמצאות** — "3 החלטות מחכות רק לך · 2 שינויים הזיזו את הסיכון · אין דבר נוסף שדורש אותך."
2. **בחירת החלטה** — Sigma דירגה ו**מחזיקה בבעלות על ההמלצה**.
3. **הבנת ה-Why + ההשלכה** — מה השתנה → למה → **השלכה** (לא יוכל לצאת / SLA חורג / סיכון לכוח) → מה מומלץ.
4. **Evidence** — קליק אחד למקור/עדכניות/אמון.  *(פתוח מכל תחנה — exploration.)*
5. **החלטה / פעולה** — פעולה מומלצת (או override) במקום. Human-in-loop.
6. **המערכת מתעדכנת** — השרשרת מתפשטת (מוכנות, סיכון, התראות, Timeline). *כבר קיים.*
7. **Handoff** — משימה עוברת אוטומטית לבעל התפקיד הבא.
8. **חזרה** — בכניסה הבאה: מה התקדם ומה חדש שממתין. (Incentive לחזור.)

Entry promise = the 4 questions: **מה השתנה · למה חשוב · מה ההשלכה · מה מומלץ עכשיו.**

## Product Review — the decision each screen must earn
| מסך | Decision Supported | Value Proposition | מובן בלי Sigma? | Verdict |
|---|---|---|---|---|
| **(חסר) Executive Brief / כניסה** | "אם יש לי דקה — מה הכי חשוב לדעת ולעשות?" | הבטחת הערך: הדבר האחד לדעת ולהחליט לפני שמתחילים | **לא** (סינתזה חוצת-מקורות) | **החסר המרכזי** |
| מרחב המפקדה / סקירה | "אילו מבצעים/החלטות דורשים קשב בגזרה?" | תמונה ש**מפנה להחלטות הפתוחות**, לא רק סטטוס | חלקית (דשבורד יפה) | **דורש מיקוד מחדש** |
| הערכת מצב | "איך אני מרכיב תמונה להחלטה שאני עומד לקבל?" | להרכיב תמונת מצב מותאמת להחלטה | לא | **חזק** |
| מבצעים ומוכנות + מבצע | "אילו מבצעים בסיכון, מה חוסם, האם להתערב?" | להבין אילו מבצעים בסיכון ומה מונע מהם מוכנות | חלקית | **טוב, חסרה שכבת השלכה** |
| הנחיות מפקד | "כיצד החלטה פיקודית משפיעה על התמונה?" | להבין כיצד החלטות פיקודיות משפיעות על התמונה | לא | **חזק** (שרשרת סיבתית) |
| ידע מפקדתי | "מה למדנו קודם שרלוונטי להחלטה עכשיו?" | להחזיר לקח רלוונטי — לא לחזור על טעות | לרוב כן | **דורש הקשריות** (לצוף בזמן ההחלטה) |
| המרחב שלי | "במה עליי לטפל עכשיו כדי לקדם את המערכת?" | לדעת במה לטפל עכשיו כדי לקדם את המערכת | חלקית | **טוב**, אישור לא מתבצע במקום |
| מה דורש קשב | "מה הדבר הבודד לטפל בו עכשיו ולמה?" | מה לטפל, למה, ומה יקרה אם לא — לא רק "קריטי" | חלקית | **"המשפט החסר"** (מדרג, לא ממליץ בבעלות) |
| Evidence & Trust / מקורות | "האם אפשר לסמוך, על מה מבוסס?" | לענות על "על מה מבוסס" לפני שמחליטים | לא | **חזק כשכבה תומכת** |

**Through the three-layer lens:** most screens are strong at **Understand**, partial at **Recommend** (they show `meaning`/`recommendedAction` as *information*, not as an owned recommendation with a consequence), and weakest at **Execute** — the act-in-place layer is the current maturity gap (Attention has no primary action; My Approvals displays but doesn't approve in place; the mission banner explains but offers no decision button). Maturing Sigma = pushing each screen up its layer stack, especially into Layer 3 where the decision can be executed.

## Where the product breaks the journey (mapped to the review points)
- **Dashboard vs Decision Support / output / landing / incentive (#1,2,7,8,9,10):** אין רגע כניסה שעונה על "מה לעשות עכשיו". → stage 1 + 8.
- **ה-Why / עומס קוגניטיבי / "קריטי ביחס למה" (#3,4,5):** אין שכבת **השלכה + החלטה נדרשת**. → stage 3.
- **Attention בבעלות (#5,6):** מדרגת אך לא **ממליצה** עם השלכת אי-טיפול + פעולה ראשית. → stage 2+5.
- **AI ייחודי:** אין עדיין זיהוי התנגשות חוצת-מקורות / הצפת לקח היסטורי בזמן ההחלטה.

## Success metrics (how we'll know it produced value, not just adoption)
- זמן להבנת תמונת מצב (target: פחות מ-X דק׳).
- זמן עד קבלת החלטה.
- מספר מקורות שנפתחו לפני החלטה (ירידה = פחות ציד מידע).
- מספר החלטות שהתקבלו בלי מעבר לכלי אחר (WhatsApp/מצגת).
- מספר הפעמים ש-Sigma הציפה השפעה/התנגשות שלא זוהתה מראש.

## Failure Modes — Sigma fails when… (what must never happen)
The mirror of success. If any of these is true, the product isn't delivering its Bet:
- commanders still open WhatsApp before opening Sigma.
- recommendations are ignored because they aren't trusted.
- users open Sigma only to view status.
- users still need another person to synthesize the situation.
- Sigma increases cognitive load instead of reducing it.

## Next step after freeze: Prototype Review against this Vision
Do **not** edit this document further. The next move is to take the frozen Vision and walk the existing prototype, screen by screen, asking one question only:
> **"After the user leaves this screen, is he genuinely closer to a confident decision?"** (not "is it pretty?", not "does it work?")
- **Yes** → the screen stays.
- **No** → don't polish it — decide whether to **redesign** or **remove** it.
This is where the project moves furthest now: the Vision is finally sharp enough to serve as the measuring stick, and the challenge is whether the prototype lives up to the promise it defines.

## The open implementation decision — AFTER the Prototype Review (not now)
Once the Journey + value are agreed, choose the vehicle for the entry-promise: **Executive Brief** (leading — 30 שניות, 4 השאלות, "Continue to HQ"; הרגע היחיד שהוא ייחודית Sigma) vs. making HQ itself "decisions-first" vs. a cross-cutting "decisions waiting" layer. Not decided here.

## What we are NOT doing this iteration
No code. No new screen/widget. The deliverable is the shared **product definition** (JTBD + value + Journey + Review + success metrics) as the basis for the next decision. Existing behaviour untouched.

## The four questions a CPO / senior commander will ask — and Sigma's answer
1. **איזו החלטה בדיוק Sigma עוזרת לי לקבל?** → מוגדר ב-*Types of Decisions*; כל מסך נבחן מול ה-Decision Supported שלו.
2. **למה שאאמין להמלצה?** → *Recommendation contract*: Confidence + Evidence (קליק אחד) + חלופות.
3. **מה אם אני לא מסכים?** → Override תמיד זמין; Sigma מציגה Alternatives + Tradeoffs, לא מכתיבה.
4. **איך אדע שחסכה זמן ושיפרה איכות החלטה?** → *Success metrics* (זמן-הבנה, זמן-החלטה, מקורות שנפתחו, החלטות בלי מעבר לכלי אחר, השפעות שהוצפו).

## Verification (product, not technical)
**Cold-user test:** hand the prototype to someone who doesn't know Sigma; ask "מה זה עושה?" — "Dashboard" = fail; "עוזר למפקד להחליט על מה" = success. Then walk the 8-stage Journey and confirm each stage removes cognitive work + fills a row in the Why-Sigma-Wins table. No build/test run this iteration.

---

# System Behavior Specification
*The missing layer between the (frozen) Vision and implementation. Product-behavior only — no architecture, APIs, components, user stories, or acceptance criteria. Every behavior below is derived from the Vision above; nothing new is introduced.*

## Global Product Behaviors (inherited by every capability)
These are always true and **inherited by every capability**. Capability sections focus on capability-specific behavior; where a global rule is restated, it is for emphasis at the point it matters most — never a different rule.
1. **Every decision propagates** — its consequences update all affected entities (readiness, risk, blockers, related items).
2. **Every decision is recorded in the Timeline** — with actor + time; nothing changes silently.
3. **Every recommendation follows the Recommendation Contract** — Recommendation → Confidence → Evidence → Alternatives → Tradeoffs.
4. **Every override is recorded** — with its reason.
5. **Every approval updates readiness** (and risk where relevant).
6. **Every action updates Attention** — priority re-ranks live.
7. **Evidence is always one click away.**
8. **The human always owns the decision** — Sigma orchestrates; it never executes autonomously.
9. **Every follow-up is handed to the responsible role.**
10. **Two modes everywhere** — Awareness (understand only, no forced action) and Decision (act).
11. **Standard states** unless noted: **Normal · Empty · Loading · Error**; recommendation-bearing surfaces add **No recommendation · Multiple recommendations**; **Offline/stale** wherever source freshness matters.

**On Exit Condition (the strongest field — read it this way):** each capability's Exit Condition answers *"When has Sigma finished its job here — i.e., delivered enough value that the commander can confidently continue?"* — **not** "when did the user leave the screen." Value delivered, not screen dismissed.

---

## 1. Executive Brief
**Purpose** — Delivers the Vision's felt promise (Confidence) and the Moment of Value at entry: JTBD directly; Journey stage 1. Answers the 4 questions in ~30 seconds.
**Trigger** — On entering Sigma (each session), and on explicit "מה השתנה מאז ביקורי".
**Inputs** — Changes since the user's last visit; decisions waiting *only* for this user; risk-picture shifts; consequence + recommendation per item.
**Behavior** — 1) Opens with a one-breath summary: "מאז ביקורך: N החלטות מחכות רק לך · X שינויים הזיזו את הסיכון · אין דבר נוסף שדורש אותך." 2) Lists only decision-worthy items, each as a Recommendation Card (what changed · why · consequence · recommended action). 3) Offers two paths: **Decision** (act now on an item) or **Awareness** ("Continue to HQ"). 4) Never shows widgets/tables/15 numbers.
**User Actions** — Open a decision; act on a recommendation inline; dismiss/snooze; "Continue to HQ".
**System Reactions** — Acting propagates consequences + records to Timeline + hands off; the item leaves the Brief; the "since last visit" marker advances.
**States** — Normal; **Empty = the highest-value state**: "אין כרגע דבר שדורש את הקשב שלך" (explicitly reassuring, not a blank); Loading; Error; No recommendation (show awareness summary only); Multiple recommendations (ranked, top first).
**Rules** — Only items that need *this* commander appear (Principle 1, BR-004). Never a dashboard. Every listed item carries a consequence and a recommended action.
**Exit Condition** — The commander either handled the waiting decisions or consciously chose Awareness ("Continue to HQ") — i.e., he knows the single most important thing to know and do.

## 2. HQ Workspace (מרחב המפקדה)
**Purpose** — The shared operational picture that **routes to open decisions**, not just status. Understand (+ pointers into Recommend). Journey stages 1→2.
**Trigger** — Entering the command workspace, or "Continue to HQ" from the Brief.
**Inputs** — Cross-sector missions, directives, readiness, risks, open decisions, recent changes.
**Behavior** — Presents the shared picture organized around *what needs a decision*: entry points to Situation Assessment, Operations & Readiness, Directives, Knowledge, each surfacing its open-decision count. Highlights what changed and what is at risk.
**User Actions** — Drill into any sub-area; open a flagged mission/decision; explore (non-linear).
**System Reactions** — Selecting an item opens its decision context; counts reflect live state.
**States** — Normal; Empty (quiet sector — say so); Loading; Error; Stale (a source not fresh → flag).
**Rules** — Every panel points toward a decision or an at-risk entity; no panel exists purely to display information (Principle 1).
**Exit Condition** — The commander has oriented on the shared picture and can jump to any area that needs him.

## 3. Situation Assessment
**Purpose** — Lets the commander **compose the picture for the decision he is about to make** — the strongest decision-oriented surface. Understand + Recommend. Journey stages 2→3.
**Trigger** — Preparing for a discussion/decision; opening a saved assessment.
**Inputs** — Chosen context (single mission / multiple / sector / time-window); templates; the widget catalog; live missions, readiness, directives, approvals, evidence, fire, means.
**Behavior** — 1) Pick context. 2) Pick a template or add widgets from the catalog. 3) The board composes live from the shared source; each widget links to depth. 4) The commander records decisions and derives follow-up actions; can save a Snapshot for the discussion.
**User Actions** — Set context; add/remove/reorder widgets; open depth from any widget; record a decision; create a follow-up; save Snapshot; finish assessment.
**System Reactions** — Board recomposes to context; recorded decisions/actions propagate + hand off + hit the Timeline; a Snapshot is preserved.
**States** — Normal; Empty board ("הוסף Widgets או בחר תבנית"); Loading; Error; per-widget Empty/Error/Stale; No recommendation (widget shows plain status).
**Rules** — The widget catalog lives only here (not a standalone module). Widgets are decision instruments that lead to depth, never decorative (Principle 1).
**Exit Condition** — A composed, decision-ready picture exists (optionally snapshotted) and any decisions taken have been recorded and propagated.

## 4. Operations & Readiness
**Purpose** — Understand **which missions are at risk and what prevents them from being ready** — and whether to intervene. Understand + Recommend. Journey stage 2/3.
**Trigger** — Reviewing the portfolio; following a risk/readiness change.
**Inputs** — Missions (status, readiness, risk, blockers, owner, due), readiness requirements, approvals, dependencies.
**Behavior** — Lists/boards missions with the *consequence* of their state (at risk → why → what blocks readiness). Filters to "at risk / awaiting approval / has gaps". Each row leads to the mission's decision context.
**User Actions** — Filter; sort by risk; open a mission; jump to a blocking requirement.
**System Reactions** — Opening a mission carries its consequence + recommendation; filters reflect live risk/readiness (updated by the causal chain).
**States** — Normal; Empty (no missions match); Loading; Error; Stale.
**Rules** — Risk and blocker counts must always reflect live state (single source of truth). A mission "at risk" must be able to explain *why* (consequence), not just a color.
**Exit Condition** — The commander knows which missions need intervention and can act on the specific blocker.

## 5. Mission Details
**Purpose** — The full decision context for a single mission — where the commander gets confident about that mission. Understand + Recommend + Execute (where the decision is executable). Journey stages 3→5.
**Trigger** — Opening a mission from anywhere.
**Inputs** — Mission overview, readiness (weighted, explained), dependencies, resources, approvals, related directives, evidence, contextually-relevant knowledge, active impact.
**Behavior** — 1) A banner states the current operational consequence + why (e.g., readiness dropped because a critical policy requirement is blocked) and links to the source directive. 2) Tabs let the commander explore (non-linear) — readiness, approvals, dependencies, evidence, directives, timeline, knowledge. 3) Relevant past lessons surface contextually. 4) Executable decisions (e.g., approve) are actionable in place.
**User Actions** — Explore tabs; open evidence; approve/reject where applicable; create follow-up; open related directive; follow the readiness explanation.
**System Reactions** — Any decision propagates (readiness/risk/blockers update, alerts adjust, Timeline records, follow-up handed off); banner reflects live consequence.
**States** — Normal; Empty per tab; Loading; Error; Stale; No recommendation (show status + evidence); No active impact (no banner).
**Rules** — Every important change shows its operational consequence (Principle 3). Readiness scores are explained, never a bare number.
**Exit Condition** — The commander understands the mission's state, why it changed, its consequence, and has acted on or consciously deferred the decision.

## 6. Command Directives
**Purpose** — Understand **how a command decision ripples into the operational picture**, and own that ripple. Understand + Recommend + Execute (publish/ack). Journey stages 5→6→7.
**Trigger** — Creating/reviewing a directive; a directive affecting the user's area is published.
**Inputs** — Directive content, audience, validity, linked missions; on publish: computed per-mission impact, consequence, recommendation.
**Behavior** — Before publish: shows **linked missions** (possible impact scope) only — no impact yet. On publish: computes and shows **affected missions** with a per-mission impact (type · meaning · required action), raises attention, opens follow-ups, records to Timeline. Tracks acknowledgements and derived actions.
**User Actions** — Create/edit; publish; acknowledge reading; open an affected mission; create follow-up; supersede/cancel.
**System Reactions** — Publishing propagates the full causal chain (affected missions, readiness/risk, alerts, tasks, evidence audit trail, Timeline); ack is recorded to Timeline; each affected mission shows the consequence.
**States** — Draft; Published; Superseded/Cancelled; Empty (no linked missions); Loading; Error; No recommendation.
**Rules** — Distinguish **linked** (pre-publish) from **affected** (post-publish). Critical directives require an approval flow (BR-005). Ack status is visible and operative.
**Exit Condition** — The directive is published, its impact is visible per mission, and the required people/actions are tracked.

## 7. Attention Center (מה דורש קשב)
**Purpose** — The sharpest expression of the Bet: **ruthless prioritization + an owned recommendation** — "the single thing to act on now, and why." Recommend (→ Execute). Journey stages 1/2/5.
**Trigger** — Anytime; surfaced via a cross-cutting counter; the landing of My Workspace.
**Inputs** — All open attention items; each item's urgency, type, linked-mission risk/blockers, deadline, confidence; the priority model.
**Behavior** — Ranks items by an **explainable contextual priority** (deadline × linked-mission risk × blockers × type). Each item shows a **priority level + concise reason** and, per the Recommendation Contract, the **recommended next action + consequence of inaction** ("מומלץ: אשר את הנחיית האש · אי-טיפול ב-2 שעות יעכב את 'אופק צפוני'") with a **primary action**. Not a raw score.
**User Actions** — Act (primary recommended action / override); open in context; assign; snooze; resolve; escalate; expand the "why".
**System Reactions** — Acting executes or records the decision, propagates consequences, hands off, records to Timeline, and removes/updates the item; ranking re-computes live (a risk rise re-ranks its items).
**States** — Normal; **Empty = success** ("אין כרגע דבר שדורש את הקשב שלך"); Loading; Error; No recommendation (rank + reason only); Multiple recommendations (ranked).
**Rules** — Only actionable items appear (BR-004). Every item owns a recommendation with a consequence, not just "critical". Priority must explain itself from the same factors used to rank.
**Exit Condition** — Nothing critical is unaddressed; the commander acted on or consciously deferred each high-priority item.

## 8. My Workspace (המרחב שלי)
**Purpose** — "**What must I act on now to move the system forward?**" — the persona's decision queue. Recommend + Execute. Journey stages 1/2/5.
**Trigger** — Entering the personal space; the attention counter.
**Inputs** — This user's ranked tasks, pending approvals, assigned alerts, relevant directives, recent changes in his scope.
**Behavior** — Presents the user's work **ranked by the same contextual priority** as Attention (consistent cross-space model), each with its level + reason. Groups: what needs my action, what's waiting for me, what changed around me.
**User Actions** — Complete a task; act on an approval/alert in place; open depth; follow a recent change.
**System Reactions** — Completing/deciding propagates + records + advances the handoff; the item updates; recent-changes reflects live state.
**States** — Normal; Empty (nothing assigned); Loading; Error; No recommendation.
**Rules** — Ranking is identical to Attention (one attention model). Items are consequences of operational decisions, not free-floating tasks (What-Sigma-is-NOT).
**Exit Condition** — The user has cleared or consciously deferred what only he can advance.

## 9. Approvals
**Purpose** — Turn a pending approval into a confident yes/no **executed in place**. Recommend + Execute (Tactical/Operational decision types). Journey stage 5.
**Trigger** — An approval is required from this user; opening an approval from a mission/My Workspace.
**Inputs** — What's awaiting approval, who must approve, waiting time, **missing conditions**, risk level, linked evidence, recommendation.
**Behavior** — Shows the approval with its context and missing items. If prerequisites are unmet, approval is blocked with a clear reason; if met, the commander can approve/reject in place, seeing tradeoffs of each.
**User Actions** — Approve; reject; request completion of a missing item; open evidence; override.
**System Reactions** — Approve/reject propagates (mission/directive state, readiness/risk, Timeline) and hands off; blocked approval explains what's missing rather than failing silently.
**States** — Normal (pending); Approved; Rejected; **Blocked (missing conditions)**; Empty (none pending); Loading; Error.
**Rules** — Cannot approve while required conditions are missing (show why). Every approval carries its risk + evidence (Recommendation Contract). Critical directives require this flow (BR-005).
**Exit Condition** — The approval is decided (or consciously deferred) and its consequences have propagated.

## 10. Commander Knowledge
**Purpose** — Bring a **relevant past lesson/decision back to the table at the moment of decision** — knowledge exists only to improve decisions. Understand (feeds Recommend). Journey stage 3.
**Trigger** — Primarily contextual (surfaced inside a mission/decision); secondarily explicit search.
**Inputs** — Past decisions, lessons, similar operations, prior directives, incidents, documents; the current decision context.
**Behavior** — Surfaces items *unprompted* where they're relevant to the decision at hand (e.g., a similar prior decision that led to a delay), each with **why it's relevant + confidence + source link**. Explicit search is a fallback, not the primary path.
**User Actions** — Open a knowledge item; follow to source; dismiss as irrelevant; search explicitly.
**System Reactions** — Opening surfaces the lesson in context; relevance/confidence are shown; no state change to operations (read-only knowledge).
**States** — Normal; Empty (no relevant knowledge — say so, don't pad); Loading; Error; No recommendation.
**Rules** — Knowledge is never a standalone repository goal (What-Sigma-is-NOT); it must attach to a decision. Every item states why it's relevant + its source (BR-001-aligned).
**Exit Condition** — The commander has (or has declined) the relevant precedent for the decision he's making.

## 11. Evidence & Trust
**Purpose** — Answer "**can I trust this / what is it based on?**" before deciding — the trust layer under every recommendation. Supports Understand + Recommend. Cross-cutting; Journey stage 4.
**Trigger** — One click from any insight, recommendation, status, or readiness item.
**Inputs** — Source system, owner, freshness, confidence, contradictions, missing info, reasoning, related entities, audit trail, deep link to source.
**Behavior** — Opens in context (a drawer) showing where the information came from, how fresh, how confident, whether contradicted, and how Sigma reached the conclusion; offers **human validation** (confirm / reject / mark outdated / request clarification) and a read-only deep link to the source.
**User Actions** — Inspect source/freshness/confidence; validate/reject/mark-outdated/request-clarification; open source (read-only deep link).
**System Reactions** — Validation updates the item's trust state and audit trail; deep link opens the source system read-only (Sigma never writes to sources).
**States** — Normal; Empty (no evidence linked — say so, lowers confidence); Loading; Error; Stale (source not fresh — flagged prominently); Contradiction present.
**Rules** — Evidence is always one click away (Principle 5). Every insight references at least one source (BR-001). Sources are read-only. Human-in-the-loop for validation (BR-008).
**Exit Condition** — The commander knows the basis and trust level of the information behind his decision.

## 12. Notifications
**Purpose** — Bring the commander back / pull attention **only when something actionable changed** — protects the Bet (reduce noise, not add it). Recommend. Journey stages 1/8.
**Trigger** — An event changes the decision picture (risk shift, new directive impact, approaching deadline, new item requiring this user).
**Inputs** — Events filtered by relevance to this user + whether they are actionable.
**Behavior** — Delivers only actionable, relevant notifications, each pointing to the decision it concerns (with its consequence). Aggregates into "since your last visit" for the Brief.
**User Actions** — Open the underlying item; act; snooze; dismiss.
**System Reactions** — Opening routes to the item's decision context; acting propagates + records.
**States** — Normal; Empty (nothing needs you — a valid, good state); Loading; Error.
**Rules** — Only actionable alerts reach users (BR-004). A notification always leads to a decision or a consequence, never "FYI noise".
**Exit Condition** — The user has seen and routed every actionable change; nothing relevant is missed.

## 13. Timeline
**Purpose** — The trustworthy chronological record of what happened, what changed, and what was decided — supports understanding, trust, and after-action. Understand. Cross-cutting; Journey stage 6.
**Trigger** — Viewing history for an entity (mission/directive) or the sector; after any decision.
**Inputs** — Events, status changes, directives, approvals, anomalies, decisions — each linked to its entity and actor.
**Behavior** — Presents an append-only chronological feed, filterable by entity/type/time; each entry links to its subject. Every propagated consequence and every decision (including offline decisions Sigma recorded) appears here.
**User Actions** — Filter by entity/type/time; open an entry's subject.
**System Reactions** — New decisions/consequences append in real time; entries are immutable.
**States** — Normal; Empty (no events in range); Loading; Error.
**Rules** — Append-only (auditability, BR-aligned). Every important change and decision is recorded with actor + time (Decision Traceability). No silent state changes.
**Exit Condition** — The commander can reconstruct what happened, when, by whom, and why.

## 14. Decision Execution
**Purpose** — Layer 3 of the identity: **make the decision real** — execute in-system where possible, record + manage consequences where not. Execute. Journey stages 5→6→7.
**Trigger** — The commander takes a recommended action or an override on any decision.
**Inputs** — The decision, its type (Tactical/Operational/Strategic/Informational), the chosen option (recommended or alternative), the actor.
**Behavior** — For **executable** types (Tactical/Informational, partly Operational): performs the decision in-system (approve/reject/assign/ack/readiness change) and immediately **propagates consequences** and **hands off** the follow-up to the responsible role. For **non-executable** types (Strategic): **records the decision taken offline** and continues managing its consequences (Sigma orchestrates; the commander owns).
**User Actions** — Confirm the recommended action; choose an alternative; override with a reason; record an offline decision.
**System Reactions** — State updates across all affected entities; readiness/risk/blockers recompute; attention re-ranks; Timeline records the decision + actor; a follow-up appears in the next role's workspace.
**States** — Normal; Executable; **Record-only (non-executable)**; Loading; Error; Blocked (prerequisite/authority missing — explain).
**Rules** — Sigma never executes autonomously — the commander owns the decision (BR-008, What-Sigma-is-NOT). Boundary respected: deep operational execution stays in external systems; Sigma orchestrates and tracks. Every decision is executable in Sigma whenever operationally possible (Principle 4).
**Exit Condition** — The decision is either executed or recorded, its consequences have propagated, and ownership has advanced to the next role.

## 15. Recommendation Card
**Purpose** — The reusable unit that makes every recommendation trustworthy — the concrete embodiment of the Recommendation Contract. Recommend (+ entry to Execute). Appears wherever Sigma recommends (Brief, Attention, Mission, Approvals).
**Trigger** — Wherever Sigma surfaces a recommended next action.
**Inputs** — The recommended action; confidence + its basis; linked evidence; alternative option(s); tradeoffs of acting vs not.
**Behavior** — Presents, in order: **Recommendation** (the next action as a verb) → **Confidence** (how sure + why) → **Evidence** (one click) → **Alternatives** → **Tradeoffs** ("אם תאשר… · אם לא תאשר…"). Offers the primary action and an explicit override.
**User Actions** — Take the recommended action; open an alternative; open evidence; override (with reason).
**System Reactions** — Taking any option routes into Decision Execution (propagate + record + hand off); override is recorded with its reason.
**States** — Normal; **No recommendation** (Sigma cannot responsibly recommend → show status + evidence, say so, don't fabricate); **Multiple recommendations** (ranked, primary first, others as alternatives); Low confidence (shown honestly); Loading; Error.
**Rules** — Never present a recommendation without confidence + evidence + alternatives (Principle 2). Override is always available (the commander owns the decision). A recommendation without a possible action is not a recommendation.
**Exit Condition** — The commander has acted, chosen an alternative, or overridden — with the basis for the choice visible.

---

# Capability Interaction Map — one representative decision flow (example, not the only sequence)
How the capabilities connect into **a** Decision Journey (not isolated screens). This is the glue: a developer opening any single capability can see where it sits in the flow.

> **Non-linear, by design.** Commanders may enter the journey from multiple capabilities (HQ, Attention Center, Notifications, My Workspace, Situation Assessment) and jump between stages (explore). The map below illustrates **one representative flow, not a required sequence** — consistent with the non-linear Decision Journey defined in the Vision.

**One common decision journey (example):**
```
Commander enters Sigma
        ↓
Executive Brief  ── "N decisions since your last visit; nothing else needs you"
        ↓  (opens a Recommendation Card)
Recommendation Card  ── recommendation · confidence · evidence · alternatives · tradeoffs
        ↓
Mission Details  ── consequence + why (banner), explore context
        ↓
Evidence & Trust  ── one click: is it trusted?
        ↓
Decision  ── take recommended action / choose alternative / override
        ↓
Decision Execution  ── execute in-system (or record if offline)
        ↓  (Global Behaviors fire: propagate · record · handoff)
Timeline updates  ·  Attention re-ranks  ·  Readiness/Risk update
        ↓
My Workspace updates  ── follow-up appears for the responsible role
        ↓
Executive Brief updates  ── next visit: "here's what progressed + what's new"
```

**Supporting flows (feed the loop, not separate journeys):**
- **HQ Workspace** is the Awareness-mode alternative to the Brief's Decision path — the shared picture that routes into the same Mission/Directive/Assessment decisions.
- **Situation Assessment** composes many capabilities (missions, readiness, directives, fire, means, evidence) into one board *for a specific decision*; its recorded decisions re-enter the loop at Decision Execution.
- **Command Directives** is a common *origin* of the loop: publishing a directive propagates impact → raises Attention → opens follow-ups → surfaces in the Brief.
- **Operations & Readiness** and **Commander Knowledge** feed **Mission Details** at the "understand + why" stage (risk/blockers; relevant precedent).
- **Notifications** and the **Attention Center** are the two entry ramps back into the loop between visits.
- **Recommendation Card** is the shared unit that appears at every "Recommend" moment (Brief, Attention, Mission, Approvals) and always leads into **Decision Execution**.

**The rule the map enforces:** no capability is a dead end. Every one either advances the commander toward a confident decision or feeds another capability that does. If a capability doesn't connect to this loop, it fails the Vision.

---

# Document status — v1.0 (Product Reference)
This document grew from **Vision → Product Definition → System Behavior → Product Reference**. Declared **v1.0** and **closed to expansion**. Further detail (state machines, decision trees, detailed UX flows, edge cases) is produced *later, per specific capability, on demand* — not folded into this central document.

**Consistency review (v1.0) — performed across all 15 capabilities:**
- **JTBD** — every capability's Purpose maps to the JTBD and to at least one Journey stage / Principle. ✓
- **Journey connection** — every capability appears in the Capability Interaction Map; none is a dead end. ✓
- **Exit Conditions** — each measures *"Sigma finished its job / value delivered so the commander can continue"*, not "user left the screen." ✓
- **Rules provenance** — every Rule cites a Vision source (Product Principles / Business Rules / What-Sigma-is-NOT); no new policy introduced at the behavior layer. ✓
- **No contradictions** — the Interaction Map is now explicitly *one example of a non-linear journey*, consistent with the Vision; two-modes (Awareness/Decision) honored everywhere.
- **One terminology** — shared behavior uses a single vocabulary (propagate · record to Timeline · handoff · Recommendation Contract · Understand/Recommend/Execute) via Global Product Behaviors.

**Change rule (same freeze test as the Vision):** edit only on (a) real learning from users, or (b) an organizational strategy change — not for a nicer phrasing.
