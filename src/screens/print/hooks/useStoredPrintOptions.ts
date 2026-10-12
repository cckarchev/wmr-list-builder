import { loadPrintOptions, savePrintOptions } from '@/core/persistence/printOptions';
import type { PrintOptions } from '@/core/print/printOptions';
import { useStoredState } from '@/hooks/useStoredState';

/** The print options, starting from the last ones used and saved on every change. */
export const useStoredPrintOptions = () => {
  const [options, setOptions] = useStoredState(loadPrintOptions, savePrintOptions);

  const toggleOption = (key: keyof PrintOptions) => {
    setOptions((previous) => ({ ...previous, [key]: !previous[key] }));
  };

  return { options, toggleOption };
};
