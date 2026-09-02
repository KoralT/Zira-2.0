import { getUser } from '../../data';
import { useStore } from '../../store/StoreContext';
import { useUi } from '../../store/UiContext';
import { confidenceMeta } from '../../lib/meta';
import { StatusChip } from '../common/StatusChip';
import { WidgetFrame } from '../common/WidgetFrame';
import { formatRelative } from '../../lib/format';

export function EvidenceTrustWidget({ missionId }: { missionId?: string }) {
  const { evidence } = useStore();
  const { openEvidenceDrawer } = useUi();
  const list = missionId ? evidence.filter(e => e.relatedEntityIds.includes(missionId)) : evidence;

  return (
    <WidgetFrame title="Evidence & Trust" sourceLabel="Sigma Context Platform" expandTo="/trust" state={list.length === 0 ? 'empty' : 'ok'}>
      {list.map(e => (
        <div className="mini-row" key={e.id} style={{ cursor: 'pointer' }} onClick={() => openEvidenceDrawer(e.id)}>
          <div>
            <div className="r-title">{e.sourceSystem}</div>
            <div className="r-sub">{getUser(e.ownerUserId)?.name} · עודכן {formatRelative(e.lastUpdated)}</div>
          </div>
          <StatusChip label={confidenceMeta[e.confidence].label} tone={confidenceMeta[e.confidence].tone} />
        </div>
      ))}
    </WidgetFrame>
  );
}
