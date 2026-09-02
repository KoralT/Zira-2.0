import type { ContextType } from '../../data/types';
import { CONTEXT_TYPE_LABELS } from '../../data/widgets';
import { useStore } from '../../store/StoreContext';

export interface SaContext {
  type: ContextType;
  selectedMissionIds: string[];
  sector: string;
  from: string;
  to: string;
}

const SECTORS = ['גזרה צפונית', 'גזרה מזרחית', 'גזרה מרכזית', 'גזרה דרומית'];

// Context selector — ported from the reference SituationBoardBuilder, reading live missions.
export function ContextSelector({ ctx, onChange }: { ctx: SaContext; onChange: (c: SaContext) => void }) {
  const { missions } = useStore();

  const setType = (t: ContextType) => onChange({ ...ctx, type: t });
  const toggleMission = (id: string) =>
    onChange({ ...ctx, selectedMissionIds: ctx.selectedMissionIds.includes(id) ? ctx.selectedMissionIds.filter(m => m !== id) : [...ctx.selectedMissionIds, id] });

  return (
    <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)' }}>
      <div className="drawer-section-title" style={{ marginBottom: 10 }}>בחירת הקשר</div>

      <div className="flex gap-6" style={{ flexWrap: 'wrap', marginBottom: 12 }}>
        {(['single', 'multi', 'sector', 'timewindow'] as ContextType[]).map(t => (
          <button
            key={t}
            className={`chip ${ctx.type === t ? 'chip-blue' : 'chip-gray'}`}
            style={{ cursor: 'pointer', border: 'none' }}
            onClick={() => setType(t)}
          >
            {CONTEXT_TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      {(ctx.type === 'single' || ctx.type === 'multi') && (
        <div className="flex-col gap-6">
          <div className="small muted">מבצעים נבחרים:</div>
          {missions.map(m => (
            <label key={m.id} className="checkbox-row" style={{ fontWeight: 600 }}>
              <input
                type={ctx.type === 'single' ? 'radio' : 'checkbox'}
                checked={ctx.selectedMissionIds.includes(m.id)}
                onChange={() => ctx.type === 'single' ? onChange({ ...ctx, selectedMissionIds: [m.id] }) : toggleMission(m.id)}
              />
              {m.name}
            </label>
          ))}
        </div>
      )}

      {ctx.type === 'sector' && (
        <div className="field" style={{ marginBottom: 0 }}>
          <label>גזרה</label>
          <select value={ctx.sector} onChange={e => onChange({ ...ctx, sector: e.target.value })}>
            {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}

      {ctx.type === 'timewindow' && (
        <div className="flex-col gap-8">
          <div className="field" style={{ marginBottom: 0 }}><label>מ־</label><input type="date" value={ctx.from} onChange={e => onChange({ ...ctx, from: e.target.value })} /></div>
          <div className="field" style={{ marginBottom: 0 }}><label>עד</label><input type="date" value={ctx.to} onChange={e => onChange({ ...ctx, to: e.target.value })} /></div>
        </div>
      )}

      <div className="note-box mt-14" style={{ fontSize: 12.5 }}>
        {ctx.type === 'single' && `מבצע: ${missions.find(m => m.id === ctx.selectedMissionIds[0])?.name ?? '—'}`}
        {ctx.type === 'multi' && `מבצעים: ${ctx.selectedMissionIds.map(id => missions.find(m => m.id === id)?.name).filter(Boolean).join(', ') || '—'}`}
        {ctx.type === 'sector' && `גזרה: ${ctx.sector}`}
        {ctx.type === 'timewindow' && `חלון זמן: ${ctx.from} — ${ctx.to}`}
      </div>
    </div>
  );
}
