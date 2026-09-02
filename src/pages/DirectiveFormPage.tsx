import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../store/StoreContext';
import { users, getUser } from '../data';
import type { RoleId } from '../data/types';
import { Modal } from '../components/common/Modal';

const ALL_UNITS = ['מפקדת גזרה צפון', 'אג"ם גזרה', 'מודיעין גזרה', 'לוגיסטיקה גזרה', 'מדור תכנון'];
const ALL_ROLES: { id: RoleId; label: string }[] = [
  { id: 'sector-commander', label: 'מפקד גזרה' },
  { id: 'ops-officer', label: 'קצין אג"ם' },
  { id: 'intel-officer', label: 'קצין מודיעין' },
  { id: 'logistics-officer', label: 'קצין לוגיסטיקה' },
  { id: 'planning-officer', label: 'רמ"ד תכנון' },
];

export function DirectiveFormPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const replaceId = params.get('replace');
  const { directives, currentUserId, createDirective, updateDirectiveStatus, missions } = useStore();
  const replaced = replaceId ? directives.find(d => d.id === replaceId) : undefined;

  const [title, setTitle] = useState(replaced ? `${replaced.title} (עדכון)` : '');
  const [content, setContent] = useState(replaced?.content ?? '');
  const [type, setType] = useState(replaced?.type ?? 'מדיניות כללית');
  const [units, setUnits] = useState<string[]>(replaced?.audienceUnits ?? []);
  const [roles, setRoles] = useState<RoleId[]>(replaced?.audienceRoles ?? []);
  const [missionIds, setMissionIds] = useState<string[]>(replaced?.relatedMissionIds ?? []);
  const [areas, setAreas] = useState(replaced?.relatedAreas.join(', ') ?? '');
  const [effectiveDate, setEffectiveDate] = useState('2026-07-22');
  const [expiryDate, setExpiryDate] = useState('');
  const [requiresAck, setRequiresAck] = useState(true);
  const [requiresAction, setRequiresAction] = useState(false);
  const [sourceRefs, setSourceRefs] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const toggle = <T,>(arr: T[], val: T, set: (v: T[]) => void) => set(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);

  const relatedMissions = missionIds.map(id => missions.find(m => m.id === id)).filter(Boolean);
  const affectedUserIds = Array.from(new Set(users.filter(u => units.includes(u.unit) || roles.includes(u.role)).map(u => u.id)));
  const riskMissions = relatedMissions.filter(m => m && m.riskLevel !== 'low');

  const publish = () => {
    const directive = createDirective({
      title, content, type,
      publishedById: currentUserId, publishedAt: new Date().toISOString(),
      effectiveDate: `${effectiveDate}T09:00:00`, expiryDate: expiryDate ? `${expiryDate}T09:00:00` : undefined,
      audienceUnits: units, audienceRoles: roles, relatedMissionIds: missionIds, relatedAreas: areas.split(',').map(s => s.trim()).filter(Boolean),
      requiresAck, requiresAction, sourceRefs: sourceRefs.split(',').map(s => s.trim()).filter(Boolean),
      affectedUserIds, previousVersionId: replaceId ?? undefined, status: 'published',
    });
    if (replaceId) updateDirectiveStatus(replaceId, 'superseded');
    navigate(`/directives/${directive.id}`);
  };

  return (
    <div className="page">
      <button className="link-btn" onClick={() => navigate('/directives')}>← חזרה להנחיות</button>
      <div className="page-header mt-8">
        <div>
          <div className="page-title">{replaced ? `החלפת הנחיה: ${replaced.title}` : 'יצירת הנחיה חדשה'}</div>
          <div className="page-subtitle">מלא/י את פרטי ההנחיה. לפני פרסום תוצג תצוגת השפעה (Impact Preview).</div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="field"><label>כותרת</label><input value={title} onChange={e => setTitle(e.target.value)} /></div>
          <div className="field"><label>תוכן ההנחיה</label><textarea value={content} onChange={e => setContent(e.target.value)} /></div>
          <div className="field"><label>סוג</label><input value={type} onChange={e => setType(e.target.value)} /></div>
          <div className="grid grid-2">
            <div className="field"><label>תאריך כניסה לתוקף</label><input type="date" value={effectiveDate} onChange={e => setEffectiveDate(e.target.value)} /></div>
            <div className="field"><label>תאריך תפוגה (אופציונלי)</label><input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} /></div>
          </div>
          <div className="field"><label>קבצים / מקורות קשורים (מופרד בפסיקים)</label><input value={sourceRefs} onChange={e => setSourceRefs(e.target.value)} placeholder="מסמך פקודה, ישיבת מטה..." /></div>
          <div className="field"><label>אזורים קשורים (מופרד בפסיקים)</label><input value={areas} onChange={e => setAreas(e.target.value)} /></div>
          <div className="flex gap-14">
            <label className="checkbox-row"><input type="checkbox" checked={requiresAck} onChange={e => setRequiresAck(e.target.checked)} /> נדרש אישור קריאה</label>
            <label className="checkbox-row"><input type="checkbox" checked={requiresAction} onChange={e => setRequiresAction(e.target.checked)} /> נדרשת פעולה</label>
          </div>
        </div>

        <div className="card">
          <div className="card-title">קהל יעד — יחידות</div>
          <div className="flex gap-6 mt-8" style={{ flexWrap: 'wrap' }}>
            {ALL_UNITS.map(u => (
              <button key={u} className={`chip ${units.includes(u) ? 'chip-blue' : 'chip-gray'}`} style={{ cursor: 'pointer', border: 'none' }} onClick={() => toggle(units, u, setUnits)}>{u}</button>
            ))}
          </div>
          <div className="card-title mt-20">קהל יעד — תפקידים</div>
          <div className="flex gap-6 mt-8" style={{ flexWrap: 'wrap' }}>
            {ALL_ROLES.map(r => (
              <button key={r.id} className={`chip ${roles.includes(r.id) ? 'chip-blue' : 'chip-gray'}`} style={{ cursor: 'pointer', border: 'none' }} onClick={() => toggle(roles, r.id, setRoles)}>{r.label}</button>
            ))}
          </div>
          <div className="card-title mt-20">מבצעים קשורים</div>
          <div className="flex gap-6 mt-8" style={{ flexWrap: 'wrap' }}>
            {missions.map(m => (
              <button key={m.id} className={`chip ${missionIds.includes(m.id) ? 'chip-blue' : 'chip-gray'}`} style={{ cursor: 'pointer', border: 'none' }} onClick={() => toggle(missionIds, m.id, setMissionIds)}>{m.name}</button>
            ))}
          </div>
          <div className="card-sub mt-20">קהל יעד מחושב: {affectedUserIds.length} בעלי תפקיד</div>
        </div>
      </div>

      <div className="btn-row mt-20">
        <button className="btn btn-primary" disabled={!title.trim()} onClick={() => setShowPreview(true)}>פרסם →</button>
        <button className="btn" onClick={() => navigate('/directives')}>ביטול</button>
      </div>

      {showPreview && (
        <Modal onClose={() => setShowPreview(false)}>
          <div className="modal-title">Impact Preview</div>
          <p className="small muted">בדוק/י את ההשפעה הצפויה לפני פרסום ההנחיה.</p>
          <div className="mt-14 flex-col gap-10">
            <div className="mini-row"><span className="r-title">מבצעים מושפעים</span><span className="r-sub">{relatedMissions.length}</span></div>
            <div className="mini-row"><span className="r-title">בעלי תפקיד הנדרשים לפעולה</span><span className="r-sub">{affectedUserIds.length}</span></div>
            <div className="mini-row"><span className="r-title">מבצעים שייכנסו/נמצאים בסיכון</span><span className="r-sub">{riskMissions.length}</span></div>
            <div className="mini-row"><span className="r-title">הנחיה קודמת שתוחלף</span><span className="r-sub">{replaced ? replaced.title : 'אין'}</span></div>
          </div>
          {affectedUserIds.length > 0 && (
            <div className="mt-14">
              <div className="small muted" style={{ marginBottom: 6 }}>יקבלו התראה:</div>
              <div className="flex gap-6" style={{ flexWrap: 'wrap' }}>
                {affectedUserIds.map(id => <span key={id} className="chip chip-gray">{getUser(id)?.name}</span>)}
              </div>
            </div>
          )}
          <div className="btn-row mt-20">
            <button className="btn btn-primary" onClick={publish}>אשר ופרסם</button>
            <button className="btn" onClick={() => setShowPreview(false)}>חזור לעריכה</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
