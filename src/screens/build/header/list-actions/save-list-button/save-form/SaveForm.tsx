import { type KeyboardEvent, useEffect, useRef } from 'react';
import { Button } from '@/components/button/Button';
import styles from './SaveForm.module.css';

const NAME_INPUT_ID = 'save-list-name';

interface SaveFormProps {
  name: string;
  error: string | null;
  onNameChange: (name: string) => void;
  onSave: () => void;
}

/** Name field and submit button shown inside the Save panel. */
export const SaveForm = ({ name, error, onNameChange, onSave }: SaveFormProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const saveOnEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onSave();
    }
  };

  return (
    <div className={styles.body}>
      <label className={styles.label} htmlFor={NAME_INPUT_ID}>
        List name
      </label>
      <input
        className={styles.input}
        ref={inputRef}
        id={NAME_INPUT_ID}
        value={name}
        onChange={(event) => onNameChange(event.target.value)}
        onKeyDown={saveOnEnter}
      />
      {error && (
        <p className={styles.note} role="alert">
          {error}
        </p>
      )}
      <Button variant="primary" size="sm" onClick={onSave}>
        Save list
      </Button>
    </div>
  );
};
