import { useState } from 'react';
import type { AttentionItem, AttentionAction } from '../data/attention';
import { FormTags } from './FormTag';
import { DecisionSupport } from './DecisionSupport';
import { EvidencePanel } from './EvidencePanel';
import { useScenario } from '../state/ScenarioContext';

function fmtTime(iso: string): string {
  try { return new Date(iso).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }); }
  catch { return ''; }
}

// The dominant attention item. Carries the approved three-level hierarchy for the flagship:
//   L1 Immediate  — what changed · why it matters · why it requires me · what I can do next
//   L2 Understand — affected axis · recorded dependency · consequence for the plan · known unknowns · honest no-recommendation
//   L3 Evidence   — the sources behind it (fact vs synthesized vs unverified), freshness, uncertainty
// After the action, it transforms into the follow-up state (S5). Nothing here is computed — the
// cross-domain meaning is a consumed C&M signal (see data/attention.ts).
export function FlagshipItem({ item, dominant = true }: { item: AttentionItem; dominant?: boolean }) {
  const { reassessedAt, initiateReassessment } = useScenario();
  const [understandOpen, setUnderstandOpen] = useState(false);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [handoff, setHandoff] = useState<AttentionAction | null>(null);

  const reassessed = !!reassessedAt;

  const onAction = (a: AttentionAction) => {
    if (a.kind === 'reassess') { initiateReassessment(); return; }
    if (a.kind === 'handoff-control' || a.kind === 'handoff-operation') { setHandoff(a); return; }
  };

  const handoffActions = item.actions.filter(a => a.kind === 'handoff-control' || a.kind === 'handoff-operation');
  const primary = item.actions.find(a => a.kind === 'reassess');

  return (
    <div className={`cs-item cs-flagship${dominant ? '' : ' cs-flagship-flat'}`}>
      <FormTags forms={item.forms} />

      {/* L1 — Immediate */}
      <div className="cs-headline">{item.headline}</div>
      <div className="cs-matters">{item.matters}</div>
      <div className="cs-relevance">
        <span className="who-pill">דורש אותך:</span>
        <span>{item.relevance}</span>
      </div>
      {item.consequence && (
        <div className="cs-consequence"><b>המשמעות:</b> {item.consequence}</div>
      )}

      {/* Post-action follow-up (S5) replaces the primary action once reassessment is initiated. */}
      {reassessed ? (
        <div className="cs-followup">
          <div className="fu-title">↻ בבחינה מחדש · באחריותך</div>
          <div className="fu-line">התחלת בחינה מחדש של תנועת המבצע ב-<b>{fmtTime(reassessedAt!)}</b>.</div>
          <div className="fu-line">עדיין פתוח: קביעת מסלול תנועה בר-ביצוע, והאם "רכס צפוני" יכול לצאת כמתוכנן.</div>
          <div className="fu-line" style={{ marginTop: 8 }}>
            הצעד הבא בבעלות: <span className="cs-owner-pill">{primary?.handoffTarget ?? 'תא התכנון'}</span>
            {' '}· אירוע הבטיחות ממשיך להתנהל ב-<span className="cs-owner-pill">ניהול אירועים (Control)</span>.
          </div>
        </div>
      ) : (
        <div className="cs-actions">
          {primary && (
            <button className="cs-btn primary" onClick={() => onAction(primary)} title={primary.effect}>
              {primary.label}
            </button>
          )}
          {handoffActions.map(a => (
            <button key={a.id} className="cs-btn ghost" onClick={() => onAction(a)} title={a.effect}>
              {a.label}
            </button>
          ))}
        </div>
      )}

      {/* Handoff representation — we do NOT build Control / Operations; we represent the move. */}
      {handoff && (
        <div className="cs-support norec" style={{ marginTop: 14 }}>
          <div className="label">מעבר להקשר</div>
          <div className="body">
            {handoff.effect} <span className="cs-owner-pill" style={{ marginInlineStart: 6 }}>{handoff.handoffTarget}</span>
            <button className="cs-btn link" style={{ marginInlineStart: 8 }} onClick={() => setHandoff(null)}>סגור</button>
          </div>
        </div>
      )}

      {/* L2 — Understand */}
      <div className="cs-expander">
        <button className="cs-disclosure-btn" onClick={() => setUnderstandOpen(o => !o)}>
          {understandOpen ? 'סגור' : 'להבין למה'} {understandOpen ? '▴' : '▾'}
        </button>

        {understandOpen && item.understand && (
          <div className="cs-understand">
            <div className="cs-row"><div className="k">מה השתנה</div><div className="v">{item.understand.affected}</div></div>
            <div className="cs-row"><div className="k">התלות בתוכנית</div><div className="v">{item.understand.dependency}</div></div>
            <div className="cs-row"><div className="k">מה זה עושה לתוכנית</div><div className="v">{item.understand.consequenceForPlan}</div></div>
            <div className="cs-row">
              <div className="k">מה עדיין לא ידוע</div>
              <ul className="cs-unknowns v">
                {item.understand.knownUnknowns.map((u, i) => <li key={i}>{u}</li>)}
              </ul>
            </div>

            <DecisionSupport item={item} />

            {/* L3 — Evidence / depth */}
            {item.evidence && (
              <div className="cs-expander" style={{ marginTop: 6 }}>
                <button className="cs-disclosure-btn" onClick={() => setEvidenceOpen(o => !o)}>
                  {evidenceOpen ? 'הסתר את הבסיס' : 'הצג את הבסיס'} {evidenceOpen ? '▴' : '▾'}
                </button>
                {evidenceOpen && <EvidencePanel evidence={item.evidence} />}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
