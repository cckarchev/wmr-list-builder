import { ChevronMark } from '@/components/chevron-mark/ChevronMark';
import { PillButton } from '@/components/pill-button/PillButton';
import styles from './UpgradesToggle.module.css';

const CARET_SIZE = 11;

interface UpgradesToggleProps {
  open: boolean;
  panelId: string;
  /** How many upgrades are taken, shown after the label when non-zero. */
  selectedCount: number;
  onToggle: () => void;
}

/** Pill button that shows or hides a unit card's upgrades panel. */
export const UpgradesToggle = ({ open, panelId, selectedCount, onToggle }: UpgradesToggleProps) => (
  <PillButton aria-expanded={open} aria-controls={panelId} onClick={onToggle}>
    <span className={styles.caret} data-open={open || undefined}>
      <ChevronMark size={CARET_SIZE} color="currentColor" />
    </span>
    Upgrades
    {selectedCount > 0 && <span className={styles.selectedBadge}>({selectedCount})</span>}
  </PillButton>
);
