import { useSearchParams } from 'react-router-dom';

import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { useArmyStore } from '../../store/useArmyStore';

export default function ResetListButton() {
  const armyId = useArmyStore((s) => s.armyId);
  const setArmy = useArmyStore((s) => s.setArmy);
  const [searchParams, setSearchParams] = useSearchParams();

  const handleReset = () => {
    if (!armyId) return;
    if (!window.confirm('Reset this army? All units and upgrades will be cleared.')) return;
    // Re-initialize the current army back to its default empty state, keeping
    // the same faction selected. The Build screen's auto-save persists this.
    setArmy(armyId);
    // Drop the shared ?list= blob so a reload (or a re-share) starts from the
    // reset roster instead of re-applying the old link.
    if (searchParams.has('list')) {
      const next = new URLSearchParams(searchParams);
      next.delete('list');
      setSearchParams(next, { replace: true });
    }
  };

  return (
    <Button $variant="ghost" $size="sm" onClick={handleReset} disabled={!armyId} title="Reset army">
      <Icon name="reset" size={16} />
      Reset
    </Button>
  );
}
