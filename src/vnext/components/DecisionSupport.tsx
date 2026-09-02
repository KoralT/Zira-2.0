import type { AttentionItem } from '../data/attention';

// Honest recommendation behavior. Two states must be VISIBLY distinct:
//  · no-recommendation      — enough to understand, but no single preferred action (human judgment)
//  · insufficient-evidence  — a possible option exists, but not enough trustworthy info to advise it
// The flagship shows both facets: no preferred action overall, AND the one option that exists
// (the alternative axis) is unverified. We never fabricate a recommendation to fill the slot.
export function DecisionSupport({ item }: { item: AttentionItem }) {
  return (
    <div>
      {item.recommendationState === 'none' && item.noRecommendationNote && (
        <div className="cs-support norec">
          <div className="label">אין המלצה</div>
          <div className="body">{item.noRecommendationNote}</div>
        </div>
      )}
      {item.insufficientEvidenceNote && (
        <div className="cs-support insufficient" style={{ marginTop: 10 }}>
          <div className="label">מידע לא מספיק כדי להמליץ</div>
          <div className="body">{item.insufficientEvidenceNote}</div>
        </div>
      )}
    </div>
  );
}
