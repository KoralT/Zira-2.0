import { createContext, useContext, useState, type ReactNode } from 'react';

export type TimeWindow = '24h' | '7d' | '30d';
export type SectorFilter = 'all' | 'צפון' | 'מזרח' | 'מרכז' | 'דרום';

interface FiltersApi {
  timeWindow: TimeWindow;
  setTimeWindow: (w: TimeWindow) => void;
  sector: SectorFilter;
  setSector: (s: SectorFilter) => void;
}

const FiltersContext = createContext<FiltersApi | null>(null);

export function FiltersProvider({ children }: { children: ReactNode }) {
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('24h');
  const [sector, setSector] = useState<SectorFilter>('all');
  return (
    <FiltersContext.Provider value={{ timeWindow, setTimeWindow, sector, setSector }}>
      {children}
    </FiltersContext.Provider>
  );
}

export function useFilters() {
  const ctx = useContext(FiltersContext);
  if (!ctx) throw new Error('useFilters must be used within FiltersProvider');
  return ctx;
}
