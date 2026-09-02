import { ATTENTION_ITEMS, ANCHOR_USER, HIERARCHY_MODE } from './data/attention';
import { FlagshipItem } from './components/FlagshipItem';
import { SecondaryItem } from './components/SecondaryItem';
import { EmptyState } from './components/EmptyState';
import { PrototypeScaffold } from './components/PrototypeScaffold';
import { useScenario } from './state/ScenarioContext';

// Commander Space vNext — Prototype 01 entry experience.
// Organizing question only: "What requires me now?" — a deliberately small, prioritized Attention
// set. NOT a dashboard, feed, portfolio, or "all my work", and NOT the legacy HQ / My Space IA.
export function CommanderSpace() {
  const { visit, reassessedAt, approvalDecision, acknowledged, forceEmpty } = useScenario();

  const flagship = ATTENTION_ITEMS.find(i => i.id === 'axis-closure')!;
  const approval = ATTENTION_ITEMS.find(i => i.id === 'approval-move')!;
  const awareness = ATTENTION_ITEMS.find(i => i.id === 'directive-published')!;

  const reassessed = !!reassessedAt;
  const approvalDone = !!approvalDecision;
  const awarenessDone = acknowledged.includes(awareness.id);
  const nextVisit = visit === 'next';
  const dominant = HIERARCHY_MODE === 'dominant-plus-secondary';

  // What still requires the user right now.
  //  · flagship: on first visit it always persists (active, or in-reassessment follow-up). On the
  //    next visit it is resolved only if reassessment was initiated (axis reopened, re-plan done).
  //  · secondary items drop out of "requires me" once handled.
  const flagshipRequires = nextVisit ? !reassessed : true;
  const approvalRequires = !approvalDone;
  const awarenessRequires = !awarenessDone;

  const requiresCount =
    (flagshipRequires ? 1 : 0) + (approvalRequires ? 1 : 0) + (awarenessRequires ? 1 : 0);

  // Continuity summary for the next visit (S7) — what changed since last time.
  const sinceLines: string[] = [];
  if (nextVisit) {
    if (reassessed) {
      sinceLines.push('ציר לביא נפתח מחדש — אירוע הבטיחות נסגר ב-Control.');
      sinceLines.push('הבחינה מחדש שהתחלת הושלמה בתא התכנון; "רכס צפוני" יכול לצאת כמתוכנן. הפריט אינו דורש אותך יותר.');
    } else {
      sinceLines.push('ציר לביא עדיין חסום, וטרם התחלת בחינה מחדש — הפריט עדיין דורש אותך.');
    }
    sinceLines.push(
      approvalDone
        ? `האישור ל"שחר בטוח" טופל (${approvalDecision === 'approved' ? 'אושר' : 'נדחה'}).`
        : 'האישור ל"שחר בטוח" עדיין ממתין לך.',
    );
    sinceLines.push(awarenessDone ? 'ההנחיה סומנה כנקראה.' : 'ההנחיה החדשה עדיין ממתינה לעיון.');
  }

  const showEmpty = forceEmpty || requiresCount === 0;

  return (
    <div className="cs-root">
      <div className="cs-wrap">
        {/* Understated top line — identity is illustrative only. */}
        <div className="cs-topbar">
          <div className="cs-brand">Sigma<small>מרחב הפיקוד</small></div>
          <div className="cs-who">
            <b>{ANCHOR_USER.name}</b> · מבצע "{ANCHOR_USER.operation}"
          </div>
        </div>

        <div className="cs-head">
          <div className="cs-eyebrow">מרחב הפיקוד</div>
          <div className="cs-question">מה דורש אותך עכשיו?</div>
          <div className="cs-sub">
            רק מה שנוגע לאחריותך כרגע — לא כל מה שקורה בגזרה. כשאין דבר שדורש אותך, נאמר זאת בבירור.
          </div>
        </div>

        {/* Next-visit continuity (S7). */}
        {nextVisit && (
          <div className="cs-since" style={{ marginTop: 24 }}>
            <div className="since-eyebrow">מאז שהיית כאן</div>
            {sinceLines.map((l, i) => <div className="since-line" key={i}>{l}</div>)}
          </div>
        )}

        {showEmpty ? (
          <EmptyState />
        ) : (
          <>
            {!nextVisit && (
              <div className="cs-budget">
                <span>{requiresCount} דברים דורשים אותך כעת</span>
                {dominant && <><span className="dot" /><span>אחד מהם דורש אותך יותר מהשאר</span></>}
              </div>
            )}

            {/* Dominant flagship (unless resolved on the next visit). */}
            {flagshipRequires && <FlagshipItem item={flagship} dominant={dominant} />}

            {/* Quieter secondary items. */}
            {(approvalRequires || awarenessRequires || (!nextVisit && (approvalDone || awarenessDone))) && (
              <>
                {dominant && flagshipRequires && <div className="cs-secondary-label">נוסף על כך</div>}
                {/* On first visit we keep handled secondary items visible (dimmed) as action feedback. */}
                {(!nextVisit || approvalRequires) && <SecondaryItem item={approval} />}
                {(!nextVisit || awarenessRequires) && <SecondaryItem item={awareness} />}
              </>
            )}
          </>
        )}
      </div>

      <PrototypeScaffold />
    </div>
  );
}
