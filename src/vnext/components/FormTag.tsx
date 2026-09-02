import { FORM_LABEL, type AttentionForm } from '../data/attention';

// Small, quiet form chips. A form (Awareness / Decision / Approval / Action) is a *kind* of
// attention, NOT a priority level — the styling is deliberately even-weight across forms.
export function FormTags({ forms }: { forms: AttentionForm[] }) {
  return (
    <div className="cs-forms">
      {forms.map(f => (
        <span key={f} className={`cs-formtag ${f}`}>{FORM_LABEL[f]}</span>
      ))}
    </div>
  );
}
