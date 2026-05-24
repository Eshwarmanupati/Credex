'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuditStore } from '@/store/audit-store';
import { useRouter } from 'next/navigation';
import { getAllTools, TOOLS } from '@/lib/pricing-data';
import type { UseCase } from '@/types';
import { ToolIcon } from '@/components/ui/tool-icon';
import { UseCaseIcon } from '@/components/ui/usecase-icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const allTools = getAllTools();

const useCaseOptions: { value: UseCase; label: string }[] = [
  { value: 'coding', label: 'Coding' },
  { value: 'writing', label: 'Writing' },
  { value: 'research', label: 'Research' },
  { value: 'data_analysis', label: 'Data Analysis' },
  { value: 'customer_support', label: 'Support' },
  { value: 'general', label: 'General' },
];

const stepVariants = {
  enter: { opacity: 0, x: 30 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
};

export default function AuditPage() {
  const router = useRouter();
  const {
    selectedTools, toggleTool, toolEntries, updateToolEntry,
    currentStep, nextStep, prevStep, setResult, setLoading, setError, error,
  } = useAuditStore();

  const [submitting, setSubmitting] = useState(false);

  const canProceedStep1 = selectedTools.length > 0;
  const canProceedStep2 = toolEntries.every(
    (e) => e.planId && e.seats >= 1 && e.monthlySpend >= 0
  );

  async function handleSubmit() {
    setSubmitting(true);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tools: toolEntries }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Audit failed');
      }

      const data = await res.json();
      setResult(data.result, data.aiSummary, data.shareSlug);
      
      try {
        const localRecord = {
          id: `local_${data.shareSlug}`,
          shareSlug: data.shareSlug,
          toolsInput: toolEntries,
          totalCurrent: data.result.totalCurrentSpend,
          totalOptimized: data.result.totalOptimizedSpend,
          savingsAmount: data.result.totalMonthlySavings,
          savingsPct: data.result.savingsPercentage,
          recommendations: data.result.recommendations,
          aiSummary: data.aiSummary,
          healthScore: data.result.healthScore,
          leadId: null,
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem(`trim_audit_${data.shareSlug}`, JSON.stringify(localRecord));
      } catch (e) {
        console.error('Failed to write to localStorage:', e);
      }

      router.push(`/report/${data.shareSlug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setSubmitting(false);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-2 mb-8">
          {['Select Tools', 'Configure', 'Review'].map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                i <= currentStep
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {i + 1}
              </div>
              <span className={`text-sm hidden sm:block ${i <= currentStep ? 'text-foreground' : 'text-muted-foreground'}`}>
                {label}
              </span>
              {i < 2 && <div className={`flex-1 h-px ${i < currentStep ? 'bg-primary' : 'bg-border'}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <motion.div key="step1" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }}>
              <h2 className="text-2xl font-bold mb-2">Which AI tools does your team use?</h2>
              <p className="text-muted-foreground mb-6">Select all that apply. Include anything you pay for.</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {allTools.map((tool) => {
                  const selected = selectedTools.includes(tool.id);
                  return (
                    <button
                      key={tool.id}
                      onClick={() => toggleTool(tool.id)}
                      className={`p-4 rounded-xl border text-left transition-all hover:scale-[1.02] ${
                        selected
                          ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
                          : 'border-border bg-card hover:border-primary/40'
                      }`}
                    >
                      <div className="mb-2 text-muted-foreground group-hover:text-primary">
                        <ToolIcon toolId={tool.id} className="w-6 h-6" />
                      </div>
                      <div className="font-medium text-sm">{tool.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{tool.category.toUpperCase()}</div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={nextStep}
                  disabled={!canProceedStep1}
                  className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-40 transition-opacity hover:opacity-90"
                >
                  Continue →
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 1 && (
            <motion.div key="step2" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }}>
              <h2 className="text-2xl font-bold mb-2">Configure your tools</h2>
              <p className="text-muted-foreground mb-6">Tell us your plan, team size, and monthly spend for each.</p>

              <div className="space-y-4">
                {toolEntries.map((entry, i) => {
                  const toolMeta = TOOLS[entry.toolId];
                  return (
                    <div key={entry.toolId} className="p-4 rounded-xl border border-border bg-card space-y-3">
                      <div className="flex items-center gap-2">
                        <ToolIcon toolId={entry.toolId} className="w-5 h-5 text-muted-foreground" />
                        <h3 className="font-semibold">{toolMeta.name}</h3>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <label htmlFor={`plan-${entry.toolId}`} className="text-xs text-muted-foreground mb-1 block">Plan</label>
                          <Select
                            value={entry.planId}
                            onValueChange={(val) => {
                              const plan = toolMeta.plans.find((p) => p.planId === val);
                              const pricePerSeat = plan ? plan.pricePerSeat : 0;
                              updateToolEntry(i, {
                                planId: val ?? undefined,
                                monthlySpend: pricePerSeat * entry.seats
                              });
                            }}
                          >
                            <SelectTrigger id={`plan-${entry.toolId}`} className="w-full flex h-9">
                              <SelectValue placeholder="Select plan" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border border-border text-popover-foreground rounded-lg shadow-lg py-1">
                              {toolMeta.plans.map((p) => (
                                <SelectItem
                                  key={p.planId}
                                  value={p.planId}
                                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-md m-1"
                                >
                                  <span>{p.planName} {p.pricePerSeat > 0 ? `($${p.pricePerSeat}/seat)` : ''}</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label htmlFor={`seats-${entry.toolId}`} className="text-xs text-muted-foreground mb-1 block">Seats</label>
                          <input
                            id={`seats-${entry.toolId}`}
                            type="number"
                            min={1}
                            max={10000}
                            value={entry.seats}
                            onChange={(e) => {
                              const newSeats = Math.max(1, parseInt(e.target.value) || 1);
                              const plan = toolMeta.plans.find((p) => p.planId === entry.planId);
                              const pricePerSeat = plan ? plan.pricePerSeat : 0;
                              updateToolEntry(i, {
                                seats: newSeats,
                                monthlySpend: pricePerSeat * newSeats
                              });
                            }}
                            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm h-9"
                          />
                        </div>

                        <div>
                          <label htmlFor={`spend-${entry.toolId}`} className="text-xs text-muted-foreground mb-1 block">$/month</label>
                          <input
                            id={`spend-${entry.toolId}`}
                            type="number"
                            min={0}
                            step={1}
                            value={entry.monthlySpend}
                            onChange={(e) => updateToolEntry(i, { monthlySpend: Math.max(0, parseFloat(e.target.value) || 0) })}
                            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm h-9"
                          />
                        </div>

                        <div>
                          <label htmlFor={`usecase-${entry.toolId}`} className="text-xs text-muted-foreground mb-1 block">Use Case</label>
                          <Select
                            value={entry.useCase}
                            onValueChange={(val) => { if (val) updateToolEntry(i, { useCase: val as UseCase }); }}
                          >
                            <SelectTrigger id={`usecase-${entry.toolId}`} className="w-full flex h-9">
                              <SelectValue placeholder="Select usecase" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border border-border text-popover-foreground rounded-lg shadow-lg py-1">
                              {useCaseOptions.map((uc) => (
                                <SelectItem
                                  key={uc.value}
                                  value={uc.value}
                                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-md m-1"
                                >
                                  <UseCaseIcon useCase={uc.value} className="w-4 h-4 text-muted-foreground shrink-0" />
                                  <span>{uc.label}</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex justify-between">
                <button onClick={prevStep} className="px-6 py-2.5 rounded-lg border border-border text-sm hover:bg-muted transition-colors">
                  ← Back
                </button>
                <button
                  onClick={nextStep}
                  disabled={!canProceedStep2}
                  className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-40 transition-opacity hover:opacity-90"
                >
                  Review →
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div key="step3" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }}>
              <h2 className="text-2xl font-bold mb-2">Review your AI stack</h2>
              <p className="text-muted-foreground mb-6">
                Total monthly spend: <span className="text-foreground font-semibold">
                  ${toolEntries.reduce((s, e) => s + e.monthlySpend, 0).toLocaleString()}
                </span> across {toolEntries.length} tool(s)
              </p>

              <div className="space-y-2">
                {toolEntries.map((entry) => {
                  const toolMeta = TOOLS[entry.toolId];
                  const plan = toolMeta.plans.find((p) => p.planId === entry.planId);
                  return (
                    <div key={entry.toolId} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                      <div className="flex items-center gap-3">
                        <ToolIcon toolId={entry.toolId} className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium text-sm">{toolMeta.name}</div>
                          <div className="text-xs text-muted-foreground">{plan?.planName || entry.planId} · {entry.seats} seat(s)</div>
                        </div>
                      </div>
                      <div className="font-semibold">${entry.monthlySpend}/mo</div>
                    </div>
                  );
                })}
              </div>

              {error && (
                <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                  {error}
                </div>
              )}

              <div className="mt-8 flex justify-between">
                <button onClick={prevStep} className="px-6 py-2.5 rounded-lg border border-border text-sm hover:bg-muted transition-colors">
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-60 transition-all hover:opacity-90 glow-primary"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Analyzing...
                    </span>
                  ) : 'Run Audit →'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
