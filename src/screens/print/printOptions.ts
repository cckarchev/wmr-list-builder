import { createContext, useContext } from 'react';
import { DEFAULT_PRINT_OPTIONS, type PrintOptions } from '@/core/print/printOptions';

export const PrintOptionsContext = createContext<PrintOptions>(DEFAULT_PRINT_OPTIONS);

export const usePrintOptions = (): PrintOptions => useContext(PrintOptionsContext);
