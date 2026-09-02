import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/StoreContext';
import { useUi } from '../../store/UiContext';
import { useToast } from '../../store/ToastContext';
import type { AlertType } from '../../data/types';
import { isDecisionEvent, getUser } from '../../data';
import { sourceSystems } from '../../data/sources';
import { alertTypeMeta } from '../../lib/meta';
import { computeAlertPriority } from '../../lib/priority';
import { recommendationFromAlert, recommendationFromApproval, recommendationFromEvent, type RecommendationContract } from '../../lib/recommendation';
import { RecommendationCard, type RecoAction } from '../common/RecommendationCard';
import { ReasoningLink, entityNoun } from '../common/ReasoningLink';

const TYPE_FILTERS: { key: AlertType | 'all'; label: string }[] = [
  { key: 'all', label: 'הכל' },
  { key: 'action-required', label: 'דורש פעולה' },
  { key: 'anomaly', label: 'חריגה' },
  { key: 'context-changed', label: 'שינוי הקשר' },
  { key: 'risk-deadline', label: 'סיכון / דדליין' },
  { key: 'information-gap', label: 'פער מידע' },
];

const EVENT_RANK: Record<string, number> = { critical: 96, high: 82, medium: 62, low: 45 };
const APPROVAL_RANK: Record<string, number> = { high: 74, medium: 56, low: 42 };

interface QueueItem {
  key: string;
  kind: 'event' | 'approval' | 'alert';
  badge: { label: string; tone: string };
  title: string;
  rank: number;
  contract: RecommendationContract;
  actions: RecoAction[];
  entity: { type: string; id: string };
}

// "Why is this #1?" — priority as decision-support, not a number or "critical". Derived from the
// item's kind and what it touches.
function whyFirst(it: QueueItem): string {
  if (it.kind === 'event') return `ראשון לטיפול · ${it.badge.label === 'שינוי לוז' ? 'חיבור חוצה-מקורות · משפיע על מוכנות ליציאה' : 'משפיע על מבצע פעיל'}`;
  if (it.kind === 'approval') return 'ראשון לטיפול · החלטה שלך בלבד · מעכב קידום מבצע';
  return 'ראשון לטיפול · דורש את הטיפול שלך';
}

// The ranked attention queue — "what wouldn't I want the commander to miss now?" — as an
// embeddable section (v1.4 merge). It lives at the TOP of the personal board so the super-urgent
// come first; there is no separate Attention surface (that was duplication/friction).
export function AttentionQueue() {
  const { alerts, currentUserId, missions, approvals, readinessItems, directives, evidence, operationalEvents, updateApprovalStatus, updateAlertStatus, applyEventImpact } = useStore();
  const { openContextDrawer } = useUi();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [onlyMine, setOnlyMine] = useState(true);
  const [typeFilter, setTypeFilter] = useState<AlertType | 'all'>('all');
  const [showMore, setShowMore] = useState(false);   // the other "requires you now" items
  const [showWatch, setShowWatch] = useState(false); // lower-signal "watch" items

  const missionById = (id: string) => missions.find(m => m.id === id);
  const sourceNameById = (id: string) => sourceSystems.find(s => s.id === id)?.name;
  const ctx = { missionById, readinessItems, directives, approvals, evidence, sourceNameById };

  const eventActions = (eId: string, title: string, mId?: string): RecoAction[] => [
    { label: 'טפל בהשפעה', kind: 'primary', onClick: () => { const s = applyEventImpact(eId); showToast(s?.missionName ? `אירוע "${title}" טופל — נפתחה משימת המשך ל${s.taskAssigneeName ?? 'בעל התפקיד'} על "${s.missionName}", ונרשם ב-Timeline.` : `אירוע "${title}" טופל ונרשם ב-Timeline.`); } },
    ...(mId ? [{ label: 'פתח את המבצע', onClick: () => navigate(`/portfolio/${mId}`) }] : []),
  ];
  const approvalActions = (aId: string, title: string, mId: string | undefined, missing: string[]): RecoAction[] => [
    { label: 'אשר במקום', kind: 'primary', onClick: () => { updateApprovalStatus(aId, 'approved'); showToast(missing.length > 0 ? `האישור "${title}" אושר ללא [${missing.join(', ')}] — נרשם ב-Timeline.` : `האישור "${title}" אושר ונרשם ב-Timeline.`); } },
    { label: 'דחה', kind: 'danger', onClick: () => { updateApprovalStatus(aId, 'rejected'); showToast(`האישור "${title}" נדחה ונרשם ב-Timeline.`); } },
    ...(mId ? [{ label: 'פתח מבצע', onClick: () => navigate(`/portfolio/${mId}`) }] : []),
  ];
  const alertActions = (aId: string, title: string): RecoAction[] => [
    { label: 'פתח בהקשר וטפל', kind: 'primary', onClick: () => openContextDrawer(aId) },
    { label: 'סמן כטופל', onClick: () => { updateAlertStatus(aId, 'resolved'); showToast(`"${title}" סומן כטופל ונרשם ב-Timeline.`); } },
  ];

  const items = useMemo<QueueItem[]>(() => {
    const list: QueueItem[] = [];

    operationalEvents
      .filter(e => isDecisionEvent(e) && e.status !== 'handled' && e.status !== 'closed')
      .filter(e => !onlyMine || e.assignedToUserId === currentUserId || e.relatedMissionIds.some(id => missionById(id)?.ownerId === currentUserId))
      .forEach(e => list.push({ key: `ev-${e.id}`, kind: 'event', badge: { label: e.category === 'schedule-change' ? 'שינוי לוז' : 'אירוע', tone: 'purple' }, title: e.title, rank: e.category === 'schedule-change' ? 105 : (EVENT_RANK[e.severity] ?? 50), contract: recommendationFromEvent(e, ctx), actions: e.category === 'schedule-change' ? [] : eventActions(e.id, e.title, e.impact?.missionId), entity: { type: 'event', id: e.id } }));

    approvals
      .filter(a => a.requiredFromUserId === currentUserId && a.status === 'pending')
      .forEach(a => { const missing = a.missingItems.filter(Boolean); list.push({ key: `ap-${a.id}`, kind: 'approval', badge: { label: 'אישור', tone: 'blue' }, title: a.title, rank: (APPROVAL_RANK[a.riskLevel] ?? 40) + (missing.length === 0 ? 6 : 0), contract: recommendationFromApproval(a, ctx), actions: approvalActions(a.id, a.title, a.missionId, missing), entity: { type: 'approval', id: a.id } }); });

    alerts
      .filter(a => (a.status === 'new' || a.status === 'read') && (!onlyMine || a.assignedToUserId === currentUserId))
      .filter(a => typeFilter === 'all' || a.type === typeFilter)
      .forEach(a => list.push({ key: `al-${a.id}`, kind: 'alert', badge: { label: alertTypeMeta[a.type].label, tone: alertTypeMeta[a.type].tone }, title: a.title, rank: computeAlertPriority(a, missionById).score, contract: recommendationFromAlert(a, ctx), actions: alertActions(a.id, a.title), entity: { type: 'alert', id: a.id } }));

    return list.sort((x, y) => y.rank - x.rank);
  }, [operationalEvents, approvals, alerts, onlyMine, typeFilter, currentUserId, missions, readinessItems, directives, evidence]); // eslint-disable-line react-hooks/exhaustive-deps

  const RANK_BUDGET = 90;
  const requiresNow = items.filter(i => i.rank >= RANK_BUDGET);
  const effectiveNow = requiresNow.length > 0 ? requiresNow : items.slice(0, 1);
  const nowSet = new Set(effectiveNow.map(i => i.key));
  const watch = items.filter(i => !nowSet.has(i.key));
  const top = effectiveNow[0];
  const nowRest = effectiveNow.slice(1);

  const row = (it: QueueItem) => (
    <div className="queue-row" key={it.key}>
      <div className="qr-main">
        <div className="flex gap-6" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <span className={`reco-badge chip-${it.badge.tone}`}>{it.badge.label}</span>
          <span className="qr-headline">{it.contract.situation ?? it.contract.headline}</span>
          <ReasoningLink type={it.entity.type} id={it.entity.id} />
        </div>
        <div className="qr-consequence">
          {it.contract.state === 'no-recommendation'
            ? (it.contract.requiredAttention ? `נדרש: ${it.contract.requiredAttention}` : (it.contract.impact ?? ''))
            : <>{it.contract.consequence ? `${it.contract.consequence} ` : ''}<span className="qr-rec">מומלץ: {it.contract.headline}</span></>}
        </div>
      </div>
      <div className="qr-actions">
        {it.actions[0] && <button className={`btn btn-sm${it.actions[0].kind === 'primary' ? ' btn-primary' : ''}`} disabled={it.actions[0].disabled} title={it.actions[0].title} onClick={it.actions[0].onClick}>{it.actions[0].label}</button>}
        <button className="btn btn-sm btn-ghost" onClick={() => navigate(`/entity/${it.entity.type}/${it.entity.id}`)}>פתח {entityNoun(it.entity.type)} ←</button>
      </div>
    </div>
  );

  if (items.length === 0) {
    return (
      <div className="brief-empty card">
        <div style={{ fontSize: 34, marginBottom: 6, color: 'var(--green)' }}>✓</div>
        <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--ink-soft)' }}>אין כרגע דבר שדורש ממך פעולה.</div>
        <div className="muted" style={{ marginTop: 6, lineHeight: 1.6 }}>כל מה שבאחריותך טופל.</div>
        <div className="btn-row mt-14" style={{ justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={() => navigate('/hq')}>עבור לתמונת המפקדה ←</button>
          {onlyMine && <button className="btn" onClick={() => setOnlyMine(false)}>הצג את כל הגזרה</button>}
        </div>
      </div>
    );
  }

  const me = getUser(currentUserId);
  // Semantically precise: not every item is a "decision" — some need review / action / reading.
  const greeting = effectiveNow.length === 1
    ? 'יש דבר אחד שדורש אותך עכשיו.'
    : `יש ${effectiveNow.length} דברים שדורשים אותך עכשיו.`;

  return (
    <>
      {/* One-sentence attention budget — "I checked the noise for you; start here." */}
      <div className="attn-greeting">בוקר טוב{me ? `, ${me.name}` : ''}. <strong>{greeting}</strong></div>

      <div className="next-decision-wrap">
        <RecommendationCard contract={top.contract} actions={top.actions} title={top.title} badge={top.badge} entity={top.entity} priorityReason={whyFirst(top)} compact />
      </div>

      {/* Quiet awareness of what else needs me — nothing the commander must remember disappears. */}
      {(nowRest.length > 0 || watch.length > 0) && (
        <div className="queue-secondary">
          {nowRest.length > 0 && (
            <button className="link-btn" onClick={() => setShowMore(v => !v)}>
              {showMore ? 'הסתר' : (nowRest.length === 1 ? 'עוד פריט אחד דורש את תשומת לבך' : `עוד ${nowRest.length} דורשים את תשומת לבך`)} {showMore ? '▴' : '›'}
            </button>
          )}
          {nowRest.length > 0 && watch.length > 0 && <span className="queue-sep">·</span>}
          {watch.length > 0 && (
            <button className="link-btn" onClick={() => setShowWatch(v => !v)}>
              {watch.length} במעקב {showWatch ? '▴' : '›'}
            </button>
          )}
        </div>
      )}

      {showMore && nowRest.length > 0 && <div className="mt-8">{nowRest.map(row)}</div>}
      {showWatch && watch.length > 0 && <div className="mt-8">{watch.map(row)}</div>}

      {showWatch && (
        <div className="advanced-controls">
          <label className="checkbox-row" style={{ marginBottom: 8 }}>
            <input type="checkbox" checked={onlyMine} onChange={e => setOnlyMine(e.target.checked)} />
            הצג רק פריטים שהוקצו לי
          </label>
          <div className="tabs">
            {TYPE_FILTERS.map(f => (
              <button key={f.key} className={`tab${typeFilter === f.key ? ' active' : ''}`} onClick={() => setTypeFilter(f.key)}>{f.label}</button>
            ))}
          </div>
          <div className="small muted mt-8">הסינון חל על פריטי הקשב; אירועים ואישורים שדורשים אותך מוצגים תמיד.</div>
        </div>
      )}
    </>
  );
}
