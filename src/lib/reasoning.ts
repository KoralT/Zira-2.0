import type {
  Mission, OperationalEvent, Approval, AttentionAlert, Directive, EvidenceSource,
  ReadinessItem, TimelineEvent,
} from '../data/types';
import { getUser } from '../data';
import { sourceSystems } from '../data/sources';
import { deriveScheduleShiftInsight } from './contextInsight';
import {
  missionStatusMeta, riskMeta, eventSeverityMeta, eventCategoryMeta, eventStatusMeta,
  approvalStatusMeta, alertTypeMeta, urgencyMeta, directiveStatusMeta,
} from './meta';

// The "reasoning map" (v1.3) — for ANY entity, why it is presented and what it means. Every
// section is DERIVED from live store data (no fabrication). This is the data behind the full-page
// provenance view that answers: מהו · מאיפה · איך מחובר · מה המשמעות · על מה מבוסס · השושלת.

export interface ReasoningRow { label: string; value: string; }
export interface ReasoningConnection { label: string; sub?: string; route?: string; }
export interface ReasoningEvidenceRef { id: string; label: string; confidence?: 'low' | 'medium' | 'high'; }
export interface ReasoningLineageEntry { text: string; timestamp: string; actor?: string; }

export interface ReasoningMapData {
  found: boolean;
  entityType: string;
  entityTypeLabel: string;
  title: string;
  subtitle?: string;
  identity: ReasoningRow[];
  signal?: { system: string; when?: string; note?: string };
  connections: ReasoningConnection[];
  meaning?: string;
  meaningPoints: string[];
  evidence: ReasoningEvidenceRef[];
  lineage: ReasoningLineageEntry[];
  primaryRoute?: string;          // "open the entity itself"
  isEvidence?: boolean;           // evidence findings get the trust/validation controls
  evidenceId?: string;
}

export interface ReasoningStore {
  missions: Mission[];
  operationalEvents: OperationalEvent[];
  approvals: Approval[];
  alerts: AttentionAlert[];
  directives: Directive[];
  evidence: EvidenceSource[];
  readinessItems: ReadinessItem[];
  timelineEvents: TimelineEvent[];
}

const ENTITY_LABEL: Record<string, string> = {
  mission: 'מבצע', event: 'אירוע מבצעי', approval: 'אישור', alert: 'התראה', directive: 'הנחיה', evidence: 'ממצא · Evidence',
};

const sourceName = (id: string) => sourceSystems.find(s => s.id === id)?.name ?? id;
const userLabel = (id?: string) => { const u = id ? getUser(id) : undefined; return u ? `${u.name} · ${u.roleLabel}` : '—'; };

function timelineFor(s: ReasoningStore, type: string, id: string): ReasoningLineageEntry[] {
  return s.timelineEvents
    .filter(t => t.relatedEntity.type === type && t.relatedEntity.id === id)
    .slice(0, 12)
    .map(t => ({ text: t.description, timestamp: t.timestamp, actor: t.actorUserId ? getUser(t.actorUserId)?.name : undefined }));
}

function evidenceRefs(s: ReasoningStore, ids: string[]): ReasoningEvidenceRef[] {
  return ids.map(id => s.evidence.find(e => e.id === id)).filter((e): e is EvidenceSource => !!e)
    .map(e => ({ id: e.id, label: e.sourceSystem, confidence: e.confidence }));
}

export function buildReasoningMap(entityType: string, entityId: string, s: ReasoningStore): ReasoningMapData {
  const base = (): ReasoningMapData => ({ found: false, entityType, entityTypeLabel: ENTITY_LABEL[entityType] ?? entityType, title: '', identity: [], connections: [], meaningPoints: [], evidence: [], lineage: [] });

  if (entityType === 'mission') {
    const m = s.missions.find(x => x.id === entityId);
    if (!m) return base();
    const directives = s.directives.filter(d => d.relatedMissionIds.includes(m.id));
    const approvals = s.approvals.filter(a => a.missionId === m.id);
    const events = s.operationalEvents.filter(e => e.relatedMissionIds.includes(m.id) || e.impact?.missionId === m.id);
    const impacting = s.directives.find(d => d.status === 'published' && d.impacts.some(i => i.missionId === m.id));
    const impact = impacting?.impacts.find(i => i.missionId === m.id);
    const meaningPoints = [
      m.riskReason && `סיכון: ${m.riskReason}`,
      impact && `השפעת "${impacting!.title}": ${impact.meaning}. נדרש: ${impact.requiredAction}.`,
      m.blockersCount > 0 && `${m.blockersCount} חסמים פתוחים.`,
    ].filter(Boolean) as string[];
    return {
      ...base(), found: true,
      title: m.name, subtitle: m.purpose,
      identity: [
        { label: 'סוג', value: 'מבצע' },
        { label: 'סטטוס', value: missionStatusMeta[m.status].label },
        { label: 'שלב', value: m.stage },
        { label: 'בעלים', value: userLabel(m.ownerId) },
        { label: 'גזרה', value: m.sector },
        // Readiness % is omitted when it is the product of the directive fan-out
        // (POLICY_REQUIREMENT_WEIGHT) — the consequence is expressed as a gap, not a Sigma-computed %.
        ...(m.readinessNote ? [] : [{ label: 'מוכנות', value: `${m.readiness}%` }]),
        { label: 'סיכון', value: riskMeta[m.riskLevel].label },
      ],
      signal: { system: 'מערכת ניהול מבצעים · גאנטאיט', when: m.lastUpdated, note: 'המבצע נגזר ממערכת התכנון והמעקב; המערכת נשארת מקור האמת.' },
      connections: [
        ...directives.map(d => ({ label: d.title, sub: 'הנחיה', route: `/directives/${d.id}` })),
        ...events.map(e => ({ label: e.title, sub: 'אירוע', route: `/entity/event/${e.id}` })),
        ...approvals.map(a => ({ label: a.title, sub: `אישור · ${approvalStatusMeta[a.status].label}`, route: `/entity/approval/${a.id}` })),
        ...m.dependsOnMissionIds.map(id => ({ label: s.missions.find(mm => mm.id === id)?.name ?? id, sub: 'תלוי במבצע', route: `/portfolio/${id}` })),
      ],
      meaning: meaningPoints[0] ?? `מוכנות ${m.readiness}% · ${riskMeta[m.riskLevel].label} — אין כרגע השלכה חריגה.`,
      meaningPoints,
      evidence: evidenceRefs(s, m.evidenceIds),
      lineage: timelineFor(s, 'mission', m.id),
      primaryRoute: `/portfolio/${m.id}`,
    };
  }

  if (entityType === 'event') {
    const e = s.operationalEvents.find(x => x.id === entityId);
    if (!e) return base();

    // GP1 — the schedule-change reasoning map IS the Decision Context: it shows the derived chain
    // (time → shared resource → conflict → approval gap) and Sigma's honest limit of knowledge.
    if (e.category === 'schedule-change') {
      const ins = deriveScheduleShiftInsight(e, { missionById: id => s.missions.find(m => m.id === id), approvals: s.approvals });
      if (ins) {
        return {
          ...base(), found: true,
          title: e.title, subtitle: e.description,
          identity: [
            { label: 'סוג', value: 'שינוי לוח זמנים' },
            { label: 'חומרה', value: eventSeverityMeta[e.severity].label },
            { label: 'סטטוס', value: eventStatusMeta[e.status].label },
            { label: 'גזרה', value: e.sector },
          ],
          signal: { system: sourceName(e.sourceId), when: e.detectedAt, note: 'עדכון לוז ממערכת התכנון — אות גולמי, ללא משמעות מובנית במקור.' },
          connections: ins.connections.map(c => ({ label: c.label, sub: c.sub, route: c.route })),
          meaning: ins.meaning,
          meaningPoints: [
            `שינוי הלוז: ${ins.situation}`,
            `החיבור שנמצא: ${ins.meaning}`,
            `השלכה מבצעית: ${ins.consequence}`,
            `נדרש: ${ins.requiredAttention}`,
            ins.alternativeFact,
            'Sigma אינה ממליצה כרגע על פתרון — אין בנתונים חלופה מתוקפת. זהו גבול הידע האחראי.',
          ].filter(Boolean) as string[],
          evidence: evidenceRefs(s, e.evidenceIds),
          lineage: [
            ...s.timelineEvents.filter(t => t.id.startsWith(`event-${e.id}-`)).map(t => ({ text: t.description, timestamp: t.timestamp, actor: t.actorUserId ? getUser(t.actorUserId)?.name : undefined })),
            ...(e.relatedMissionIds[0] ? timelineFor(s, 'mission', e.relatedMissionIds[0]) : []),
          ].slice(0, 12),
          primaryRoute: e.relatedMissionIds[0] ? `/portfolio/${e.relatedMissionIds[0]}` : undefined,
        };
      }
    }

    const mission = e.impact ? s.missions.find(m => m.id === e.impact!.missionId) : undefined;
    const meaningPoints = [
      e.impact && `${e.impact.meaning}. נדרש: ${e.impact.requiredAction}.`,
      mission && `משפיע על מבצע "${mission.name}".`,
    ].filter(Boolean) as string[];
    return {
      ...base(), found: true,
      title: e.title, subtitle: e.description,
      identity: [
        { label: 'סוג', value: 'אירוע מבצעי' },
        { label: 'קטגוריה', value: eventCategoryMeta[e.category].label },
        { label: 'חומרה', value: eventSeverityMeta[e.severity].label },
        { label: 'סטטוס', value: eventStatusMeta[e.status].label },
        { label: 'גזרה', value: e.sector },
        ...(e.locationLabel ? [{ label: 'מיקום', value: e.locationLabel }] : []),
      ],
      signal: { system: sourceName(e.sourceId), when: e.detectedAt, note: `התרחש ${e.occurredAt ? new Date(e.occurredAt).toLocaleString('he-IL') : ''} · דווח מהמקור.` },
      connections: e.relatedMissionIds.map(id => ({ label: s.missions.find(m => m.id === id)?.name ?? id, sub: 'מבצע מושפע', route: `/portfolio/${id}` })),
      meaning: meaningPoints[0] ?? 'אירוע ללא השלכה החלטתית — לא מוצף לטיפול.',
      meaningPoints,
      evidence: evidenceRefs(s, e.evidenceIds),
      lineage: [...s.timelineEvents.filter(t => t.id.startsWith(`event-${e.id}-`)).map(t => ({ text: t.description, timestamp: t.timestamp, actor: t.actorUserId ? getUser(t.actorUserId)?.name : undefined })), ...(mission ? timelineFor(s, 'mission', mission.id) : [])].slice(0, 12),
      primaryRoute: mission ? `/portfolio/${mission.id}` : undefined,
    };
  }

  if (entityType === 'approval') {
    const a = s.approvals.find(x => x.id === entityId);
    if (!a) return base();
    const mission = a.missionId ? s.missions.find(m => m.id === a.missionId) : undefined;
    const missing = a.missingItems.filter(Boolean);
    const meaningPoints = [
      `האישור ${mission ? `מעכב את קידום "${mission.name}"` : 'ממתין להחלטה'}.`,
      missing.length > 0 ? `חסרים תנאים: ${missing.join(', ')}. אישור ללא התנאים משמעו שהמבצע יאושר בלי שתוקפו — Sigma ממליצה להשלים תחילה, אך ההחלטה בידיך.` : 'כל תנאי הסף התקיימו.',
    ];
    return {
      ...base(), found: true,
      title: a.title, subtitle: mission ? `מבצע ${mission.name}` : undefined,
      identity: [
        { label: 'סוג', value: 'אישור' },
        { label: 'נדרש מ', value: userLabel(a.requiredFromUserId) },
        { label: 'סטטוס', value: approvalStatusMeta[a.status].label },
        { label: 'רמת סיכון', value: riskMeta[a.riskLevel].label },
      ],
      signal: { system: 'מערכת אישורים · גאנטאיט', when: a.waitingSince, note: 'האישור נגזר מתהליך המוכנות של המבצע.' },
      connections: mission ? [{ label: mission.name, sub: 'מבצע', route: `/portfolio/${mission.id}` }] : [],
      meaning: meaningPoints[0], meaningPoints,
      evidence: evidenceRefs(s, a.evidenceIds),
      lineage: mission ? timelineFor(s, 'mission', mission.id) : [],
      primaryRoute: mission ? `/portfolio/${mission.id}` : undefined,
    };
  }

  if (entityType === 'alert') {
    const al = s.alerts.find(x => x.id === entityId);
    if (!al) return base();
    const relEvidence = s.evidence.filter(e => e.relatedEntityIds.includes(al.relatedEntity.id));
    return {
      ...base(), found: true,
      title: al.title, subtitle: al.description,
      identity: [
        { label: 'סוג', value: 'התראה' },
        { label: 'סיווג', value: alertTypeMeta[al.type].label },
        { label: 'דחיפות', value: urgencyMeta[al.urgency].label },
        { label: 'רמת אמון', value: al.confidence },
      ],
      signal: { system: sourceName(al.sourceId), when: al.detectedAt, note: al.reasonForUser },
      connections: [{ label: al.relatedEntity.label, sub: al.relatedEntity.type === 'mission' ? 'מבצע' : al.relatedEntity.type === 'directive' ? 'הנחיה' : 'ישות', route: al.relatedEntity.type === 'mission' ? `/portfolio/${al.relatedEntity.id}` : al.relatedEntity.type === 'directive' ? `/directives/${al.relatedEntity.id}` : undefined }],
      meaning: al.recommendedAction ? `${al.reasonForUser} מומלץ: ${al.recommendedAction}.` : al.reasonForUser,
      meaningPoints: [al.reasonForUser, al.recommendedAction && `פעולה מומלצת: ${al.recommendedAction}.`].filter(Boolean) as string[],
      evidence: relEvidence.map(e => ({ id: e.id, label: e.sourceSystem, confidence: e.confidence })),
      lineage: timelineFor(s, al.relatedEntity.type, al.relatedEntity.id),
      primaryRoute: al.relatedEntity.type === 'mission' ? `/portfolio/${al.relatedEntity.id}` : al.relatedEntity.type === 'directive' ? `/directives/${al.relatedEntity.id}` : undefined,
    };
  }

  if (entityType === 'directive') {
    const d = s.directives.find(x => x.id === entityId);
    if (!d) return base();
    const affected = (d.affectedMissionIds.length ? d.affectedMissionIds : d.relatedMissionIds);
    return {
      ...base(), found: true,
      title: d.title, subtitle: d.content,
      identity: [
        { label: 'סוג', value: `הנחיה · ${d.type}` },
        { label: 'סטטוס', value: directiveStatusMeta[d.status].label },
        { label: 'גרסה', value: String(d.version) },
        { label: 'פורסם ע"י', value: userLabel(d.publishedById) },
      ],
      signal: { system: 'מערכת פקודות ומדיניות', when: d.publishedAt, note: 'ההנחיה נגזרת ממערכת הפקודות; ההשפעה מחושבת בפרסום.' },
      connections: affected.map(id => ({ label: s.missions.find(m => m.id === id)?.name ?? id, sub: d.affectedMissionIds.includes(id) ? 'מבצע מושפע' : 'מבצע מקושר', route: `/portfolio/${id}` })),
      meaning: d.impacts[0]?.meaning ?? (d.status === 'published' ? 'ההנחיה פורסמה.' : 'טרם פורסמה — אין עדיין השפעה.'),
      meaningPoints: d.impacts.map(i => `${s.missions.find(m => m.id === i.missionId)?.name ?? i.missionId}: ${i.impactType} — ${i.meaning}.`),
      evidence: evidenceRefs(s, d.evidenceIds),
      lineage: timelineFor(s, 'directive', d.id),
      primaryRoute: `/directives/${d.id}`,
    };
  }

  if (entityType === 'evidence') {
    const e = s.evidence.find(x => x.id === entityId);
    if (!e) return base();
    return {
      ...base(), found: true, isEvidence: true, evidenceId: e.id,
      title: e.sourceSystem, subtitle: 'ממצא · Evidence & Trust',
      identity: [
        { label: 'מקור', value: e.sourceSystem },
        { label: 'בעלים', value: userLabel(e.ownerUserId) },
        { label: 'עודכן', value: new Date(e.lastUpdated).toLocaleString('he-IL') },
        { label: 'רמת אמון', value: e.confidence },
      ],
      signal: { system: e.sourceSystem, when: e.lastUpdated, note: e.deepLinkLabel },
      connections: e.relatedEntityIds.map(id => {
        const m = s.missions.find(mm => mm.id === id);
        return m ? { label: m.name, sub: 'מבצע', route: `/portfolio/${m.id}` } : { label: id, sub: 'ישות' };
      }),
      meaning: e.reasoning,
      meaningPoints: [
        e.reasoning,
        e.hasContradiction && e.contradictionNote ? `סתירה: ${e.contradictionNote}` : '',
        ...e.missingInfo.map(mi => `מידע חסר: ${mi}`),
      ].filter(Boolean) as string[],
      evidence: [{ id: e.id, label: e.sourceSystem, confidence: e.confidence }],
      lineage: e.auditTrail.map(a => ({ text: a.action, timestamp: a.timestamp, actor: a.actor })),
    };
  }

  return base();
}
