import { useMemo, useState } from 'react';
import { useStore } from '../store/StoreContext';
import { useUi } from '../store/UiContext';
import { useToast } from '../store/ToastContext';
import { getUser } from '../data';
import type { WidgetKind } from '../data/types';
import { formatDateTime, formatRelative } from '../lib/format';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import { CreateTaskModal } from '../components/common/CreateTaskModal';
import { WidgetRenderer } from '../components/situationAssessment/WidgetRenderer';
import { ContextSelector, type SaContext } from '../components/situationAssessment/ContextSelector';
import { WidgetCatalogPanel } from '../components/situationAssessment/WidgetCatalogPanel';

const SIZE_SPAN = { small: 1, medium: 2, large: 3 };

const TEMPLATES: { id: string; label: string; widgets: WidgetKind[] }[] = [
  { id: 'daily', label: 'הערכת מצב יומית', widgets: ['gantt', 'blockers', 'timeline', 'decisions-today', 'fire', 'means'] },
  { id: 'plans', label: 'אישור תוכניות', widgets: ['approval', 'blockers', 'missing-information', 'directive', 'fire', 'means'] },
  { id: 'blockers', label: 'מבצעים עם חוסמים', widgets: ['blockers', 'missing-information', 'dependencies'] },
  { id: 'approvals', label: 'תמונת אישורים', widgets: ['approval', 'directive', 'decisions-today'] },
  { id: 'northern', label: 'גזרה צפונית', widgets: ['operational-map', 'gantt', 'blockers', 'directive', 'fire', 'means'] },
];

const DEFAULT_BOARD: WidgetKind[] = ['gantt', 'blockers', 'approval', 'decisions-today', 'fire'];
const WIDE_KINDS: WidgetKind[] = ['gantt', 'operational-map', 'fire', 'means', 'timeline'];

export function SituationAssessmentPage() {
  const {
    missions, readinessItems, evidence, approvals, directives, tasks,
    createSession, addDecisionToSession, finishSession, sessions,
  } = useStore();
  const { openEvidenceDrawer } = useUi();
  const { showToast } = useToast();

  const [ctx, setCtx] = useState<SaContext>({ type: 'multi', selectedMissionIds: ['m1', 'm3'], sector: 'גזרה צפונית', from: '2026-07-20', to: '2026-07-27' });
  const [board, setBoard] = useState<WidgetKind[]>(DEFAULT_BOARD);
  const [activeTemplate, setActiveTemplate] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [decisionText, setDecisionText] = useState('');
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [finishOpen, setFinishOpen] = useState(false);
  const [summary, setSummary] = useState('');

  // Resolve the mission scope a widget should filter by.
  const scopeMissionId = ctx.type === 'single' ? ctx.selectedMissionIds[0]
    : ctx.type === 'multi' && ctx.selectedMissionIds.length === 1 ? ctx.selectedMissionIds[0]
    : undefined;

  const session = sessions.find(s => s.id === sessionId);
  const activeTemplateLabel = TEMPLATES.find(t => t.id === activeTemplate)?.label;

  // Lazily create a session the first time the commander records a decision / task / snapshot.
  const ensureSession = () => {
    if (sessionId) return sessionId;
    const s = createSession({
      templateName: activeTemplateLabel ?? 'הערכת מצב מותאמת',
      timeWindow: ctx.type === 'timewindow' ? `${ctx.from} — ${ctx.to}` : '24h',
      scopeMissionIds: ctx.type === 'sector' || ctx.type === 'timewindow' ? missions.map(m => m.id) : ctx.selectedMissionIds,
    });
    setSessionId(s.id);
    return s.id;
  };

  const toggleWidget = (kind: WidgetKind) => {
    setActiveTemplate('');
    setBoard(prev => prev.includes(kind) ? prev.filter(k => k !== kind) : [...prev, kind]);
  };
  const applyTemplate = (id: string, widgets: WidgetKind[]) => { setActiveTemplate(id); setBoard(widgets); };
  const move = (kind: WidgetKind, dir: -1 | 1) => {
    setBoard(prev => {
      const idx = prev.indexOf(kind); const swap = idx + dir;
      if (swap < 0 || swap >= prev.length) return prev;
      const next = [...prev]; [next[idx], next[swap]] = [next[swap], next[idx]]; return next;
    });
  };

  const derivedTasks = tasks.filter(t => t.sourceType === 'situation-assessment' && sessionId && t.sourceId === sessionId);

  const sinceLastTime = useMemo(() => ({
    latestDirective: directives.filter(d => d.status === 'published').slice().sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))[0],
    completedApprovals: approvals.filter(a => a.status === 'approved'),
  }), [directives, approvals]);

  const gaps = useMemo(() => ({
    staleEvidence: evidence.filter(e => e.missingInfo.length > 0),
    contradictions: evidence.filter(e => e.hasContradiction),
    noOwner: readinessItems.filter(r => !r.ownerId),
  }), [evidence, readinessItems]);

  const saveSnapshot = () => { ensureSession(); showToast('נשמר Snapshot של לוח הערכת המצב לדיון.'); };
  const finish = () => {
    const id = ensureSession();
    finishSession(id, summary || `הערכת מצב "${activeTemplateLabel ?? 'מותאמת'}" הושלמה עם ${session?.decisions.length ?? 0} החלטות.`);
    setFinishOpen(false);
    showToast('הערכת המצב פורסמה ונרשמה ב-Timeline.');
  };

  return (
    <div className="page" style={{ maxWidth: 1640 }}>
      <div className="eyebrow">מרחב המפקדה · הערכת מצב</div>
      <div className="page-header">
        <div>
          <div className="page-title">לוח הערכת מצב</div>
          <div className="page-subtitle">מרכיבים ומנהלים את התמונה הנדרשת להערכה, לדיון ולקבלת החלטה — לפי ההקשר והתבנית. כל Widget קורא מהמקור החי ומוביל לעומק.</div>
        </div>
        <div className="btn-row">
          <button className="btn" onClick={saveSnapshot}>שמור Snapshot</button>
          <button className="btn btn-primary" onClick={() => setFinishOpen(true)}>סיים הערכת מצב</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
        {/* Left panel: context + catalog */}
        <div style={{ width: 300, flexShrink: 0, position: 'sticky', top: 16, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 120px)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
          <ContextSelector ctx={ctx} onChange={setCtx} />
          <WidgetCatalogPanel contextType={ctx.type} boardKinds={board} onToggle={toggleWidget} />
        </div>

        {/* Right: templates + board + discussion */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="flex gap-8" style={{ flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
            <span className="small muted">תבניות:</span>
            {TEMPLATES.map(t => (
              <button key={t.id} className={`chip ${activeTemplate === t.id ? 'chip-blue' : 'chip-gray'}`} style={{ cursor: 'pointer', border: 'none' }} onClick={() => applyTemplate(t.id, t.widgets)}>{t.label}</button>
            ))}
          </div>

          {board.length === 0 ? (
            <EmptyState text="הוסף/י Widgets מהקטלוג כדי לבנות את הלוח, או בחר/י תבנית מוכנה." />
          ) : (
            <div className="grid grid-3" style={{ alignItems: 'start' }}>
              {board.map((kind, idx) => {
                const size = WIDE_KINDS.includes(kind) ? 'large' : 'medium';
                return (
                  <div key={kind} style={{ gridColumn: `span ${SIZE_SPAN[size]}` }}>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 6, justifyContent: 'flex-end' }}>
                      <button className="icon-btn" onClick={() => move(kind, -1)} disabled={idx === 0}>↑</button>
                      <button className="icon-btn" onClick={() => move(kind, 1)} disabled={idx === board.length - 1}>↓</button>
                      <button className="icon-btn" onClick={() => toggleWidget(kind)}>✕</button>
                    </div>
                    <WidgetRenderer instance={{ id: kind, widgetKind: kind, size }} scopeMissionId={scopeMissionId} />
                  </div>
                );
              })}
            </div>
          )}

          {/* Discussion row */}
          <div className="grid grid-3 mt-20" style={{ alignItems: 'start' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <div className="card">
                <div className="flex-between">
                  <div className="card-title">החלטות ופעולות</div>
                  <button className="btn btn-sm btn-primary" onClick={() => { ensureSession(); setTaskModalOpen(true); }}>+ צור משימה</button>
                </div>
                {session && session.decisions.length > 0 && session.decisions.map(d => (
                  <div className="mini-row" key={d.id}><span className="r-title" style={{ fontWeight: 500 }}>{d.text}</span><span className="r-sub">{formatRelative(d.timestamp)}</span></div>
                ))}
                {derivedTasks.map(t => (
                  <div className="mini-row" key={t.id}><span className="r-title">{t.title}</span><span className="r-sub">{getUser(t.assigneeUserId)?.name}</span></div>
                ))}
                {(!session || session.decisions.length === 0) && derivedTasks.length === 0 && <p className="small muted mt-8">טרם תועדו החלטות או משימות.</p>}
                <div className="flex gap-8 mt-14">
                  <input placeholder="תעד/י החלטה..." value={decisionText} onChange={e => setDecisionText(e.target.value)} style={{ flex: 1, border: '1px solid var(--line)', borderRadius: 9, padding: '9px 12px' }} />
                  <button className="btn btn-primary btn-sm" onClick={() => { if (decisionText.trim()) { addDecisionToSession(ensureSession(), decisionText); setDecisionText(''); } }}>הוסף</button>
                </div>
              </div>
            </div>

            <div className="flex-col gap-14">
              <div className="card">
                <div className="card-title">מאז הערכת המצב הקודמת</div>
                <div className="mt-8">
                  {sinceLastTime.latestDirective && <div className="mini-row"><span className="r-title" style={{ fontWeight: 500 }}>הנחיה: {sinceLastTime.latestDirective.title}</span></div>}
                  {sinceLastTime.completedApprovals.map(a => (
                    <div className="mini-row" key={a.id}><span className="r-title" style={{ fontWeight: 500 }}>אישור הושלם: {a.title}</span></div>
                  ))}
                </div>
              </div>
              <div className="card">
                <div className="card-title">פערים שדורשים תיקוף</div>
                <div className="mt-8">
                  {gaps.staleEvidence.map(e => (
                    <div className="mini-row" key={e.id} style={{ cursor: 'pointer' }} onClick={() => openEvidenceDrawer(e.id)}><span className="r-title" style={{ fontWeight: 500 }}>מקור לא מעודכן: {e.sourceSystem}</span></div>
                  ))}
                  {gaps.contradictions.map(e => (
                    <div className="mini-row" key={e.id} style={{ cursor: 'pointer' }} onClick={() => openEvidenceDrawer(e.id)}><span className="r-title" style={{ fontWeight: 500 }}>מידע סותר: {e.sourceSystem}</span></div>
                  ))}
                  {gaps.noOwner.map(r => (
                    <div className="mini-row" key={r.id}><span className="r-title" style={{ fontWeight: 500 }}>בעלים חסר: {r.requirement}</span></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Saved assessments strip */}
          {sessions.length > 0 && (
            <div className="card mt-20">
              <div className="card-title">הערכות מצב שמורות</div>
              {sessions.map(s => (
                <div className="mini-row" key={s.id}>
                  <div><div className="r-title">{s.templateName}</div><div className="r-sub">{getUser(s.createdById)?.name} · {formatDateTime(s.createdAt)}</div></div>
                  <span className={`chip ${s.status === 'published' ? 'chip-green' : 'chip-amber'}`}>{s.status === 'published' ? 'פורסם' : 'טיוטה'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {taskModalOpen && sessionId && (
        <CreateTaskModal onClose={() => setTaskModalOpen(false)} sourceType="situation-assessment" sourceId={sessionId} defaultMissionId={scopeMissionId} />
      )}

      {finishOpen && (
        <Modal onClose={() => setFinishOpen(false)}>
          <div className="modal-title">סיום הערכת מצב</div>
          <div className="field mt-14"><label>סיכום לפרסום</label><textarea value={summary} onChange={e => setSummary(e.target.value)} placeholder="סיכום קצר להפצה..." /></div>
          <div className="mt-14 flex-col gap-10">
            <div className="mini-row"><span className="r-title">Widgets בלוח</span><span className="r-sub">{board.length}</span></div>
            <div className="mini-row"><span className="r-title">החלטות שתועדו</span><span className="r-sub">{session?.decisions.length ?? 0}</span></div>
            <div className="mini-row"><span className="r-title">משימות שנוצרו</span><span className="r-sub">{derivedTasks.length}</span></div>
            <div className="mini-row"><span className="r-title">משתמשים לעדכון</span><span className="r-sub">{Array.from(new Set(derivedTasks.map(t => t.assigneeUserId))).length}</span></div>
          </div>
          <div className="btn-row mt-20">
            <button className="btn btn-primary" onClick={finish}>פרסם סיכום וסיים</button>
            <button className="btn" onClick={() => setFinishOpen(false)}>ביטול</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
