import { type KeyboardEvent, useEffect, useId, useRef } from 'react';
import { Button } from '@/components/button/Button';
import styles from './SaveForm.module.css';

interface SaveFormProps {
  name: string;
  error: string | null;
  onNameChange: (name: string) => void;
  onSave: () => void;
}

/** Name field and submit button shown inside the Save panel. */
export const SaveForm = ({ name, error, onNameChange, onSave }: SaveFormProps) => {
  // Unique per instance: the inline and the mobile actions each mount a form.
  const nameInputId = useId();
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
      <label className={styles.label} htmlFor={nameInputId}>
        List name
      </label>
      <input
        className={styles.input}
        ref={inputRef}
        id={nameInputId}
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
