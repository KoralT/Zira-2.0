import { useNavigate } from 'react-router-dom';

// Transition Grammar (v1.4.6) — "go to entity". One verb across the whole product: "פתח [ישות]".
export const entityNoun = (type: string): string =>
  ({ mission: 'מבצע', directive: 'הנחיה', approval: 'אישור', event: 'אירוע', alert: 'התראה', evidence: 'ממצא' } as Record<string, string>)[type] ?? 'פריט';

// Discreet, consistent affordance to open an entity's full page (v1.3/v1.4.6).
// `variant="icon"` = a small "?" chip (for rows/chips); `variant="text"` = "פתח [ישות] ←".
export function ReasoningLink({ type, id, variant = 'icon', label, stop = true }: {
  type: string;
  id: string;
  variant?: 'icon' | 'text';
  label?: string;
  stop?: boolean;
}) {
  const navigate = useNavigate();
  const go = (e: React.MouseEvent) => { if (stop) e.stopPropagation(); navigate(`/entity/${type}/${id}`); };
  if (variant === 'text') {
    return <button className="link-btn" onClick={go}>{label ?? `פתח ${entityNoun(type)}`} ←</button>;
  }
  return <button className="reason-dot" title={`פתח ${entityNoun(type)} — הקשר, משמעות ומקור`} aria-label={`פתח ${entityNoun(type)}`} onClick={go}>?</button>;
}
