import { type KeyboardEvent, useEffect, useId, useRef } from "react";
import { Button } from "@/components/button/Button";
import styles from "./SaveForm.module.css";

interface SaveFormProps {
  name: string;
  error: string | null;
  onNameChange: (name: string) => void;
  onSave: () => void;
}

/** Name field and submit button shown inside the Save panel. */
export const SaveForm = ({
  name,
  error,
  onNameChange,
  onSave,
}: SaveFormProps) => {
  // Unique per instance: the inline and the mobile actions each mount a form.
  const nameInputId = useId();
  const storageNoteId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const saveOnEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      onSave();
    }
  };

  return (
    <div className={styles.body}>
      <label className={styles.label} htmlFor={nameInputId}>
        List name
      </label>
      <div className={styles.row}>
        <input
          className={styles.input}
          ref={inputRef}
          id={nameInputId}
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          onKeyDown={saveOnEnter}
          aria-describedby={storageNoteId}
        />
        <Button variant="primary" size="sm" onClick={onSave}>
          Save list
        </Button>
      </div>
      {error && (
        <p className={styles.note} role="alert">
          {error}
        </p>
      )}
      <p className={styles.storageNote} id={storageNoteId}>
        Lists are kept only in this browser. Clearing its site data deletes
        them, so use Share to keep a link to a list.
      </p>
    </div>
  );
};
