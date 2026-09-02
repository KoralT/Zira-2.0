export function EmptyState({ text = 'אין נתונים להצגה כרגע.', icon = '—' }: { text?: string; icon?: string }) {
  return (
    <div className="empty-state">
      <div style={{ fontSize: 22 }}>{icon}</div>
      <div>{text}</div>
    </div>
  );
}
