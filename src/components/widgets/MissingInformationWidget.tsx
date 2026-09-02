import { useStore } from '../../store/StoreContext';
import { useUi } from '../../store/UiContext';
import { WidgetFrame } from '../common/WidgetFrame';
import { confidenceMeta } from '../../lib/meta';
import { StatusChip } from '../common/StatusChip';

export function MissingInformationWidget({ missionId }: { missionId?: string }) {
  const { evidence } = useStore();
  const { openEvidenceDrawer } = useUi();
  let list = evidence.filter(e => e.missingInfo.length > 0 || e.hasContradiction);
  if (missionId) list = list.filter(e => e.relatedEntityIds.includes(missionId));

  return (
    <WidgetFrame title="תוצרים חסרים" sourceLabel="Sigma Context Platform" expandTo="/trust"
      state={list.length === 0 ? 'empty' : 'ok'} emptyText="אין פערי מידע פתוחים.">
      {list.map(e => (
        <div className="mini-row" key={e.id} style={{ cursor: 'pointer' }} onClick={() => openEvidenceDrawer(e.id)}>
          <div>
            <div className="r-title">{e.sourceSystem}</div>
            <div className="r-sub">{e.hasContradiction ? 'סתירה בין מקורות' : e.missingInfo[0]}</div>
          </div>
          <StatusChip label={confidenceMeta[e.confidence].label} tone={confidenceMeta[e.confidence].tone} />
        </div>
      ))}
    </WidgetFrame>
  );
}
