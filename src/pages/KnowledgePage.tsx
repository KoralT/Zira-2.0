import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { knowledgeItems, missions, getMission, getUser } from '../data';
import type { KnowledgeItem } from '../data/types';
import { knowledgeTypeMeta, confidenceMeta } from '../lib/meta';
import { StatusChip } from '../components/common/StatusChip';
import { formatDate, formatRelative } from '../lib/format';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../store/ToastContext';

const FILE_ICON: Record<string, string> = { folder: '📁', document: '📄' };

// One knowledge item, including the continuity layer (source · owner · freshness · deep link ·
// association · use-as-reference) when the item is a file/folder reference from an existing system.
function KnowledgeCard({ k, highlighted }: { k: KnowledgeItem; highlighted: boolean }) {
  const { showToast } = useToast();
  const [assignTo, setAssignTo] = useState('');
  const owner = k.ownerUserId ? getUser(k.ownerUserId) : undefined;
  const isFileRef = !!k.fileKind;

  return (
    <div className="card" style={{ marginBottom: 12, border: highlighted ? '2px solid var(--blue)' : undefined }}>
      <div className="flex-between" style={{ alignItems: 'flex-start' }}>
        <div>
          <StatusChip label={knowledgeTypeMeta[k.type].label} tone={knowledgeTypeMeta[k.type].tone} />
          <h3 style={{ fontSize: 16.5, margin: '8px 0 4px', color: 'var(--ink-soft)' }}>
            {isFileRef && <span style={{ marginInlineEnd: 6 }}>{FILE_ICON[k.fileKind!] ?? '📄'}</span>}
            {k.title}
          </h3>
        </div>
        <StatusChip label={confidenceMeta[k.confidence].label} tone={confidenceMeta[k.confidence].tone} />
      </div>
      <p className="small muted" style={{ lineHeight: 1.6 }}>{k.summary}</p>
      <div className="note-box mt-8" style={{ fontSize: 12.5 }}>למה זה רלוונטי: {k.relevanceReason}</div>

      {/* Source / owner / freshness — trust metadata for a reference into an existing system. */}
      {isFileRef && (
        <div className="src-strip mt-8">
          <span>🔌 מקור: <strong>{k.sourceSystem}</strong></span>
          {k.fileFormat && <span>· פורמט: {k.fileFormat}</span>}
          {owner && <span>· בעלים: {owner.name}</span>}
          {k.lastUpdated && <span>· עדכניות: {formatRelative(k.lastUpdated)}</span>}
        </div>
      )}

      <div className="flex gap-10 mt-8" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
        <span className="small muted">{k.domain} · {k.unit} · {formatDate(k.date)}</span>
        {k.relatedMissionIds.map(id => <span key={id} className="chip chip-gray">{getMission(id)?.name}</span>)}
        {k.deepLinkUrl
          ? <button className="link-btn" onClick={() => showToast(`פתיחת מקור חיצוני (קריאה בלבד): ${k.deepLinkUrl}`)}>פתח במקור ↗</button>
          : <button className="link-btn" onClick={() => showToast(`מדמה פתיחת הפריט המקורי (Read Only): ${k.title} — ${k.sourceLink}`)}>פתח במקור ↗</button>}
      </div>

      {/* Decision layer: attach this document/insight to an operational entity, or use it as a
          reference in a decision. Sigma references existing knowledge — it does not store it. */}
      <div className="flex gap-8 mt-8" style={{ flexWrap: 'wrap', alignItems: 'center', borderTop: '1px dashed var(--line)', paddingTop: 10 }}>
        <select className="select-field" value={assignTo} onChange={e => setAssignTo(e.target.value)} style={{ fontSize: 12.5 }}>
          <option value="">שייך למבצע / החלטה / אירוע…</option>
          {missions.map(m => <option key={m.id} value={m.id}>מבצע: {m.name}</option>)}
        </select>
        <button
          className="btn btn-sm"
          disabled={!assignTo}
          onClick={() => { showToast(`"${k.title}" שויך למבצע "${getMission(assignTo)?.name}" כרפרנס ידע.`); setAssignTo(''); }}
        >שייך</button>
        <button className="btn btn-sm btn-ghost" onClick={() => showToast(`"${k.title}" זמין כעת כ-Evidence / רפרנס בהחלטות המקושרות.`)}>השתמש כרפרנס בהחלטה</button>
      </div>
    </div>
  );
}

export function KnowledgePage() {
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const [missionId, setMissionId] = useState('all');
  const [type, setType] = useState('all');
  const highlight = params.get('highlight');

  const domains = useMemo(() => Array.from(new Set(knowledgeItems.map(k => k.domain))), []);
  const [domain, setDomain] = useState('all');

  const list = knowledgeItems.filter(k =>
    (!q || k.title.includes(q) || k.summary.includes(q)) &&
    (missionId === 'all' || k.relatedMissionIds.includes(missionId)) &&
    (type === 'all' || k.type === type) &&
    (domain === 'all' || k.domain === domain)
  );

  return (
    <div className="page">
      <div className="eyebrow">SIGMA · COMMAND KNOWLEDGE</div>
      <div className="page-header">
        <div>
          <div className="page-title">ידע מפקדתי</div>
          <div className="page-subtitle">החלטות עבר, לקחים, מבצעים דומים, הנחיות קודמות, אירועים דומים ומסמכים רלוונטיים — כדי לא לחזור על טעות ולהחליט טוב יותר עכשיו.</div>
        </div>
      </div>

      {/* Boundary statement — Sigma is a decision/context layer over existing knowledge systems. */}
      <div className="note-box" style={{ marginBottom: 16 }}>
        Sigma אינה מחליפה את SharePoint או את מאגרי הידע הקיימים — היא שכבת החלטה והקשר מעליהם: רואים מסמכים ותיקיות ממקורות קיימים, פותחים deep link למקור, ומשייכים אותם למבצע/החלטה/אירוע כרפרנס.
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="flex gap-10" style={{ flexWrap: 'wrap' }}>
          <input placeholder="חיפוש חופשי..." value={q} onChange={e => setQ(e.target.value)} style={{ flex: '1 1 220px', border: '1px solid var(--line)', borderRadius: 9, padding: '9px 12px' }} />
          <select className="select-field" value={missionId} onChange={e => setMissionId(e.target.value)}>
            <option value="all">כל המבצעים</option>
            {missions.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <select className="select-field" value={type} onChange={e => setType(e.target.value)}>
            <option value="all">כל הסוגים</option>
            <option value="decision">החלטת עבר</option>
            <option value="lesson">לקח</option>
            <option value="similar-op">מבצע דומה</option>
            <option value="past-directive">הנחיה קודמת</option>
            <option value="incident">אירוע דומה</option>
            <option value="document">מסמך / תיקייה</option>
          </select>
          <select className="select-field" value={domain} onChange={e => setDomain(e.target.value)}>
            <option value="all">כל התחומים</option>
            {domains.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {list.length === 0 && <div className="card"><EmptyState text="לא נמצאו תוצאות תואמות." /></div>}
      {list.map(k => <KnowledgeCard key={k.id} k={k} highlighted={k.id === highlight} />)}
    </div>
  );
}
