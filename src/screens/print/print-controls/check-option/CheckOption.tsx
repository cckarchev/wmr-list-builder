import styles from "./CheckOption.module.css";

interface CheckOptionProps {
  label: string;
  checked: boolean;
  onToggle: () => void;
}

/** A single labeled checkbox in the print controls. */
export const CheckOption = ({ label, checked, onToggle }: CheckOptionProps) => (
  <label className={styles.option}>
    <input
      className={styles.input}
      type="checkbox"
      checked={checked}
      onChange={onToggle}
    />
    {label}
  </label>
);
