import { type Dispatch, type SetStateAction, useEffect, useState } from 'react';

/**
 * State that starts from what `load` finds and is handed to `save` on every
 * change, so it carries over to the next visit. Pass module-level functions,
 * since a new `save` on every render would save on every render too.
 */
export const useStoredState = <T>(
  load: () => T,
  save: (value: T) => void,
): [T, Dispatch<SetStateAction<T>>] => {
  const [value, setValue] = useState<T>(load);

  useEffect(() => {
    save(value);
  }, [value, save]);

  return [value, setValue];
};
