export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('he-IL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const NOW = new Date('2026-07-22T09:00:00');

export function formatRelative(iso: string): string {
  const d = new Date(iso);
  const diffMs = NOW.getTime() - d.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return 'עכשיו';
  if (diffMin < 60) return `לפני ${diffMin} דק׳`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `לפני ${diffH} שע׳`;
  const diffD = Math.round(diffH / 24);
  return `לפני ${diffD} ימים`;
}

export function isStale(iso: string, staleHours = 48): boolean {
  const d = new Date(iso);
  return (NOW.getTime() - d.getTime()) / 3600000 > staleHours;
}
