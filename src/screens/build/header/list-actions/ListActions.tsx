import { ButtonLink } from '@/components/button/Button';
import { Icon } from '@/components/Icon';
import { useArmyStore } from '@/store/useArmyStore';
import { CopyListButton } from './copy-list-button/CopyListButton';
import { CopyShareLinkButton } from './copy-share-link-button/CopyShareLinkButton';
import { LoadListButton } from './load-list-button/LoadListButton';
import { MenuDivider, OverflowMenu } from './overflow-menu/OverflowMenu';
import { ResetListButton } from './reset-list-button/ResetListButton';
import { SaveListButton } from './save-list-button/SaveListButton';

// The list-management controls shared by the header's inline (desktop) and
// menu (mobile) layouts. Save/Load sit directly in the bar; the rest live under
// the More overflow menu. Rendered once per layout so each gets its own menu.
export const ListActions = () => {
  const armyId = useArmyStore((s) => s.armyId);

  return (
    <>
      <SaveListButton />
      <LoadListButton />
      <OverflowMenu>
        <CopyShareLinkButton />
        <CopyListButton />
        {armyId && (
          <ButtonLink to={`/print/${armyId}`} variant="ghost" size="sm">
            <Icon name="print" size={16} />
            Print
          </ButtonLink>
        )}
        <MenuDivider />
        <ResetListButton />
      </OverflowMenu>
    </>
  );
};
