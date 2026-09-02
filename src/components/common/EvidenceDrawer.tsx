import { useNavigate } from 'react-router-dom';
import { useUi } from '../../store/UiContext';
import { useStore } from '../../store/StoreContext';
import { useToast } from '../../store/ToastContext';
import { getUser } from '../../data';
import { formatDateTime } from '../../lib/format';
import { confidenceMeta } from '../../lib/meta';
import { Drawer, DrawerSection } from './Drawer';
import { StatusChip } from './StatusChip';

export function EvidenceDrawer() {
  const { evidenceDrawerId, closeEvidenceDrawer } = useUi();
  const { evidence, validateEvidence } = useStore();
  const { showToast } = useToast();
  const navigate = useNavigate();
  if (!evidenceDrawerId) return null;

  const item = evidence.find(e => e.id === evidenceDrawerId);
  if (!item) return null;

  const owner = getUser(item.ownerUserId);
  const conf = confidenceMeta[item.confidence];

  return (
    <Drawer title="Evidence & Trust" subtitle={item.sourceSystem} onClose={closeEvidenceDrawer}>
      <button className="btn btn-sm btn-primary" style={{ marginBottom: 14, width: '100%' }} onClick={() => { const id = item.id; closeEvidenceDrawer(); navigate(`/entity/evidence/${id}`); }}>פתח ממצא ←</button>
      <DrawerSection title="מקור ועדכניות">
        <div className="mini-row"><span className="r-title">מקור</span><span className="r-sub">{item.sourceSystem}</span></div>
        <div className="mini-row"><span className="r-title">בעלים</span><span className="r-sub">{owner ? `${owner.name} · ${owner.roleLabel}` : '—'}</span></div>
        <div className="mini-row"><span className="r-title">עודכן</span><span className="r-sub">{formatDateTime(item.lastUpdated)}</span></div>
        <div className="mini-row"><span className="r-title">רמת אמון</span><StatusChip label={conf.label} tone={conf.tone} /></div>
      </DrawerSection>

      <DrawerSection title="איך המערכת הגיעה למסקנה">
        <p className="small" style={{ color: 'var(--muted)', lineHeight: 1.6 }}>{item.reasoning}</p>
      </DrawerSection>

      {item.hasContradiction && (
        <DrawerSection title="סתירות">
          <div className="callout-danger">{item.contradictionNote}</div>
        </DrawerSection>
      )}

      {item.missingInfo.length > 0 && (
        <DrawerSection title="מידע חסר">
          <ul>{item.missingInfo.map((m, i) => <li key={i} className="small">{m}</li>)}</ul>
        </DrawerSection>
      )}

      <DrawerSection title="ישויות קשורות">
        <div className="flex" style={{ flexWrap: 'wrap', gap: 6 }}>
          {item.relatedEntityIds.map(id => <StatusChip key={id} label={id} tone="blue" dot={false} />)}
        </div>
      </DrawerSection>

      <DrawerSection title="Audit Trail">
        {item.auditTrail.map((a, i) => (
          <div className="mini-row" key={i}>
            <span className="r-title">{a.action}</span>
            <span className="r-sub">{a.actor} · {formatDateTime(a.timestamp)}</span>
          </div>
        ))}
      </DrawerSection>

      <DrawerSection title="קישור למקור">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => showToast(`מדמה מעבר למערכת המקור (Read Only): ${item.deepLinkLabel} — ${item.deepLinkUrl}`)}
        >
          פתח במקור ↗
        </button>
      </DrawerSection>

      <DrawerSection title="Human Validation">
        {item.validationStatus && (
          <div className="note-box mt-8" style={{ marginBottom: 10 }}>
            סטטוס נוכחי: {
              { confirmed: 'אומת', rejected: 'נדחה', outdated: 'סומן כלא עדכני', 'clarification-requested': 'ממתין להבהרה' }[item.validationStatus]
            }
          </div>
        )}
        <div className="btn-row">
          <button className="btn btn-sm" onClick={() => validateEvidence(item.id, 'confirmed')}>✓ אשר</button>
          <button className="btn btn-sm btn-danger" onClick={() => validateEvidence(item.id, 'rejected')}>✕ דחה</button>
          <button className="btn btn-sm" onClick={() => validateEvidence(item.id, 'outdated')}>סמן כלא עדכני</button>
          <button className="btn btn-sm" onClick={() => validateEvidence(item.id, 'clarification-requested')}>בקש הבהרה</button>
        </div>
      </DrawerSection>
    </Drawer>
  );
}
