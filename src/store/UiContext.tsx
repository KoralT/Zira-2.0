import { createContext, useContext, useState, type ReactNode } from 'react';

interface UiApi {
  evidenceDrawerId: string | null;
  openEvidenceDrawer: (id: string) => void;
  closeEvidenceDrawer: () => void;
  contextDrawerAlertId: string | null;
  openContextDrawer: (alertId: string) => void;
  closeContextDrawer: () => void;
}

const UiContext = createContext<UiApi | null>(null);

export function UiProvider({ children }: { children: ReactNode }) {
  const [evidenceDrawerId, setEvidenceDrawerId] = useState<string | null>(null);
  const [contextDrawerAlertId, setContextDrawerAlertId] = useState<string | null>(null);

  const value: UiApi = {
    evidenceDrawerId,
    openEvidenceDrawer: (id) => setEvidenceDrawerId(id),
    closeEvidenceDrawer: () => setEvidenceDrawerId(null),
    contextDrawerAlertId,
    openContextDrawer: (alertId) => setContextDrawerAlertId(alertId),
    closeContextDrawer: () => setContextDrawerAlertId(null),
  };

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi() {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error('useUi must be used within UiProvider');
  return ctx;
}
