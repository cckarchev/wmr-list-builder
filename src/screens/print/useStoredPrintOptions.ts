import { useEffect, useState } from 'react';
import { loadPrintOptions, savePrintOptions } from '@/core/persistence/printOptions';
import type { PrintOptions } from '@/core/print/printOptions';

/** The print options, starting from the last ones used and saved on every change. */
export const useStoredPrintOptions = () => {
  const [options, setOptions] = useState<PrintOptions>(loadPrintOptions);

  useEffect(() => {
    savePrintOptions(options);
  }, [options]);

  const toggleOption = (key: keyof PrintOptions) => {
    setOptions((previous) => ({ ...previous, [key]: !previous[key] }));
  };

  return { options, toggleOption };
};
