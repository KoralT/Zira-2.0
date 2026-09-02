import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { RecommendationContract } from '../../lib/recommendation';
import { confidenceMeta } from '../../lib/meta';
import { ReasoningLink, entityNoun } from './ReasoningLink';

export interface RecoAction {
  label: string;
  onClick: () => void;
  kind?: 'primary' | 'default' | 'danger';
  disabled?: boolean;
  title?: string;
}

// The reusable decision unit (capability #15). Two presentation modes:
//  • compact (entry / My Space) — a SCANNABLE decision hierarchy, not a rich info card. The eye
//    reads it in ~5s: why-#1 → what happened (dominant) → מדוע → אם לא → Sigma's take → ONE CTA.
//    Evidence / confidence / reasoning-chain / alternatives are secondary (behind ▾ / links).
//  • full (Mission / Approvals) — everything inline.
// Honest about No-recommendation — never fabricates a recommendation, alternative, or tradeoff.
export function RecommendationCard({
  contract,
  actions = [],
  title = 'המלצת Sigma',
  compact = false,
  badge,
  entity,
  priorityReason,
  onEvidence,
}: {
  contract: RecommendationContract;
  actions?: RecoAction[];
  title?: string;
  compact?: boolean;
  badge?: { label: string; tone: string };
  entity?: { type: string; id: string };
  priorityReason?: string;   // "why is this #1" — decision-support, not a number
  onEvidence?: (id: string) => void;
}) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [chainOpen, setChainOpen] = useState(false);
  const noRec = contract.state === 'no-recommendation';
  const conf = contract.confidence ? confidenceMeta[contract.confidence] : undefined;
  const hasChain = !!(contract.reasoningChain && contract.reasoningChain.length);
  const lead = contract.situation ?? contract.headline;

  const openEvidence = () => {
    if (!contract.evidenceId) return;
    if (onEvidence) { onEvidence(contract.evidenceId); return; }
    navigate(`/entity/evidence/${contract.evidenceId}`);
  };

  // ---------- COMPACT: scannable decision hierarchy ----------
  if (compact) {
    const primary = actions[0];
    const secondaryActions = actions.slice(1);
    return (
      <div className={`reco-card reco-card-compact${noRec ? ' reco-card-muted' : ''}`}>
        <div className="reco-priority">
          {badge && <span className={`reco-badge chip-${badge.tone}`}>{badge.label}</span>}
          {priorityReason && <span>{priorityReason}</span>}
        </div>

        {/* 1 — what happened / what needs me — the dominant, scannable line. */}
        <div className="reco-situation">{lead}</div>

        {/* 2 — why it matters (the emergent meaning). */}
        {contract.impact && <div className="reco-line"><span className="reco-label">מדוע:</span> {contract.impact}</div>}

        {/* 3 — what happens if I don't act. */}
        {contract.consequence && <div className="reco-line reco-consequence"><span className="reco-label">אם לא:</span> {contract.consequence}</div>}
        {contract.requiredAttention && <div className="reco-line"><span className="reco-label">נדרש:</span> {contract.requiredAttention}</div>}

        {/* 4 — Sigma's take (or its honest limit). */}
        <div className="reco-take">
          {noRec
            ? <span>{contract.note ?? 'זיהיתי מה דורש בחינה — איני ממליצה כרגע על פתרון ספציפי.'}</span>
            : <><span className="reco-take-label">המלצת Sigma:</span> {contract.headline}{contract.decision && <span className="reco-choice-inline"> · {contract.decision}</span>}</>}
        </div>

        {/* ONE big CTA + quiet secondary. */}
        <div className="reco-cta-row">
          {primary
            ? <button className={`btn reco-cta${primary.kind === 'danger' ? ' btn-danger' : ' btn-primary'}`} onClick={primary.onClick} disabled={primary.disabled} title={primary.title}>{primary.label} ←</button>
            : entity && <button className="btn btn-primary reco-cta" onClick={() => navigate(`/entity/${entity.type}/${entity.id}`)}>פתח {entityNoun(entity.type)} ←</button>}
          <div className="reco-secondary">
            {hasChain && <button className="link-btn" onClick={() => setChainOpen(v => !v)}>{chainOpen ? 'הסתר ▴' : 'איך Sigma הגיעה לזה? ▾'}</button>}
            {contract.evidenceId && <button className="link-btn" onClick={openEvidence}>על מה מבוסס ←</button>}
            {secondaryActions.map((a, i) => <button key={i} className="link-btn" onClick={a.onClick} disabled={a.disabled} title={a.title}>{a.label}</button>)}
            {primary && entity && <ReasoningLink type={entity.type} id={entity.id} variant="text" />}
          </div>
        </div>

        {chainOpen && hasChain && <ol className="reco-chain">{contract.reasoningChain!.map((s, i) => <li key={i}>{s}</li>)}</ol>}
      </div>
    );
  }

  // ---------- FULL: everything inline (Mission / Approvals) ----------
  const hasDetail = !!contract.tradeoffs || contract.alternatives.length > 0;
  return (
    <div className={`reco-card${noRec ? ' reco-card-muted' : ''}`}>
      <div className="reco-head">
        <span className="reco-kicker">
          {badge && <span className={`reco-badge chip-${badge.tone}`}>{badge.label}</span>}
          {noRec ? 'הבנה מבצעית' : title}
        </span>
        {conf && !noRec && <span className={`reco-conf reco-conf-${contract.confidence}`}>{conf.label}</span>}
      </div>

      <div className="reco-headline">{lead}</div>
      {contract.impact && <div className="reco-line"><span className="reco-label">המשמעות:</span> {contract.impact}</div>}
      {contract.consequence && <div className="reco-line reco-consequence"><span className="reco-label">{contract.requiredAttention ? 'השלכה מבצעית:' : 'אם לא:'}</span> {contract.consequence}</div>}
      {contract.requiredAttention && <div className="reco-line"><span className="reco-label">נדרש:</span> {contract.requiredAttention}</div>}

      {!noRec && contract.situation && (
        <div className="reco-choice">
          {contract.decision && <div className="reco-choice-line"><span className="reco-label">ההחלטה שלך:</span> {contract.decision}</div>}
          <div className="reco-recommends"><span className="reco-label">המלצת Sigma:</span> <strong>{contract.headline}</strong></div>
        </div>
      )}

      {contract.confidenceReason && <div className="reco-line small" style={{ color: 'var(--muted)' }}>{contract.confidenceReason}</div>}
      {contract.tradeoffs && (
        <div className="reco-tradeoffs">
          <div><span className="reco-t-act">אם תטפל:</span> {contract.tradeoffs.act}</div>
          <div><span className="reco-t-no">אם לא:</span> {contract.tradeoffs.inaction}</div>
        </div>
      )}
      {contract.note && <div className="reco-note">ℹ️ {contract.note}</div>}

      <div className="reco-actions">
        {actions.map((a, i) => (
          <button key={i} className={`btn btn-sm${a.kind === 'primary' ? ' btn-primary' : a.kind === 'danger' ? ' btn-danger' : ''}`} onClick={a.onClick} disabled={a.disabled} title={a.title}>{a.label}</button>
        ))}
        {contract.evidenceId && <button className="btn btn-sm btn-ghost" onClick={openEvidence}>על מה מבוסס ←</button>}
        {entity && <ReasoningLink type={entity.type} id={entity.id} variant="text" />}
        {hasChain && <button className="link-btn" style={{ marginInlineStart: 4 }} onClick={() => setChainOpen(v => !v)}>{chainOpen ? 'הסתר ▴' : 'איך Sigma הגיעה לזה? ▾'}</button>}
        {hasDetail && <button className="link-btn" style={{ marginInlineStart: 4 }} onClick={() => setExpanded(v => !v)}>{expanded ? 'הסתר פירוט ▴' : 'הצג פירוט ▾'}</button>}
      </div>

      {chainOpen && hasChain && <ol className="reco-chain">{contract.reasoningChain!.map((s, i) => <li key={i}>{s}</li>)}</ol>}
      {expanded && hasDetail && contract.alternatives.length > 0 && (
        <div className="reco-detail">
          <div className="reco-alts">
            <div className="reco-label" style={{ marginBottom: 4 }}>חלופות / עובדות קשורות:</div>
            <ul>{contract.alternatives.map((alt, i) => <li key={i}>{alt}</li>)}</ul>
          </div>
        </div>
      )}
    </div>
  );
}
