import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/button/Button';
import { ConfirmDialog } from '@/components/confirm-dialog/ConfirmDialog';
import { Icon } from '@/components/Icon';
import { LIST_PARAM } from '@/core/shareLink';
import { useArmyStore } from '@/store/useArmyStore';

export const ResetListButton = () => {
  const armyId = useArmyStore((s) => s.armyId);
  const setArmy = useArmyStore((s) => s.setArmy);
  const [searchParams, setSearchParams] = useSearchParams();
  const [confirming, setConfirming] = useState(false);

  const handleReset = () => {
    setConfirming(false);

    if (!armyId) {
      return;
    }

    // Re-initialize the current army back to its default empty state, keeping
    // the same faction selected. The Build screen's auto-save persists this.
    setArmy(armyId);

    // Drop the shared ?list= blob so a reload (or a re-share) starts from the
    // reset roster instead of re-applying the old link.
    if (searchParams.has(LIST_PARAM)) {
      const next = new URLSearchParams(searchParams);

      next.delete(LIST_PARAM);

      setSearchParams(next, { replace: true });
    }
  };

  return (
    <>
      <Button
        variant="danger"
        size="sm"
        onClick={() => setConfirming(true)}
        disabled={!armyId}
        title="Reset army"
      >
        <Icon name="reset" />
        Reset
      </Button>
      <ConfirmDialog
        open={confirming}
        title="Reset army?"
        message="All units and upgrades will be cleared."
        confirmLabel="Reset"
        onConfirm={handleReset}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
};
