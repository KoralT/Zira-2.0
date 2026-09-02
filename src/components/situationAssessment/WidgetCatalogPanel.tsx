import type { ContextType, WidgetKind } from '../../data/types';
import { widgetCatalog, CONTEXT_TYPE_LABELS } from '../../data/widgets';

// Widget catalog — lives INSIDE situation assessment (not a standalone module).
// Filtered by the selected context, source-color tagged, add/remove to board.
export function WidgetCatalogPanel({ contextType, boardKinds, onToggle }: {
  contextType: ContextType;
  boardKinds: WidgetKind[];
  onToggle: (kind: WidgetKind) => void;
}) {
  const relevant = widgetCatalog.filter(w => w.contexts.includes(contextType));
  const others = widgetCatalog.filter(w => !w.contexts.includes(contextType));

  const renderCard = (w: typeof widgetCatalog[number], dimmed: boolean) => {
    const onBoard = boardKinds.includes(w.kind);
    return (
      <div key={w.id} style={{
        background: onBoard ? 'var(--blue-soft)' : 'var(--surface-soft)',
        border: `1px solid ${onBoard ? 'var(--blue)' : 'var(--line)'}`,
        borderRadius: 9, padding: '10px 12px', opacity: dimmed ? 0.6 : 1,
      }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: onBoard ? 'var(--blue)' : 'var(--ink-soft)', marginBottom: 6 }}>{w.name}</div>
        <div className="flex gap-6" style={{ flexWrap: 'wrap', marginBottom: 8 }}>
          {w.contexts.map(c => <span key={c} className="chip chip-gray" style={{ fontSize: 9, padding: '1px 6px' }}>{CONTEXT_TYPE_LABELS[c]}</span>)}
          <span className="chip" style={{ fontSize: 9, padding: '1px 6px', background: `${w.sourceColor}18`, color: w.sourceColor, border: `1px solid ${w.sourceColor}33` }}>{w.sourceSystem}</span>
        </div>
        <button className={`btn btn-sm ${onBoard ? 'btn-primary' : ''}`} style={{ width: '100%', justifyContent: 'center' }} onClick={() => onToggle(w.kind)}>
          {onBoard ? 'הסר מהלוח' : 'הוסף ללוח'}
        </button>
      </div>
    );
  };

  return (
    <div style={{ padding: '14px 16px', flex: 1, overflowY: 'auto' }}>
      <div className="drawer-section-title" style={{ marginBottom: 10 }}>קטלוג Widgets</div>
      <div className="flex-col gap-8">
        {relevant.map(w => renderCard(w, false))}
        {others.length > 0 && (
          <>
            <div className="small muted" style={{ margin: '6px 0 2px' }}>פחות רלוונטי להקשר זה:</div>
            {others.map(w => renderCard(w, true))}
          </>
        )}
      </div>
    </div>
  );
}
