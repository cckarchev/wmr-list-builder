import { errorMessages } from '@/core/validation/errorTargets';
import { useArmyStore } from '@/store/useArmyStore';
import { PrintHeading, PrintSection } from '../print-section/PrintSection';
import styles from './Validation.module.css';

const issueCount = (count: number): string => {
  const plural = count === 1 ? '' : 's';

  return `${count} issue${plural}`;
};

/** Whether the list is legal at its game size, and what is wrong when it is not. */
export const Validation = () => {
  const errors = useArmyStore((s) => s.errors);
  const gameSize = useArmyStore((s) => s.gameSize);

  const messages = errorMessages(errors);
  const points = `${gameSize.toLocaleString('en-US')} points`;

  if (messages.length === 0) {
    return (
      <PrintSection>
        <PrintHeading>Validation</PrintHeading>
        <p className={styles.summary}>The list is valid at {points}.</p>
      </PrintSection>
    );
  }

  return (
    <PrintSection>
      <PrintHeading>Validation</PrintHeading>
      <p className={styles.summary}>
        {issueCount(messages.length)} at {points}:
      </p>
      <ul className={styles.issues}>
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </PrintSection>
  );
};
