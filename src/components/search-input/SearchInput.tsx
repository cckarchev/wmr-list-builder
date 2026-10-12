import type { ChangeEvent } from 'react';
import styles from './SearchInput.module.css';

interface SearchInputProps {
  /** Accessible name, also shown as the placeholder. */
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export const SearchInput = ({ label, value, onChange }: SearchInputProps) => {
  const placeholder = `${label}…`;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <input
      className={styles.search}
      type="search"
      placeholder={placeholder}
      aria-label={label}
      value={value}
      onChange={handleChange}
    />
  );
};
