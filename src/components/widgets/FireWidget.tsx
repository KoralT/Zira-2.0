import { useNavigate } from 'react-router-dom';
import { fireForMission } from '../../data';
import { StatusChip } from '../common/StatusChip';
import { WidgetFrame } from '../common/WidgetFrame';

// תמונת אש ותקיפה — קורא מהדומיין החי. קליק על פריט שקשור למבצע פותח את המבצע.
export function FireWidget({ missionId }: { missionId?: string }) {
  const navigate = useNavigate();
  const items = fireForMission(missionId);

  // Group by category for the "5 rows" fire picture.
  const categories = Array.from(new Set(items.map(i => i.categoryLabel)));

  return (
    <WidgetFrame title="תמונת אש ותקיפה" sourceLabel="מערכת אש" lastUpdated="2026-07-22T07:10:00" expandTo="/portfolio"
      state={items.length === 0 ? 'empty' : 'ok'} emptyText="אין פעילות אש בהקשר הנבחר.">
      {categories.map(cat => {
        const catItems = items.filter(i => i.categoryLabel === cat);
        return (
          <div key={cat} className="mini-row" style={{ cursor: catItems[0].relatedMissionId ? 'pointer' : 'default' }}
            onClick={() => catItems[0].relatedMissionId && navigate(`/portfolio/${catItems[0].relatedMissionId}`)}>
            <div>
              <div className="r-title">{cat}</div>
              <div className="r-sub">{catItems.map(i => i.title).join(' · ')}</div>
            </div>
            <StatusChip label={String(catItems.length)} tone={catItems.some(i => i.statusTone === 'red') ? 'red' : catItems.some(i => i.statusTone === 'amber') ? 'amber' : 'green'} dot={false} />
          </div>
        );
      })}
    </WidgetFrame>
  );
}
