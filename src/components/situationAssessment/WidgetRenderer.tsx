import type { Directive, WidgetInstance } from '../../data/types';
import { OperationalMapWidget } from '../widgets/OperationalMapWidget';
import { MissionPortfolioWidget } from '../widgets/MissionPortfolioWidget';
import { ReadinessWidget } from '../widgets/ReadinessWidget';
import { ResourceStatusWidget } from '../widgets/ResourceStatusWidget';
import { OperationalTimelineWidget } from '../widgets/OperationalTimelineWidget';
import { DirectiveWidget } from '../widgets/DirectiveWidget';
import { ImpactWidget } from '../widgets/ImpactWidget';
import { ApprovalWidget } from '../widgets/ApprovalWidget';
import { RiskWidget } from '../widgets/RiskWidget';
import { MissingInformationWidget } from '../widgets/MissingInformationWidget';
import { EvidenceTrustWidget } from '../widgets/EvidenceTrustWidget';
import { DependenciesWidget } from '../widgets/DependenciesWidget';
import { EventsFeedWidget } from '../widgets/EventsFeedWidget';
import { GanttWidget } from '../widgets/GanttWidget';
import { BlockersWidget } from '../widgets/BlockersWidget';
import { DecisionsTodayWidget } from '../widgets/DecisionsTodayWidget';
import { FireWidget } from '../widgets/FireWidget';
import { MeansWidget } from '../widgets/MeansWidget';
import { getMission } from '../../data';
import { useStore } from '../../store/StoreContext';

function relevantDirectiveId(directives: Directive[], missionId?: string): string | undefined {
  if (missionId) {
    const related = directives.find(d => d.relatedMissionIds.includes(missionId) && d.status === 'published');
    if (related) return related.id;
  }
  return directives.find(d => d.status === 'published')?.id;
}

export function WidgetRenderer({ instance, scopeMissionId }: { instance: WidgetInstance; scopeMissionId?: string }) {
  const { directives } = useStore();
  const missionId = instance.filterMissionId ?? scopeMissionId;
  switch (instance.widgetKind) {
    case 'operational-map': return <OperationalMapWidget missionId={missionId} />;
    case 'mission-status': return <MissionPortfolioWidget missionId={missionId} />;
    case 'readiness': return missionId ? <ReadinessWidget missionId={missionId} /> : null;
    case 'resource-status': return <ResourceStatusWidget missionId={missionId} />;
    case 'timeline': return <OperationalTimelineWidget entity={missionId ? { type: 'mission', id: missionId, label: getMission(missionId)?.name ?? missionId } : undefined} />;
    case 'directive': { const id = relevantDirectiveId(directives, missionId); return id ? <DirectiveWidget directiveId={id} /> : null; }
    case 'approval': return <ApprovalWidget missionId={missionId} />;
    case 'risk': return <RiskWidget missionId={missionId} />;
    case 'missing-information': return <MissingInformationWidget missionId={missionId} />;
    case 'evidence-trust': return <EvidenceTrustWidget missionId={missionId} />;
    case 'dependencies': return missionId ? <DependenciesWidget missionId={missionId} /> : null;
    case 'events-feed': return <EventsFeedWidget />;
    case 'impact': { const id = relevantDirectiveId(directives, missionId); return id ? <ImpactWidget directiveId={id} /> : null; }
    case 'gantt': return <GanttWidget missionId={missionId} />;
    case 'blockers': return <BlockersWidget missionId={missionId} />;
    case 'decisions-today': return <DecisionsTodayWidget missionId={missionId} />;
    case 'fire': return <FireWidget missionId={missionId} />;
    case 'means': return <MeansWidget missionId={missionId} />;
    default: return null;
  }
}
