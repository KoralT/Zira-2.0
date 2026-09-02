import { useNavigate } from 'react-router-dom';
import { getUser } from '../../data';
import { WidgetFrame } from '../common/WidgetFrame';
import { formatRelative } from '../../lib/format';
import { EmptyState } from '../common/EmptyState';
import { useStore } from '../../store/StoreContext';

export function DirectiveWidget({ directiveId }: { directiveId: string }) {
  const navigate = useNavigate();
  const { directives } = useStore();
  const d = directives.find(x => x.id === directiveId);
  if (!d) return <WidgetFrame title="הנחיית מפקד" state="empty"><EmptyState /></WidgetFrame>;

  return (
    <WidgetFrame title="הנחיית מפקד" sourceLabel="מערכת פקודות ומדיניות" lastUpdated={d.publishedAt} expandTo={`/directives/${d.id}`}>
      <div className="mini-row">
        <div>
          <div className="r-title">{d.title}</div>
          <div className="r-sub">{d.type} · פורסם ע"י {getUser(d.publishedById)?.name} · {formatRelative(d.publishedAt)}</div>
        </div>
        <button className="link-btn" onClick={() => navigate(`/directives/${d.id}`)}>פתח ←</button>
      </div>
      <p className="small muted mt-8">{d.content}</p>
    </WidgetFrame>
  );
}
