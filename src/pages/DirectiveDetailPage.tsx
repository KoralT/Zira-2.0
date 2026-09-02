import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore, type PublishImpactSummary } from '../store/StoreContext';
import { useUi } from '../store/UiContext';
import { useToast } from '../store/ToastContext';
import { getUser } from '../data';
import { directiveStatusMeta, taskStatusMeta } from '../lib/meta';
import { StatusChip } from '../components/common/StatusChip';
import { formatDate, formatDateTime, formatRelative } from '../lib/format';
import { EmptyState } from '../components/common/EmptyState';
import { CreateTaskModal } from '../components/common/CreateTaskModal';
import { Modal } from '../components/common/Modal';
import { OperationalTimelineWidget } from '../components/widgets/OperationalTimelineWidget';

export function DirectiveDetailPage() {
  const { directiveId } = useParams();
  const navigate = useNavigate();
  const {
    directives, currentUserId, ackDirective, updateDirectiveStatus, evidence, tasks, missions,
    publishDirectiveWithImpact, resetDemoScenario,
  } = useStore();
  const { openEvidenceDrawer, openContextDrawer } = useUi();
  const { showToast } = useToast();
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [impactSummary, setImpactSummary] = useState<PublishImpactSummary | null>(null);

  const directive = directives.find(d => d.id === directiveId);
  if (!directive) return <div className="page"><EmptyState text="הנחיה לא נמצאה." /></div>;

  const isPublished = directive.status === 'published';
  // Before publish: linked missions (scope of possible impact). After publish: actually affected.
  const linkedMissions = directive.relatedMissionIds.map(id => missions.find(m => m.id === id)).filter(Boolean);
  const affectedMissions = (isPublished && directive.affectedMissionIds.length > 0 ? directive.affectedMissionIds : directive.relatedMissionIds)
    .map(id => missions.find(m => m.id === id)).filter(Boolean);
  const directiveEvidence = evidence.filter(e => directive.evidenceIds.includes(e.id));
  const derivedTasks = tasks.filter(t => t.sourceType === 'directive' && t.sourceId === directive.id);
  const hasAcked = directive.ackUserIds.includes(currentUserId);
  const isAudience = directive.affectedUserIds.includes(currentUserId);

  const runDemo = () => {
    const summary = publishDirectiveWithImpact(directive.id);
    if (summary) {
      setImpactSummary(summary);
      showToast(`ההנחיה פורסמה. Sigma ניתחה את ההשפעה: ${summary.affectedMissionsCount} מבצעים מושפעים, ${summary.alertsCreatedCount} התראות ומשימת המשך נוצרו.`);
    }
  };

  const runReset = () => {
    resetDemoScenario(directive.id);
    showToast('התרחיש אופס למצב ההתחלתי (מצב הדגמה).');
  };

  return (
    <div className="page">
      <button className="link-btn" onClick={() => navigate('/directives')}>← חזרה להנחיות</button>
      <div className="page-header mt-8">
        <div>
          <div className="eyebrow">{directive.type} · גרסה {directive.version}</div>
          <div className="page-title">{directive.title}</div>
          <div className="page-subtitle">
            {directive.status === 'draft' ? 'טיוטה — טרם פורסמה' : `פורסם ע"י ${getUser(directive.publishedById)?.name} · ${formatDateTime(directive.publishedAt)}`}
          </div>
        </div>
        <div className="flex gap-8" style={{ flexWrap: 'wrap' }}>
          <StatusChip label={directiveStatusMeta[directive.status].label} tone={directiveStatusMeta[directive.status].tone} />
          {directive.status === 'published' && (
            <>
              <button className="btn btn-sm" onClick={() => updateDirectiveStatus(directive.id, 'cancelled')}>בטל</button>
              <button className="btn btn-sm" onClick={() => navigate(`/directives/new?replace=${directive.id}`)}>החלף בגרסה חדשה</button>
              {directive.id === 'd1' && (
                <button className="btn btn-sm btn-ghost" title="מצב הדגמה בלבד" onClick={runReset}>↺ איפוס תרחיש</button>
              )}
            </>
          )}
        </div>
      </div>

      {directive.status === 'draft' && (
        <div className="card" style={{ marginBottom: 20, borderTop: '4px solid var(--blue)' }}>
          <div className="flex-between" style={{ flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div className="card-title">פרסום ההנחיה</div>
              <p className="small muted mt-8" style={{ maxWidth: 620 }}>
                עם הפרסום, Sigma תנתח את השפעת ההנחיה: תסמן את המבצעים המושפעים, תעדכן את רמות המוכנות והסיכון, תסמן דרישות שנחסמו, תפיץ התראות לבעלי התפקיד ותפתח משימות המשך — הכול מתעדכן בכל מסכי המערכת.
              </p>
            </div>
            <button className="btn btn-primary" onClick={runDemo}>פרסם הנחיה</button>
          </div>
        </div>
      )}

      <div className="grid grid-2">
        <div className="card">
          <div className="card-title">תוכן ההנחיה</div>
          <p className="small mt-8" style={{ lineHeight: 1.7 }}>{directive.content}</p>
          <div className="divider" />
          <div className="mini-row"><span className="r-title">תוקף מ</span><span className="r-sub">{formatDate(directive.effectiveDate)}</span></div>
          <div className="mini-row"><span className="r-title">תוקף עד</span><span className="r-sub">{directive.expiryDate ? formatDate(directive.expiryDate) : 'ללא הגבלה'}</span></div>
          <div className="mini-row"><span className="r-title">קהל יעד — יחידות</span><span className="r-sub">{directive.audienceUnits.join(', ')}</span></div>
          <div className="mini-row"><span className="r-title">מקור</span><span className="r-sub">{directive.sourceRefs.join(', ')}</span></div>
          {directive.status === 'published' && isAudience && (
            <div className="mt-14">
              {hasAcked ? (
                <StatusChip label="קראת/י ואישרת" tone="green" />
              ) : (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => { ackDirective(directive.id, currentUserId); showToast('אישור הקריאה נרשם ונוסף ל-Timeline.'); }}
                >אשר קריאה</button>
              )}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title">Acknowledgement Status</div>
          <div className="card-sub mt-8" style={{ marginBottom: 8 }}>{directive.ackUserIds.length} מתוך {directive.affectedUserIds.length} אישרו קריאה</div>
          {directive.affectedUserIds.map(uid => {
            const u = getUser(uid);
            const acked = directive.ackUserIds.includes(uid);
            return (
              <div className="mini-row" key={uid}>
                <span className="r-title">{u?.name} · {u?.roleLabel}</span>
                <StatusChip label={acked ? 'אישר קריאה' : 'טרם אישר'} tone={acked ? 'green' : 'amber'} />
              </div>
            );
          })}
        </div>

        <div className="card" style={{ gridColumn: isPublished && directive.impacts.length > 0 ? '1 / -1' : undefined }}>
          <div className="flex-between">
            <div className="card-title">{isPublished ? 'מבצעים שהושפעו' : 'מבצעים מקושרים (היקף השפעה צפוי)'}</div>
            {!isPublished && <span className="chip chip-gray">טרם פורסם — השפעה תיווצר בפרסום</span>}
          </div>
          {!isPublished ? (
            <>
              {linkedMissions.length === 0 && <EmptyState text="אין מבצעים מקושרים." />}
              {linkedMissions.map(m => m && (
                <div className="mini-row" key={m.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/portfolio/${m.id}`)}>
                  <div><div className="r-title">{m.name}</div><div className="r-sub">מוכנות נוכחית {m.readiness}% · טרם הושפע</div></div>
                  <span className="link-btn">פתח ←</span>
                </div>
              ))}
            </>
          ) : directive.impacts.length > 0 ? (
            <div className="table-wrap mt-8">
              <table className="table">
                <thead><tr><th>מבצע</th><th>סוג השפעה</th><th>משמעות</th><th>פעולה נדרשת</th><th></th></tr></thead>
                <tbody>
                  {directive.impacts.map(imp => {
                    const m = missions.find(mm => mm.id === imp.missionId);
                    return (
                      <tr key={imp.missionId} className="clickable" onClick={() => navigate(`/portfolio/${imp.missionId}`)}>
                        <td style={{ fontWeight: 700, color: 'var(--ink-soft)' }}>{m?.name}</td>
                        <td><StatusChip label={imp.impactType} tone={imp.impactType === 'פער מדיניות אש' ? 'red' : 'amber'} /></td>
                        <td>{imp.meaning}</td>
                        <td>{imp.requiredAction}</td>
                        <td><span className="link-btn">פתח ←</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <>
              {affectedMissions.map(m => m && (
                <div className="mini-row" key={m.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/portfolio/${m.id}`)}>
                  <div><div className="r-title">{m.name}</div></div>
                  <span className="link-btn">פתח ←</span>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="card">
          <div className="flex-between">
            <div className="card-title">פעולות שנגזרו</div>
            <button className="btn btn-sm btn-primary" onClick={() => setTaskModalOpen(true)}>+ צור משימת המשך</button>
          </div>
          {derivedTasks.length === 0 && <EmptyState text="טרם נוצרו פעולות מההנחיה." />}
          {derivedTasks.map(t => (
            <div className="mini-row" key={t.id}>
              <div>
                <div className="r-title">{t.title}</div>
                <div className="r-sub">{getUser(t.assigneeUserId)?.name} · יעד {formatDate(t.dueDate)}</div>
              </div>
              <StatusChip label={taskStatusMeta[t.status].label} tone={taskStatusMeta[t.status].tone} />
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">Evidence</div>
          {directiveEvidence.length === 0 && <EmptyState text="אין Evidence מקושר." />}
          {directiveEvidence.map(e => (
            <div className="mini-row" key={e.id} style={{ cursor: 'pointer' }} onClick={() => openEvidenceDrawer(e.id)}>
              <div>
                <div className="r-title">{e.sourceSystem}</div>
                <div className="r-sub">עודכן {formatRelative(e.lastUpdated)}</div>
              </div>
              <span className="link-btn">פתח ←</span>
            </div>
          ))}
        </div>

        <OperationalTimelineWidget entity={{ type: 'directive', id: directive.id, label: directive.title }} limit={20} />
      </div>

      {taskModalOpen && (
        <CreateTaskModal
          onClose={() => setTaskModalOpen(false)}
          defaultTitle={`המשך טיפול בעקבות הנחיה: ${directive.title}`}
          defaultMissionId={affectedMissions[0]?.id}
          sourceType="directive"
          sourceId={directive.id}
        />
      )}

      {impactSummary && (
        <Modal onClose={() => setImpactSummary(null)}>
          <div className="modal-title">ההנחיה פורסמה — סיכום ההשפעה</div>
          <p className="small muted">{impactSummary.alreadyApplied ? 'ההשפעה כבר הופעלה קודם — הרצה זו אישררה ורשמה מחדש את השרשרת ללא כפילות.' : `Sigma ניתחה את השפעת "${impactSummary.directiveTitle}" וקישרה את המבצעים ובעלי התפקיד המושפעים:`}</p>
          <div className="mt-14 flex-col gap-10">
            <div className="mini-row"><span className="r-title">מבצעים שהושפעו</span><span className="r-sub">{impactSummary.affectedMissionsCount}</span></div>
            <div className="mini-row"><span className="r-title">התראות שנוצרו</span><span className="r-sub">{impactSummary.alertsCreatedCount}</span></div>
            <div className="mini-row"><span className="r-title">משימת המשך</span><span className="r-sub">{impactSummary.tasksCreatedCount > 0 ? `הוקצתה ל${impactSummary.taskAssigneeName}` : '—'}</span></div>
            <div className="mini-row"><span className="r-title">אישור קריאה</span><span className="r-sub">{impactSummary.ackedCount} מתוך {impactSummary.ackRequiredCount} אישרו</span></div>
          </div>

          <div className="drawer-section-title mt-20">המשך טיפול — לאן עכשיו</div>
          <div className="btn-row">
            {impactSummary.primaryMissionId && (
              <button className="btn btn-sm" onClick={() => { navigate(`/portfolio/${impactSummary.primaryMissionId}`); setImpactSummary(null); }}>פתח את המבצע המושפע</button>
            )}
            {impactSummary.primaryMissionId && impactSummary.blockedReadinessId && (
              <button className="btn btn-sm" onClick={() => { navigate(`/portfolio/${impactSummary.primaryMissionId}?tab=readiness`); setImpactSummary(null); }}>ראה דרישת מוכנות שנחסמה</button>
            )}
            {impactSummary.createdAlertIds[0] && (
              <button className="btn btn-sm" onClick={() => { openContextDrawer(impactSummary.createdAlertIds[0]); setImpactSummary(null); }}>פתח את ההתראות</button>
            )}
            <button className="btn btn-sm" onClick={() => { navigate('/me'); setImpactSummary(null); }}>עבור למשימת קצין אג"ם</button>
          </div>
          <div className="btn-row mt-14">
            <button className="btn btn-primary" onClick={() => setImpactSummary(null)}>סגור</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
