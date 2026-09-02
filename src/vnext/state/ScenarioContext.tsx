import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

// Commander Space vNext — Prototype 01 · scenario / continuity state.
// Deliberately tiny: it exists only to demonstrate the approved states (follow-up after action,
// next-visit continuity, honest empty state). It is NOT a product state model. Persisted to
// localStorage so a reviewer's interaction survives a reload; safe to clear.

const KEY = 'sigma-vnext-01';

export type Visit = 'first' | 'next';

export interface ScenarioState {
  visit: Visit;
  reassessedAt: string | null;      // ISO when reassessment was initiated on the flagship
  approvalDecision: 'approved' | 'rejected' | null;
  acknowledged: string[];           // ids of acknowledged awareness items
  forceEmpty: boolean;              // scaffold-only: jump to the "nothing requires you" state
}

const DEFAULT: ScenarioState = {
  visit: 'first',
  reassessedAt: null,
  approvalDecision: null,
  acknowledged: [],
  forceEmpty: false,
};

function load(): ScenarioState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULT, ...JSON.parse(raw) };
  } catch { /* ignore — a prototype convenience only */ }
  return DEFAULT;
}

interface ScenarioApi extends ScenarioState {
  initiateReassessment: () => void;
  decideApproval: (d: 'approved' | 'rejected') => void;
  acknowledge: (id: string) => void;
  setVisit: (v: Visit) => void;
  setForceEmpty: (v: boolean) => void;
  reset: () => void;
}

const Ctx = createContext<ScenarioApi | null>(null);

export function ScenarioProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ScenarioState>(load);

  const persist = useCallback((next: ScenarioState) => {
    setState(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
  }, []);

  const initiateReassessment = useCallback(
    () => persist({ ...load(), reassessedAt: new Date().toISOString(), forceEmpty: false }),
    [persist],
  );
  const decideApproval = useCallback(
    (d: 'approved' | 'rejected') => persist({ ...load(), approvalDecision: d }),
    [persist],
  );
  const acknowledge = useCallback(
    (id: string) => {
      const s = load();
      if (s.acknowledged.includes(id)) return;
      persist({ ...s, acknowledged: [...s.acknowledged, id] });
    },
    [persist],
  );
  const setVisit = useCallback((v: Visit) => persist({ ...load(), visit: v, forceEmpty: false }), [persist]);
  const setForceEmpty = useCallback((v: boolean) => persist({ ...load(), forceEmpty: v }), [persist]);
  const reset = useCallback(() => persist({ ...DEFAULT }), [persist]);

  return (
    <Ctx.Provider
      value={{ ...state, initiateReassessment, decideApproval, acknowledge, setVisit, setForceEmpty, reset }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useScenario(): ScenarioApi {
  const v = useContext(Ctx);
  if (!v) throw new Error('useScenario must be used within ScenarioProvider');
  return v;
}
