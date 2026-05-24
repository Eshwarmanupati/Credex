import { create } from 'zustand';
import type { ToolId, ToolEntry, UseCase, AuditResult } from '@/types';

interface AuditFormState {
  selectedTools: ToolId[];
  toolEntries: ToolEntry[];
  currentStep: number;
  result: AuditResult | null;
  aiSummary: string | null;
  shareSlug: string | null;
  isLoading: boolean;
  error: string | null;

  setSelectedTools: (tools: ToolId[]) => void;
  toggleTool: (toolId: ToolId) => void;
  setToolEntries: (entries: ToolEntry[]) => void;
  updateToolEntry: (index: number, entry: Partial<ToolEntry>) => void;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setResult: (result: AuditResult, aiSummary: string, shareSlug: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  selectedTools: [] as ToolId[],
  toolEntries: [] as ToolEntry[],
  currentStep: 0,
  result: null,
  aiSummary: null,
  shareSlug: null,
  isLoading: false,
  error: null,
};

export const useAuditStore = create<AuditFormState>((set) => ({
  ...initialState,

  setSelectedTools: (tools) => set({ selectedTools: tools }),

  toggleTool: (toolId) =>
    set((state) => {
      const exists = state.selectedTools.includes(toolId);
      const selectedTools = exists
        ? state.selectedTools.filter((t) => t !== toolId)
        : [...state.selectedTools, toolId];

      const toolEntries = selectedTools.map((id) => {
        const existing = state.toolEntries.find((e) => e.toolId === id);
        return (
          existing || {
            toolId: id,
            planId: '',
            seats: 1,
            monthlySpend: 0,
            useCase: 'general' as UseCase,
          }
        );
      });

      return { selectedTools, toolEntries };
    }),

  setToolEntries: (entries) => set({ toolEntries: entries }),

  updateToolEntry: (index, partial) =>
    set((state) => {
      const toolEntries = [...state.toolEntries];
      toolEntries[index] = { ...toolEntries[index], ...partial };
      return { toolEntries };
    }),

  setCurrentStep: (step) => set({ currentStep: step }),
  nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
  prevStep: () => set((state) => ({ currentStep: Math.max(0, state.currentStep - 1) })),

  setResult: (result, aiSummary, shareSlug) =>
    set({ result, aiSummary, shareSlug, isLoading: false, error: null }),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),

  reset: () => set(initialState),
}));
