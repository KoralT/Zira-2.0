import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getUser, resources as allResources, knowledgeForMission, isDecisionEvent } from '../data';
import { sourceSystems } from '../data/sources';
import { missionStatusMeta, riskMeta, readinessStatusMeta, approvalStatusMeta, resourceAvailabilityMeta, knowledgeTypeMeta, eventSeverityMeta, eventStatusMeta } from '../lib/meta';
import { StatusChip } from '../components/common/StatusChip';
import { RecommendationCard, type RecoAction } from '../components/common/RecommendationCard';
import { recommendationFromMission, recommendationFromEvent } from '../lib/recommendation';
import { formatDate, formatDateTime, formatRelative } from '../lib/format';
import { useStore } from '../store/StoreContext';
import { useUi } from '../store/UiContext';
import { useToast } from '../store/ToastContext';
import { OperationalTimelineWidget } from '../components/widgets/OperationalTimelineWidget';
import { DependenciesWidget } from '../components/widgets/DependenciesWidget';
import { EmptyState } from '../components/common/EmptyState';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'readiness', label: 'Readiness' },
  { key: 'dependencies', label: 'Dependencies' },
  { key: 'resources', label: 'Resources' },
  { key: 'approvals', label: 'Approvals' },
  { key: 'timeline', label: 'Timeline' },
  { key: 'directives', label: 'Directives' },
  { key: 'evidence', label: 'Evidence' },
];

export function MissionDetailPage() {
  const { missionId } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { currentUserId, approvals, watchlist, addWatchlist, removeWatchlist, evidence, updateApprovalStatus, directives, missions, readinessItems, operationalEvents, applyEventImpact } = useStore();
  const mission = missionId ? missions.find(m => m.id === missionId) : undefined;
  const { openEvidenceDrawer } = useUi();
  const { showToast } = useToast();

  const tab = params.get('tab') || 'overview';
  const setTab = (t: string) => setParams({ tab: t });

  if (!mission) {
    return <div className="page"><EmptyState text="מבצע לא נמצא." /></div>;
  }

  const readiness = readinessItems.filter(r => r.missionId === mission.id);
  const missionResources = allResources.filter(r => r.allocatedToMissionId === mission.id);
  const missionApprovals = approvals.filter(a => a.missionId === mission.id);
  const missionDirectives = directives.filter(d => d.relatedMissionIds.includes(mission.id));
  const missionEvidence = evidence.filter(e => e.relatedEntityIds.includes(mission.id));
  const watchItem = watchlist.find(w => w.userId === currentUserId && w.entityType === 'mission' && w.entityId === mission.id);
  const relevantKnowledge = knowledgeForMission(mission.id);
  // The directive whose published impact is currently affecting this mission (for the banner).
  const impactingDirective = directives.find(d => d.status === 'published' && d.affectedMissionIds.includes(mission.id) && d.impacts.some(i => i.missionId === mission.id));
  const missionImpact = impactingDirective?.impacts.find(i => i.missionId === mission.id);

  // The mission's recommended next action (v1.0 capability #5, Layer 2→3), derived from the
  // active impact and/or a pending approval. Where an approval is pending it is approvable in place.
  const missionById = (id: string) => missions.find(m => m.id === id);
  const recoCtx = { missionById, readinessItems, directives, approvals, evidence, sourceNameById: (id: string) => sourceSystems.find(s => s.id === id)?.name };
  const contract = recommendationFromMission(mission, recoCtx);
  const pendingApproval = approvals.find(a => a.missionId === mission.id && a.status === 'pending');

  // Events affecting this mission (v1.1). An unhandled impacting event becomes the mission's
  // recommended action when there is no directive/approval decision already owning the panel.
  const affectingEvents = operationalEvents.filter(e => isDecisionEvent(e) && (e.impact?.missionId === mission.id || e.relatedMissionIds.includes(mission.id)));
  const unhandledEvent = affectingEvents.find(e => e.status !== 'handled' && e.status !== 'closed');
  const recoActions: RecoAction[] = pendingApproval
    ? [
        {
          label: 'אשר במקום', kind: 'primary',
          onClick: () => { const miss = pendingApproval.missingItems.filter(Boolean); updateApprovalStatus(pendingApproval.id, 'approved'); showToast(miss.length > 0 ? `האישור "${pendingApproval.title}" אושר ללא [${miss.join(', ')}] — נרשם ב-Timeline.` : `האישור "${pendingApproval.title}" אושר ונרשם ב-Timeline.`); },
        },
        { label: 'דחה', kind: 'danger', onClick: () => { updateApprovalStatus(pendingApproval.id, 'rejected'); showToast(`האישור "${pendingApproval.title}" נדחה ונרשם ב-Timeline.`); } },
        ...(impactingDirective ? [{ label: 'פתח את ההנחיה', onClick: () => navigate(`/directives/${impactingDirective.id}`) }] : []),
      ]
    : impactingDirective
      ? [{ label: 'פתח את ההנחיה לטיפול', kind: 'primary' as const, onClick: () => navigate(`/directives/${impactingDirective.id}`) }]
      : [];

  // If nothing else owns the recommendation panel, an unhandled affecting event does.
  const useEventPanel = contract.state === 'no-recommendation' && !!unhandledEvent;
  // Legacy alignment: the reachable Mission Detail card must not reintroduce a confidence-score
  // concept that Commander Space deliberately drops — hide the confidence chip here (card unchanged).
  const panelContract = { ...(useEventPanel ? recommendationFromEvent(unhandledEvent!, recoCtx) : contract), confidence: undefined };
  const panelActions: RecoAction[] = useEventPanel
    ? [{ label: 'טפל בהשפעה', kind: 'primary', onClick: () => { const s = applyEventImpact(unhandledEvent!.id); showToast(`אירוע "${unhandledEvent!.title}" טופל — נפתחה משימת המשך${s?.taskAssigneeName ? ` ל${s.taskAssigneeName}` : ''}, ונרשם ב-Timeline.`); } }]
    : recoActions;
  const panelTitle = useEventPanel ? `אירוע משפיע · ${unhandledEvent!.title}` : 'הפעולה המומלצת למבצע';

  return (
    <div className="page">
      <button className="link-btn" onClick={() => navigate('/portfolio')}>← חזרה לפורטפוליו</button>
      <div className="page-header mt-8">
        <div>
          <div className="eyebrow">מבצע · {mission.sector}</div>
          <div className="page-title">{mission.name}</div>
          <div className="page-subtitle">{mission.purpose}</div>
        </div>
        <div className="flex gap-8" style={{ flexWrap: 'wrap' }}>
          <StatusChip label={missionStatusMeta[mission.status].label} tone={missionStatusMeta[mission.status].tone} />
          <StatusChip label={riskMeta[mission.riskLevel].label} tone={riskMeta[mission.riskLevel].tone} />
          <button className="btn btn-sm" onClick={() => watchItem ? removeWatchlist(watchItem.id) : addWatchlist({ userId: currentUserId, entityType: 'mission', entityId: mission.id, label: mission.name })}>
            {watchItem ? '★ עוקב' : '☆ עקוב'}
          </button>
        </div>
      </div>

      {impactingDirective && missionImpact && (
        <div className="callout-danger" style={{ marginBottom: 16 }}>
          <div className="flex-between" style={{ flexWrap: 'wrap', gap: 8 }}>
            <div>
              <strong>{missionImpact.impactType} בעקבות פרסום "{impactingDirective.title}".</strong>
              {` ${missionImpact.meaning}.`}
              {mission.riskReason ? ` ${mission.riskReason}` : ''} פעולה נדרשת: {missionImpact.requiredAction}.
            </div>
            <button className="btn btn-sm" onClick={() => navigate(`/directives/${impactingDirective.id}`)}>פתח את ההנחיה ←</button>
          </div>
        </div>
      )}

      <div className="tabs">
        {TABS.map(t => <button key={t.key} className={`tab${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>{t.label}</button>)}
      </div>

      {tab === 'overview' && (
        <>
        <div style={{ marginBottom: 16 }}>
          <RecommendationCard contract={panelContract} actions={panelActions} title={panelTitle} entity={useEventPanel ? { type: 'event', id: unhandledEvent!.id } : undefined} />
        </div>
        <div className="grid grid-2">
          <div className="card">
            <div className="card-title">פרטי מבצע</div>
            <div className="mini-row"><span className="r-title">שלב</span><span className="r-sub">{mission.stage}</span></div>
            <div className="mini-row"><span className="r-title">Owner</span><span className="r-sub">{getUser(mission.ownerId)?.name}</span></div>
            <div className="mini-row"><span className="r-title">משתתפים</span><span className="r-sub">{mission.participantIds.map(id => getUser(id)?.name).join(', ')}</span></div>
            <div className="mini-row"><span className="r-title">חלון זמן</span><span className="r-sub">{formatDate(mission.timelineStart)} – {formatDate(mission.timelineEnd)}</span></div>
            <div className="mini-row"><span className="r-title">תאריך יעד</span><span className="r-sub">{formatDate(mission.dueDate)}</span></div>
            <div className="mini-row"><span className="r-title">עדכון אחרון</span><span className="r-sub">{formatDateTime(mission.lastUpdated)}</span></div>
            {/* Readiness % is shown only when it is NOT the product of the directive fan-out
                (POLICY_REQUIREMENT_WEIGHT). For a directive-affected mission the consequence is
                expressed as gap → meaning → required handling (banner + risk), not a Sigma-computed %. */}
            {!mission.readinessNote && (
              <div className="mt-14">
                <div className="small muted" style={{ marginBottom: 6 }}>מוכנות {mission.readiness}%</div>
                <div className="progress-track"><div className="progress-fill" style={{ width: `${mission.readiness}%`, background: mission.readiness >= 75 ? 'var(--green)' : mission.readiness >= 50 ? 'var(--amber)' : 'var(--red)' }} /></div>
              </div>
            )}
            <div className="mini-row mt-8"><span className="r-title">סיכון</span><span className="r-sub"><StatusChip label={riskMeta[mission.riskLevel].label} tone={riskMeta[mission.riskLevel].tone} />{mission.riskReason ? <span className="small muted"> — {mission.riskReason}</span> : ''}</span></div>
          </div>
          <div className="card">
            <div className="card-title">מידע שעשוי להיות רלוונטי</div>
            <div className="card-sub mt-8" style={{ marginBottom: 10 }}>מבוסס על ידע מפקדתי — Command Knowledge</div>
            {relevantKnowledge.length === 0 && <EmptyState text="לא נמצא ידע רלוונטי למבצע זה." />}
            {relevantKnowledge.map(k => (
              <div key={k.id} className="mini-row" style={{ cursor: 'pointer' }} onClick={() => navigate(`/knowledge?highlight=${k.id}`)}>
                <div>
                  <div className="r-title">{k.title}</div>
                  <div className="r-sub">{k.relevanceReason}</div>
                </div>
                <StatusChip label={knowledgeTypeMeta[k.type].label} tone={knowledgeTypeMeta[k.type].tone} />
              </div>
            ))}
          </div>
        </div>
        {affectingEvents.length > 0 && (
          <div className="card mt-20">
            <div className="card-title">אירועים משפיעים</div>
            <div className="card-sub mt-8" style={{ marginBottom: 6 }}>אירועים במרחב שנקשרו למבצע והשלכתם על ההחלטה.</div>
            {affectingEvents.map(e => (
              <div className="mini-row" key={e.id} style={{ alignItems: 'flex-start' }}>
                <div>
                  <div className="r-title">{e.title}</div>
                  <div className="r-sub">{e.impact?.meaning ?? e.description}{e.locationLabel ? ` · ${e.locationLabel}` : ''}</div>
                  {e.status !== 'handled' && e.status !== 'closed' && (
                    <div className="btn-row mt-8">
                      <button className="btn btn-sm btn-primary" onClick={() => { const s = applyEventImpact(e.id); showToast(`אירוע "${e.title}" טופל — נפתחה משימת המשך${s?.taskAssigneeName ? ` ל${s.taskAssigneeName}` : ''}, ונרשם ב-Timeline.`); }}>טפל בהשפעה</button>
                      {e.evidenceIds[0] && <button className="btn btn-sm btn-ghost" onClick={() => openEvidenceDrawer(e.evidenceIds[0])}>Evidence ←</button>}
                    </div>
                  )}
                </div>
                <div className="flex-col gap-6" style={{ alignItems: 'flex-end' }}>
                  <StatusChip label={eventSeverityMeta[e.severity].label} tone={eventSeverityMeta[e.severity].tone} />
                  <StatusChip label={eventStatusMeta[e.status].label} tone={eventStatusMeta[e.status].tone} dot={false} />
                </div>
              </div>
            ))}
          </div>
        )}
        </>
      )}

      {tab === 'readiness' && (
        <div className="card">
          <div className="card-title">Readiness Checklist</div>
          <div className="table-wrap mt-14">
            <table className="table">
              <thead><tr><th>קטגוריה</th><th>דרישה</th><th>סטטוס</th><th>Owner</th><th>מקור</th><th>עודכן</th><th>Evidence</th><th>נדרש תיקוף</th></tr></thead>
              <tbody>
                {readiness.map(r => (
                  <tr key={r.id}>
                    <td>{r.categoryLabel}</td>
                    <td>{r.requirement}</td>
                    <td><StatusChip label={readinessStatusMeta[r.status].label} tone={readinessStatusMeta[r.status].tone} /></td>
                    <td>{r.ownerId ? getUser(r.ownerId)?.name : <span className="muted">ללא Owner</span>}</td>
                    <td>{r.sourceId}</td>
                    <td>{formatRelative(r.lastUpdated)}</td>
                    <td>{r.evidenceId ? <button className="link-btn" onClick={() => openEvidenceDrawer(r.evidenceId!)}>פתח</button> : '—'}</td>
                    <td>{r.requiresValidation ? 'כן' : 'לא'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'dependencies' && <DependenciesWidget missionId={mission.id} />}

      {tab === 'resources' && (
        <div className="card">
          <div className="card-title">Resources</div>
          <div className="table-wrap mt-14">
            <table className="table">
              <thead><tr><th>משאב</th><th>כמות</th><th>זמינות</th><th>הקצאה</th><th>קונפליקט</th><th>חלופות</th></tr></thead>
              <tbody>
                {missionResources.map(r => (
                  <tr key={r.id}>
                    <td>{r.name}</td>
                    <td>{r.quantity}</td>
                    <td><StatusChip label={resourceAvailabilityMeta[r.availability].label} tone={resourceAvailabilityMeta[r.availability].tone} /></td>
                    <td>{mission.name}</td>
                    <td>{r.conflict ? <span style={{ color: 'var(--red)' }}>{r.conflictDescription}</span> : '—'}</td>
                    <td>{r.alternatives.join(', ') || '—'}</td>
                  </tr>
                ))}
                {missionResources.length === 0 && <tr><td colSpan={6}><EmptyState text="לא נמצאו משאבים מוקצים." /></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'approvals' && (
        <div className="card">
          <div className="card-title">Approvals</div>
          <div className="table-wrap mt-14">
            <table className="table">
              <thead><tr><th>נדרש מ</th><th>סטטוס</th><th>ממתין</th><th>תנאים חסרים</th><th>Evidence</th><th>פעולה</th></tr></thead>
              <tbody>
                {missionApprovals.map(a => (
                  <tr key={a.id}>
                    <td>{getUser(a.requiredFromUserId)?.name}</td>
                    <td><StatusChip label={approvalStatusMeta[a.status].label} tone={approvalStatusMeta[a.status].tone} /></td>
                    <td>{formatRelative(a.waitingSince)}</td>
                    <td>{a.missingItems.join(', ') || '—'}</td>
                    <td>{a.evidenceIds.map(id => <button key={id} className="link-btn" onClick={() => openEvidenceDrawer(id)}>Evidence</button>)}</td>
                    <td>
                      {a.status === 'pending' ? (
                        <div className="btn-row">
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => {
                              updateApprovalStatus(a.id, 'approved');
                              showToast(a.missingItems.length > 0 ? `האישור "${a.title}" אושר ללא [${a.missingItems.join(', ')}] — נרשם ב-Timeline.` : `האישור "${a.title}" אושר ונרשם ב-Timeline.`);
                            }}
                          >אשר</button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => { updateApprovalStatus(a.id, 'rejected'); showToast(`האישור "${a.title}" נדחה ונרשם ב-Timeline.`); }}
                          >דחה</button>
                        </div>
                      ) : <span className="muted small">אין פעולה נדרשת</span>}
                    </td>
                  </tr>
                ))}
                {missionApprovals.length === 0 && <tr><td colSpan={6}><EmptyState text="אין אישורים לתצוגה." /></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'timeline' && <OperationalTimelineWidget entity={{ type: 'mission', id: mission.id, label: mission.name }} limit={30} expandTo={undefined} />}

      {tab === 'directives' && (
        <div className="card">
          <div className="card-title">Directives הקשורות למבצע</div>
          {missionDirectives.length === 0 && <EmptyState text="אין הנחיות הקשורות למבצע." />}
          {missionDirectives.map(d => d && (
            <div className="mini-row" key={d.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/directives/${d.id}`)}>
              <div>
                <div className="r-title">{d.title}</div>
                <div className="r-sub">{d.type} · {formatRelative(d.publishedAt)}</div>
              </div>
              <span className="link-btn">פתח ←</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'evidence' && (
        <div className="card">
          <div className="card-title">Evidence & Trust</div>
          {missionEvidence.length === 0 && <EmptyState text="אין Evidence מקושר למבצע." />}
          {missionEvidence.map(e => (
            <div className="mini-row" key={e.id} style={{ cursor: 'pointer' }} onClick={() => openEvidenceDrawer(e.id)}>
              <div>
                <div className="r-title">{e.sourceSystem}</div>
                <div className="r-sub">{getUser(e.ownerUserId)?.name} · עודכן {formatRelative(e.lastUpdated)}</div>
              </div>
              <span className="link-btn">על מה מבוסס ←</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
