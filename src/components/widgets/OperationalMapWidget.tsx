import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/StoreContext';
import { isDecisionEvent } from '../../data';
import { WidgetFrame } from '../common/WidgetFrame';

const RISK_COLOR: Record<string, string> = { low: 'var(--green)', medium: 'var(--amber)', high: 'var(--red)' };
const SEV_COLOR: Record<string, string> = { low: 'var(--muted-soft)', medium: 'var(--amber)', high: 'var(--red)', critical: 'var(--red)' };

// Map as a DECISION INSTRUMENT, not a display (guardrail #3): every marker is a clickable entry
// point into a decision context — missions colored by live risk, events by severity. A marker
// that would not lead to a decision is not plotted. Schematic SVG, not GIS.
export function OperationalMapWidget({ missionId }: { missionId?: string }) {
  const navigate = useNavigate();
  const { missions, operationalEvents } = useStore();

  const shownMissions = (missionId ? missions.filter(m => m.id === missionId) : missions).filter(m => m.coord);
  const shownEvents = operationalEvents.filter(e => isDecisionEvent(e) && e.coord && e.status !== 'handled' && e.status !== 'closed'
    && (!missionId || e.impact?.missionId === missionId || e.relatedMissionIds.includes(missionId)));

  return (
    <WidgetFrame title="מפה מבצעית" sourceLabel="GIS · סכמטי" lastUpdated="2026-07-22T06:00:00"
      footerRight={<span className="small muted">כל סימון מוביל להחלטה — לחיצה פותחת את הקשר המבצע</span>}>
      <svg viewBox="0 0 100 66" style={{ width: '100%', height: 230, borderRadius: 10, background: 'linear-gradient(135deg,#eef3fa,#e9f5f2)', border: '1px solid var(--line)' }}>
        {/* schematic sector grid */}
        {[16.5, 33, 49.5].map(y => <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#d9e4f0" strokeWidth="0.3" />)}
        {[25, 50, 75].map(x => <line key={x} x1={x} y1="0" x2={x} y2="66" stroke="#d9e4f0" strokeWidth="0.3" />)}

        {/* missions — circle colored by live risk */}
        {shownMissions.map(m => (
          <g key={m.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/portfolio/${m.id}`)}>
            <title>{`מבצע ${m.name} · מוכנות ${m.readiness}% · ${m.riskLevel === 'high' ? 'סיכון גבוה' : m.riskLevel === 'medium' ? 'סיכון בינוני' : 'סיכון נמוך'}`}</title>
            <circle cx={m.coord!.x} cy={m.coord!.y} r="3.4" fill={RISK_COLOR[m.riskLevel]} stroke="#fff" strokeWidth="0.7" />
            <text x={m.coord!.x} y={m.coord!.y - 4.6} textAnchor="middle" fontSize="3.1" fontWeight="700" fill="var(--ink-soft)">{m.name}</text>
          </g>
        ))}

        {/* decision events — diamond colored by severity, pulse ring when critical */}
        {shownEvents.map(e => {
          const to = e.impact?.missionId ?? e.relatedMissionIds[0];
          return (
            <g key={e.id} style={{ cursor: 'pointer' }} onClick={() => to ? navigate(`/portfolio/${to}`) : navigate('/me')}>
              <title>{`אירוע: ${e.title}${e.locationLabel ? ` · ${e.locationLabel}` : ''}`}</title>
              {e.severity === 'critical' && <circle cx={e.coord!.x} cy={e.coord!.y} r="4.4" fill="none" stroke={SEV_COLOR[e.severity]} strokeWidth="0.5" opacity="0.6" />}
              <rect x={e.coord!.x - 2.2} y={e.coord!.y - 2.2} width="4.4" height="4.4" transform={`rotate(45 ${e.coord!.x} ${e.coord!.y})`} fill={SEV_COLOR[e.severity]} stroke="#fff" strokeWidth="0.6" />
              <text x={e.coord!.x} y={e.coord!.y + 6.4} textAnchor="middle" fontSize="2.7" fontWeight="700" fill="var(--red)">אירוע</text>
            </g>
          );
        })}
      </svg>
      <div className="flex gap-10 mt-8" style={{ flexWrap: 'wrap', fontSize: 12 }}>
        <span className="flex gap-6" style={{ alignItems: 'center' }}><span style={{ width: 10, height: 10, borderRadius: 999, background: 'var(--green)' }} /> מבצע · סיכון נמוך</span>
        <span className="flex gap-6" style={{ alignItems: 'center' }}><span style={{ width: 10, height: 10, borderRadius: 999, background: 'var(--amber)' }} /> בינוני</span>
        <span className="flex gap-6" style={{ alignItems: 'center' }}><span style={{ width: 10, height: 10, borderRadius: 999, background: 'var(--red)' }} /> גבוה</span>
        <span className="flex gap-6" style={{ alignItems: 'center' }}><span style={{ width: 9, height: 9, background: 'var(--red)', transform: 'rotate(45deg)' }} /> אירוע דורש החלטה</span>
      </div>
    </WidgetFrame>
  );
}
