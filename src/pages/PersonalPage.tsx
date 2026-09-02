import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/StoreContext';
import { missionStatusMeta } from '../lib/meta';
import { StatusChip } from '../components/common/StatusChip';
import { formatRelative } from '../lib/format';
import { CommanderAttention } from '../components/commander/CommanderAttention';

// Commander Space — the role-based operational workspace (evolved from the former "My Space").
// One coherent experience organized around operational relevance + continuity, NOT a personal
// widget collection:
//   מה דורש אותך עכשיו?  — prioritized Attention (the entry hierarchy)
//   ההקשר המבצעי שלך     — a composed view of the operations / directives / watched context relevant now
//   מאז שהיית כאן        — Knowledge Continuity: meaningful changes since the user's previous context
// Personal ≠ relevant: generic personal tasks do not get permanent real estate here. Each object
// appears once, in its most relevant section — no re-listing the same object across widgets.
export function PersonalPage() {
  const { currentUserId, directives, watchlist, removeWatchlist, timelineEvents, missions } = useStore();
  const navigate = useNavigate();

  const myOperations = missions.filter(m => m.participantIds.includes(currentUserId) || m.ownerId === currentUserId);
  const myOpIds = new Set(myOperations.map(m => m.id));
  const myDirectives = directives.filter(d => d.affectedUserIds.includes(currentUserId));

  // Directives surfaced in Attention (מה דורש אותך עכשיו?) are not repeated here.
  const attentionClaimedDirectiveIds = new Set(['d1']); // "שינוי במדיניות אש"
  // Directives that still need the user (unread or action-required) = current context, not history.
  const activeDirectives = myDirectives.filter(d =>
    (!d.ackUserIds.includes(currentUserId) || d.requiresAction) && !attentionClaimedDirectiveIds.has(d.id));
  const activeDirectiveIds = new Set(activeDirectives.map(d => d.id));

  // Watched context, de-duplicated: drop anything already surfaced as one of my operations above, or
  // already claimed by Attention ("שחר בטוח" is the Attention approval — don't repeat it here).
  const attentionClaimedLabels = new Set(['שחר בטוח']);
  const watchedContext = watchlist
    .filter(w => w.userId === currentUserId)
    .filter(w => !myOpIds.has(w.entityId) && !attentionClaimedLabels.has(w.label));

  // Continuity — meaningful changes around my responsibility, minus objects already shown as active
  // context above (a directive shown as "needs you" is not repeated here as a change).
  const sinceChanges = timelineEvents
    .filter(t => myOperations.some(m => t.relatedEntity.type === 'mission' && t.relatedEntity.id === m.id)
      || myDirectives.some(d => t.relatedEntity.type === 'directive' && t.relatedEntity.id === d.id))
    .filter(t => !(t.relatedEntity.type === 'directive'
      && (activeDirectiveIds.has(t.relatedEntity.id) || attentionClaimedDirectiveIds.has(t.relatedEntity.id))))
    .slice(0, 8);

  return (
    <div className="page" style={{ maxWidth: 1040 }}>
      <div className="eyebrow">מרחב הפיקוד</div>
      <div className="page-header">
        <div>
          <div className="page-title">מה דורש את הקשב שלי עכשיו?</div>
        </div>
      </div>

      {/* Attention — the entry hierarchy. */}
      <CommanderAttention />

      {/* The operations you are responsible for — plain orientation, no conceptual chips. */}
      <div className="section-title" style={{ marginTop: 30 }}>המבצעים שלך</div>
      <div className="card">
        {myOperations.length === 0 ? (
          <div className="cs-context-note">אין מבצעים באחריותך כרגע.</div>
        ) : myOperations.map(m => (
          <div className="cs-op-row" key={m.id}>
            <div className="op-main" onClick={() => navigate(`/portfolio/${m.id}`)}>
              <div className="op-name">{m.name}</div>
              <div className="op-sub">{m.ownerId === currentUserId ? 'באחריותך' : 'משתתף'} · שלב: {m.stage}</div>
            </div>
            <StatusChip label={missionStatusMeta[m.status].label} tone={missionStatusMeta[m.status].tone} />
          </div>
        ))}

        {activeDirectives.length > 0 && (
          <>
            <div className="cs-subhead">הנחיות שדורשות אותך</div>
            {activeDirectives.map(d => (
              <div className="cs-op-row" key={d.id}>
                <div className="op-main" onClick={() => navigate(`/directives/${d.id}`)}>
                  <div className="op-name">{d.title}</div>
                  <div className="op-sub">{d.ackUserIds.includes(currentUserId) ? 'קראתי' : 'טרם אישרתי קריאה'}{d.requiresAction ? ' · נדרשת פעולה' : ''}</div>
                </div>
                <span className="link-btn" onClick={() => navigate(`/directives/${d.id}`)}>פתח ←</span>
              </div>
            ))}
          </>
        )}

        {watchedContext.length > 0 && (
          <>
            <div className="cs-subhead">במעקב</div>
            {watchedContext.map(w => (
              <div className="cs-op-row" key={w.id}>
                <div className="op-main"><div className="op-name">{w.label}</div><div className="op-sub">{w.entityType}</div></div>
                <button className="btn btn-sm" onClick={() => removeWatchlist(w.id)}>הסר</button>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Knowledge Continuity. */}
      <div className="section-title" style={{ marginTop: 26 }}>מאז שהיית כאן</div>
      <div className="card">
        {sinceChanges.length === 0 ? (
          <div className="cs-context-note">אין שינוי משמעותי מאז ביקורך האחרון.</div>
        ) : sinceChanges.map(t => (
          <div className="mini-row" key={t.id}>
            <span className="r-title" style={{ fontWeight: 500 }}>{t.description}</span>
            <span className="r-sub">{formatRelative(t.timestamp)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
