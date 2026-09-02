import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatRelative } from '../../lib/format';
import { EmptyState } from './EmptyState';

interface WidgetFrameProps {
  title: string;
  sourceLabel?: string;
  lastUpdated?: string;
  state?: 'ok' | 'empty' | 'error' | 'stale';
  emptyText?: string;
  expandTo?: string;
  extraActions?: ReactNode;
  footerRight?: ReactNode;
  children: ReactNode;
}

export function WidgetFrame({ title, sourceLabel, lastUpdated, state = 'ok', emptyText, expandTo, extraActions, footerRight, children }: WidgetFrameProps) {
  const navigate = useNavigate();
  return (
    <div className="widget">
      <div className="widget-header">
        <div className="widget-title-group">
          <div>
            <div className="widget-title">{title}</div>
            {(sourceLabel || lastUpdated) && (
              <div className="widget-meta">
                {sourceLabel}{sourceLabel && lastUpdated ? ' · ' : ''}{lastUpdated ? `עודכן ${formatRelative(lastUpdated)}` : ''}
              </div>
            )}
          </div>
        </div>
        <div className="widget-actions">
          {extraActions}
          {expandTo && (
            <button className="icon-btn" title="פתח במסך מלא" onClick={() => navigate(expandTo)}>⤢</button>
          )}
        </div>
      </div>
      <div className="widget-body">
        {state === 'error' ? (
          <div className="error-state">שגיאה בטעינת נתונים מהמקור.</div>
        ) : state === 'empty' ? (
          <EmptyState text={emptyText ?? 'אין נתונים להצגה כרגע.'} />
        ) : (
          <>
            {state === 'stale' && (
              <div className="stale-banner"><span>המידע אינו עדכני — נדרש רענון מהמקור</span></div>
            )}
            {children}
          </>
        )}
      </div>
      {footerRight && <div className="widget-footer"><span /><span>{footerRight}</span></div>}
    </div>
  );
}
