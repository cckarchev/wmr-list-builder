import { Link } from 'react-router-dom';
import { useArmyStore } from '../../store/useArmyStore';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import CopyListButton from './CopyListButton';
import CopyShareLinkButton from './CopyShareLinkButton';
import ResetListButton from './ResetListButton';
import SaveListButton from './SaveListButton';
import LoadListButton from './LoadListButton';
import OverflowMenu, { MenuDivider } from './OverflowMenu';

// The list-management controls shared by the header's inline (desktop) and
// menu (mobile) layouts. Save/Load sit directly in the bar; the rest live under
// the More overflow menu. Rendered once per layout so each gets its own menu.
export default function ListActions() {
  const armyId = useArmyStore((s) => s.armyId);

  return (
    <>
      <SaveListButton />
      <LoadListButton />
      <OverflowMenu>
        <CopyShareLinkButton />
        <CopyListButton />
        {armyId && (
          <Button as={Link} to={`/print/${armyId}`} $variant="ghost" $size="sm">
            <Icon name="print" size={16} />
            Print
          </Button>
        )}
        <MenuDivider />
        <ResetListButton />
      </OverflowMenu>
    </>
  );
}
