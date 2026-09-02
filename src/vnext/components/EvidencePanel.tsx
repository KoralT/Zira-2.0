import { EVIDENCE_KIND_LABEL, type EvidencePiece } from '../data/attention';

// Evidence / depth (Level 3). Every piece names its OWNER (the domain/system Commander Space
// consumes it from), its freshness, and — critically — whether it is a fact, a synthesized
// meaning, or an unverified fact. No fabricated confidence percentages: uncertainty is stated
// in words, from the source.
const kindClass: Record<EvidencePiece['kind'], string> = {
  fact: 'fact',
  synthesized: 'synthesized',
  'fact-unverified': 'unverified',
};

export function EvidencePanel({ evidence }: { evidence: EvidencePiece[] }) {
  return (
    <div className="cs-evidence">
      {evidence.map((e, i) => (
        <div className="cs-ev" key={i}>
          <div className="cs-ev-top">
            <div className="cs-ev-label">{e.label}</div>
            <span className={`cs-ev-kind ${kindClass[e.kind]}`}>{EVIDENCE_KIND_LABEL[e.kind]}</span>
          </div>
          <div className="cs-ev-meta">
            <span>{e.sourceOwner}</span>
            <span className="sep">·</span>
            <span>עדכניות: {e.freshness}</span>
            <span className="sep">·</span>
            <span>אי-ודאות: {e.uncertainty}</span>
          </div>
          {e.note && <div className="cs-ev-note">{e.note}</div>}
        </div>
      ))}
    </div>
  );
}
