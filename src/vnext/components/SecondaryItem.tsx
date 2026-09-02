import type { AttentionItem } from '../data/attention';
import { FormTags } from './FormTag';
import { useScenario } from '../state/ScenarioContext';

// Quieter secondary attention items. Deliberately shallow — they exist to test prioritization and
// the distinction between forms (an Approval vs an Awareness-only item), NOT to build their full
// workflows. The approval is entry-level only; whether a missing condition gates / warns / advises
// is intentionally NOT decided here.
export function SecondaryItem({ item }: { item: AttentionItem }) {
  const { approvalDecision, acknowledged, decideApproval, acknowledge } = useScenario();

  const isApproval = item.forms.includes('approval');
  const resolved = isApproval ? !!approvalDecision : acknowledged.includes(item.id);

  const resolvedLabel = isApproval
    ? (approvalDecision === 'approved' ? 'אושר' : approvalDecision === 'rejected' ? 'נדחה' : '')
    : 'סומן שהובן';

  return (
    <div className={`cs-item cs-secondary${resolved ? ' resolved' : ''}`}>
      <div className="s-main">
        <FormTags forms={item.forms} />
        <div className="s-headline">{item.headline}</div>
        <div className="s-why">{item.relevance}</div>
        {item.contextLine && !resolved && (
          <div className="s-why" style={{ marginTop: 6 }}>{item.contextLine}</div>
        )}
      </div>

      <div className="s-side">
        {resolved ? (
          <span className="cs-resolved-tag">✓ {resolvedLabel}</span>
        ) : isApproval ? (
          <>
            <button className="cs-btn" onClick={() => decideApproval('approved')} title={item.actions.find(a => a.kind === 'approve')?.effect}>אשר</button>
            <button className="cs-btn ghost" onClick={() => decideApproval('rejected')}>דחה</button>
          </>
        ) : (
          <button className="cs-btn ghost" onClick={() => acknowledge(item.id)}>סמן שהובן</button>
        )}
      </div>
    </div>
  );
}
