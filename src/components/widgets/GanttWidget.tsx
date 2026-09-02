import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/StoreContext';
import { missionStatusMeta } from '../../lib/meta';
import { WidgetFrame } from '../common/WidgetFrame';

// גאנט מבצעים — קורא מבצעים מה-Store החי ומצייר סרגל זמן פשוט. קליק פותח מבצע.
export function GanttWidget({ missionId }: { missionId?: string }) {
  const navigate = useNavigate();
  const { missions } = useStore();
  const list = missionId ? missions.filter(m => m.id === missionId) : missions;

  const times = list.flatMap(m => [new Date(m.timelineStart).getTime(), new Date(m.timelineEnd).getTime()]);
  const min = Math.min(...times);
  const max = Math.max(...times);
  const span = Math.max(1, max - min);
  const barColor: Record<string, string> = { active: 'var(--green)', planned: 'var(--blue)', paused: 'var(--amber)', completed: 'var(--muted)' };

  return (
    <WidgetFrame title="גאנט מבצעים" sourceLabel="גאנטאיט" lastUpdated="2026-07-22T07:40:00" expandTo="/portfolio"
      state={list.length === 0 ? 'empty' : 'ok'}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {list.map(m => {
          const left = ((new Date(m.timelineStart).getTime() - min) / span) * 100;
          const width = ((new Date(m.timelineEnd).getTime() - new Date(m.timelineStart).getTime()) / span) * 100;
          return (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => navigate(`/portfolio/${m.id}`)}>
              <span style={{ width: 78, fontSize: 12, fontWeight: 700, color: 'var(--ink-soft)', flexShrink: 0 }}>{m.name}</span>
              <div style={{ flex: 1, position: 'relative', height: 16, direction: 'ltr', background: 'var(--surface-soft)', borderRadius: 4 }}>
                <div style={{ position: 'absolute', left: `${left}%`, width: `${Math.max(width, 4)}%`, height: '100%', background: barColor[m.status], borderRadius: 4, opacity: 0.9 }} />
              </div>
              <span className="small muted" style={{ width: 44, textAlign: 'left' }}>{missionStatusMeta[m.status].label}</span>
            </div>
          );
        })}
      </div>
    </WidgetFrame>
  );
}
