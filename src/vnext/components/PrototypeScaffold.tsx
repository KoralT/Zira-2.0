import { useScenario } from '../state/ScenarioContext';

// Explicitly a TESTING control, not product chrome. It lets a reviewer jump directly to each
// approved state (first visit / after action / next visit / nothing-requires-you) without hunting.
// Clearly labeled so no one mistakes it for part of the product.
export function PrototypeScaffold() {
  const { visit, reassessedAt, forceEmpty, setVisit, setForceEmpty, reset } = useScenario();

  const mode = forceEmpty ? 'empty' : visit === 'next' ? 'next' : 'first';

  const btn = (active: boolean, label: string, onClick: () => void) => (
    <button className={`sc-btn${active ? ' active' : ''}`} onClick={onClick}>{label}</button>
  );

  return (
    <div className="cs-scaffold">
      <div className="cs-scaffold-inner">
        <span className="sc-label">בקרת אב-טיפוס</span>
        <div className="sc-btns">
          {btn(mode === 'first', 'כניסה ראשונה', () => { setForceEmpty(false); setVisit('first'); })}
          {btn(mode === 'next', 'כניסה חוזרת', () => { setForceEmpty(false); setVisit('next'); })}
          {btn(mode === 'empty', 'אין דבר שדורש אותך', () => setForceEmpty(true))}
          <button className="sc-btn" onClick={reset}>איפוס</button>
        </div>
        <span className="sc-note">
          {reassessedAt ? 'בחינה מחדש הותחלה' : 'לא בוצעה פעולה'} · לא חלק מהמוצר
        </span>
      </div>
    </div>
  );
}
