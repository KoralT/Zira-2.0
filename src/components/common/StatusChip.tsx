import type { Tone } from '../../lib/meta';

export function StatusChip({ label, tone = 'gray', dot = true }: { label: string; tone?: Tone; dot?: boolean }) {
  return (
    <span className={`chip chip-${tone}`}>
      {dot && <span className="chip-dot" />}
      {label}
    </span>
  );
}
