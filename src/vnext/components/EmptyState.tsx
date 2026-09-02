// Honest "nothing requires you now" state (S6). Reassuring and trustworthy — a valid, good
// outcome — never padded with widgets to look occupied, and never reading as missing data.
export function EmptyState() {
  return (
    <div className="cs-empty">
      <div className="mark">✓</div>
      <div className="e-title">אין כרגע דבר שדורש אותך</div>
      <div className="e-sub">
        בדקנו את מה שרלוונטי לאחריותך — כרגע אין שינוי משמעותי שמחייב את תשומת לבך.
        אם משהו ישתנה וידרוש אותך, הוא יופיע כאן.
      </div>
    </div>
  );
}
