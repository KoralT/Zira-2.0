import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUi } from '../../store/UiContext';
import { useStore } from '../../store/StoreContext';
import { users, getUser, getMission, getTimelineForEntity } from '../../data';
import { formatDateTime, formatRelative } from '../../lib/format';
import { alertTypeMeta, urgencyMeta, confidenceMeta, alertStatusMeta } from '../../lib/meta';
import { resolveEntityRoute } from '../../lib/entityRoute';
import { Drawer, DrawerSection } from './Drawer';
import { StatusChip } from './StatusChip';

export function ContextDrawer() {
  const { contextDrawerAlertId, closeContextDrawer, openEvidenceDrawer } = useUi();
  const { alerts, updateAlertStatus, directives, evidence: storeEvidence } = useStore();
  const navigate = useNavigate();
  const [assignOpen, setAssignOpen] = useState(false);

  if (!contextDrawerAlertId) return null;
  const alert = alerts.find(a => a.id === contextDrawerAlertId);
  if (!alert) return null;

  const typeMeta = alertTypeMeta[alert.type];
  const urgMeta = urgencyMeta[alert.urgency];
  const confMeta = confidenceMeta[alert.confidence];
  const assignee = alert.assignedToUserId ? getUser(alert.assignedToUserId) : undefined;

  const mission = alert.relatedEntity.type === 'mission' ? getMission(alert.relatedEntity.id) : undefined;
  const directive = alert.relatedEntity.type === 'directive' ? directives.find(d => d.id === alert.relatedEntity.id) : undefined;
  const relatedMissions = directive ? directive.relatedMissionIds.map(getMission).filter(Boolean) : (mission ? [mission] : []);
  const relatedDirectives = mission ? directives.filter(d => d.relatedMissionIds.includes(mission.id)) : (directive ? [directive] : []);
  const evidence = storeEvidence.filter(e => e.relatedEntityIds.includes(alert.relatedEntity.id));
  const timeline = getTimelineForEntity(alert.relatedEntity.type, alert.relatedEntity.id);
  const entityRoute = resolveEntityRoute(alert.relatedEntity);

  const act = (fn: () => void) => { fn(); };

  return (
    <Drawer title="פתיחה בהקשר" subtitle={alert.title} onClose={closeContextDrawer}>
      <button className="btn btn-sm btn-primary" style={{ marginBottom: 14, width: '100%' }} onClick={() => { const id = alert.id; closeContextDrawer(); navigate(`/entity/alert/${id}`); }}>פתח התראה ←</button>
      <DrawerSection title="סוג ורמת דחיפות">
        <div className="flex gap-8" style={{ flexWrap: 'wrap' }}>
          <StatusChip label={typeMeta.label} tone={typeMeta.tone} />
          <StatusChip label={`דחיפות: ${urgMeta.label}`} tone={urgMeta.tone} />
          <StatusChip label={confMeta.label} tone={confMeta.tone} />
          <StatusChip label={alertStatusMeta[alert.status].label} tone={alertStatusMeta[alert.status].tone} />
        </div>
      </DrawerSection>

      <DrawerSection title="הישות המרכזית">
        <div className="mini-row">
          <span className="r-title">{alert.relatedEntity.label}</span>
          {entityRoute && <button className="link-btn" onClick={() => { navigate(entityRoute); closeContextDrawer(); }}>פתח ←</button>}
        </div>
        <p className="small muted mt-8">{alert.description}</p>
      </DrawerSection>

      <DrawerSection title="למה קיבלת את זה">
        <p className="small" style={{ lineHeight: 1.6 }}>{alert.reasonForUser}</p>
        <div className="mini-row"><span className="r-sub">זוהה</span><span className="r-sub">{formatRelative(alert.detectedAt)} · {formatDateTime(alert.detectedAt)}</span></div>
      </DrawerSection>

      {relatedMissions.length > 0 && (
        <DrawerSection title="מבצעים קשורים">
          {relatedMissions.map(m => m && (
            <div className="mini-row" key={m.id}>
              <span className="r-title">{m.name}</span>
              <button className="link-btn" onClick={() => { navigate(`/portfolio/${m.id}`); closeContextDrawer(); }}>פתח ←</button>
            </div>
          ))}
        </DrawerSection>
      )}

      {relatedDirectives.length > 0 && (
        <DrawerSection title="הנחיות קשורות">
          {relatedDirectives.map(d => d && (
            <div className="mini-row" key={d.id}>
              <span className="r-title">{d.title}</span>
              <button className="link-btn" onClick={() => { navigate(`/directives/${d.id}`); closeContextDrawer(); }}>פתח ←</button>
            </div>
          ))}
        </DrawerSection>
      )}

      <DrawerSection title="Timeline">
        {timeline.length === 0 && <p className="small muted">אין אירועים רשומים.</p>}
        {timeline.slice(0, 5).map(t => (
          <div className="mini-row" key={t.id}>
            <span className="r-title" style={{ fontWeight: 500 }}>{t.description}</span>
            <span className="r-sub">{formatRelative(t.timestamp)}</span>
          </div>
        ))}
      </DrawerSection>

      <DrawerSection title="Evidence ומקור">
        {evidence.length === 0 && <p className="small muted">לא נמצא Evidence מקושר ישירות.</p>}
        {evidence.map(e => (
          <div className="mini-row" key={e.id}>
            <span className="r-title">{e.sourceSystem}</span>
            <button className="link-btn" onClick={() => openEvidenceDrawer(e.id)}>על מה מבוסס ←</button>
          </div>
        ))}
      </DrawerSection>

      <DrawerSection title="פעולה מומלצת">
        <div className="note-box">{alert.recommendedAction}</div>
      </DrawerSection>

      <DrawerSection title="טיפול בהתראה">
        <div className="btn-row">
          <button className="btn btn-sm" onClick={() => act(() => updateAlertStatus(alert.id, 'read'))}>סמן שקראתי</button>
          <button className="btn btn-sm" onClick={() => act(() => updateAlertStatus(alert.id, 'snoozed'))}>השהה</button>
          <button className="btn btn-sm btn-primary" onClick={() => act(() => updateAlertStatus(alert.id, 'resolved'))}>פתור</button>
          <button className="btn btn-sm btn-danger" onClick={() => act(() => updateAlertStatus(alert.id, 'escalated'))}>הסלם</button>
          <button className="btn btn-sm" onClick={() => setAssignOpen(v => !v)}>הקצה לטיפול</button>
        </div>
        {assignOpen && (
          <div className="mt-8" style={{ border: '1px solid var(--line)', borderRadius: 10, padding: 8 }}>
            {users.map(u => (
              <div key={u.id} className="identity-option" onClick={() => { updateAlertStatus(alert.id, alert.status, u.id); setAssignOpen(false); }}>
                {u.name} · {u.roleLabel}
              </div>
            ))}
          </div>
        )}
        {assignee && <p className="small muted mt-8">מוקצה כרגע ל: {assignee.name} ({assignee.roleLabel})</p>}
      </DrawerSection>
    </Drawer>
  );
}
