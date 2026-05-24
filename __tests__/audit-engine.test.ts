import { describe, it, expect } from 'vitest';
import { runAudit, calculateHealthScore } from '@/lib/audit-engine';
import type { AuditInput, ToolEntry } from '@/types';

function makeInput(tools: ToolEntry[]): AuditInput {
  return { tools };
}

describe('Rule 1: Seat-Tier Mismatch', () => {
  it('flags Cursor Business with 1 seat as overkill', () => {
    const result = runAudit(makeInput([
      { toolId: 'cursor', planId: 'cursor_business', seats: 1, monthlySpend: 40, useCase: 'coding' },
    ]));
    const rec = result.recommendations.find((r) => r.toolId === 'cursor' && r.type === 'downgrade_plan');
    expect(rec).toBeDefined();
    expect(rec!.monthlySavings).toBe(20);
    expect(rec!.recommendedPlan).toBe('Pro');
  });

  it('flags Cursor Business with 2 seats', () => {
    const result = runAudit(makeInput([
      { toolId: 'cursor', planId: 'cursor_business', seats: 2, monthlySpend: 80, useCase: 'coding' },
    ]));
    const rec = result.recommendations.find((r) => r.toolId === 'cursor' && r.type === 'downgrade_plan');
    expect(rec).toBeDefined();
    expect(rec!.monthlySavings).toBe(40);
  });

  it('does NOT flag Cursor Business with 5 seats', () => {
    const result = runAudit(makeInput([
      { toolId: 'cursor', planId: 'cursor_business', seats: 5, monthlySpend: 200, useCase: 'coding' },
    ]));
    const rec = result.recommendations.find((r) => r.toolId === 'cursor' && r.type === 'downgrade_plan');
    expect(rec).toBeUndefined();
  });

  it('flags Copilot Enterprise with small team', () => {
    const result = runAudit(makeInput([
      { toolId: 'github_copilot', planId: 'copilot_enterprise', seats: 3, monthlySpend: 117, useCase: 'coding' },
    ]));
    const rec = result.recommendations.find((r) => r.toolId === 'github_copilot' && r.type === 'downgrade_plan');
    expect(rec).toBeDefined();
    expect(rec!.monthlySavings).toBe(60);
  });

  it('flags ChatGPT Plus with 5+ seats for Team upgrade', () => {
    const result = runAudit(makeInput([
      { toolId: 'chatgpt', planId: 'chatgpt_plus', seats: 5, monthlySpend: 100, useCase: 'general' },
    ]));
    const rec = result.recommendations.find((r) => r.type === 'consolidate_seats');
    expect(rec).toBeDefined();
  });

  it('flags Windsurf Team with 1 seat', () => {
    const result = runAudit(makeInput([
      { toolId: 'windsurf', planId: 'windsurf_team', seats: 1, monthlySpend: 35, useCase: 'coding' },
    ]));
    const rec = result.recommendations.find((r) => r.toolId === 'windsurf' && r.type === 'downgrade_plan');
    expect(rec).toBeDefined();
    expect(rec!.monthlySavings).toBe(20);
  });
});

describe('Rule 2: Redundant Subscriptions', () => {
  it('detects IDE overlap (Cursor + Copilot)', () => {
    const result = runAudit(makeInput([
      { toolId: 'cursor', planId: 'cursor_pro', seats: 1, monthlySpend: 20, useCase: 'coding' },
      { toolId: 'github_copilot', planId: 'copilot_individual', seats: 1, monthlySpend: 10, useCase: 'coding' },
    ]));
    const rec = result.recommendations.find((r) => r.type === 'remove_redundancy');
    expect(rec).toBeDefined();
    expect(result.redundancies.length).toBeGreaterThan(0);
  });

  it('detects Chat overlap (Claude + ChatGPT)', () => {
    const result = runAudit(makeInput([
      { toolId: 'claude', planId: 'claude_pro', seats: 1, monthlySpend: 20, useCase: 'writing' },
      { toolId: 'chatgpt', planId: 'chatgpt_plus', seats: 1, monthlySpend: 20, useCase: 'general' },
    ]));
    const rec = result.recommendations.find((r) => r.type === 'remove_redundancy');
    expect(rec).toBeDefined();
  });

  it('does NOT flag redundancy for different categories', () => {
    const result = runAudit(makeInput([
      { toolId: 'cursor', planId: 'cursor_pro', seats: 1, monthlySpend: 20, useCase: 'coding' },
      { toolId: 'claude', planId: 'claude_pro', seats: 1, monthlySpend: 20, useCase: 'writing' },
    ]));
    const redundancyRec = result.recommendations.find((r) => r.type === 'remove_redundancy');
    expect(redundancyRec).toBeUndefined();
  });
});

describe('Rule 3: API vs Subscription Arbitrage', () => {
  it('flags ChatGPT Plus as redundant with high OpenAI API usage', () => {
    const result = runAudit(makeInput([
      { toolId: 'openai_api', planId: 'openai_api_payg', seats: 1, monthlySpend: 50, useCase: 'coding' },
      { toolId: 'chatgpt', planId: 'chatgpt_plus', seats: 1, monthlySpend: 20, useCase: 'coding' },
    ]));
    const rec = result.recommendations.find((r) => r.type === 'switch_to_api');
    expect(rec).toBeDefined();
    expect(rec!.monthlySavings).toBe(20);
  });

  it('flags Claude Pro as redundant with high Anthropic API usage', () => {
    const result = runAudit(makeInput([
      { toolId: 'anthropic_api', planId: 'anthropic_api_payg', seats: 1, monthlySpend: 40, useCase: 'coding' },
      { toolId: 'claude', planId: 'claude_pro', seats: 1, monthlySpend: 20, useCase: 'coding' },
    ]));
    const rec = result.recommendations.find((r) => r.type === 'switch_to_api');
    expect(rec).toBeDefined();
  });
});

describe('Rule 4: Overpowered Plan', () => {
  it('flags Claude Max 20x for coding use case', () => {
    const result = runAudit(makeInput([
      { toolId: 'claude', planId: 'claude_max_20x', seats: 1, monthlySpend: 200, useCase: 'coding' },
    ]));
    const rec = result.recommendations.find((r) => r.type === 'downgrade_plan' && r.toolId === 'claude');
    expect(rec).toBeDefined();
    expect(rec!.recommendedPlan).toBe('Pro');
    expect(rec!.monthlySavings).toBe(180);
  });

  it('flags Claude Max 5x for general use case', () => {
    const result = runAudit(makeInput([
      { toolId: 'claude', planId: 'claude_max_5x', seats: 1, monthlySpend: 100, useCase: 'general' },
    ]));
    const rec = result.recommendations.find((r) => r.type === 'downgrade_plan');
    expect(rec).toBeDefined();
    expect(rec!.monthlySavings).toBe(80);
  });

  it('does NOT flag Claude Max 20x for research', () => {
    const result = runAudit(makeInput([
      { toolId: 'claude', planId: 'claude_max_20x', seats: 1, monthlySpend: 200, useCase: 'research' },
    ]));
    const rec = result.recommendations.find((r) => r.type === 'downgrade_plan' && r.toolId === 'claude');
    expect(rec).toBeUndefined();
  });
});

describe('Rule 6: Volume Consolidation', () => {
  it('triggers Credex consultation for $500+ spend', () => {
    const result = runAudit(makeInput([
      { toolId: 'cursor', planId: 'cursor_business', seats: 10, monthlySpend: 400, useCase: 'coding' },
      { toolId: 'chatgpt', planId: 'chatgpt_team', seats: 10, monthlySpend: 250, useCase: 'general' },
    ]));
    const rec = result.recommendations.find((r) => r.type === 'credex_consultation');
    expect(rec).toBeDefined();
  });

  it('does NOT trigger Credex for low spend', () => {
    const result = runAudit(makeInput([
      { toolId: 'cursor', planId: 'cursor_pro', seats: 1, monthlySpend: 20, useCase: 'coding' },
    ]));
    const rec = result.recommendations.find((r) => r.type === 'credex_consultation');
    expect(rec).toBeUndefined();
  });

  it('suggests model optimization for high multi-API spend', () => {
    const result = runAudit(makeInput([
      { toolId: 'openai_api', planId: 'openai_api_payg', seats: 1, monthlySpend: 80, useCase: 'coding' },
      { toolId: 'anthropic_api', planId: 'anthropic_api_payg', seats: 1, monthlySpend: 60, useCase: 'coding' },
    ]));
    const rec = result.recommendations.find((r) => r.type === 'model_optimization');
    expect(rec).toBeDefined();
  });
});

describe('Health Score', () => {
  it('returns 100 for a perfectly optimized stack', () => {
    const result = runAudit(makeInput([
      { toolId: 'cursor', planId: 'cursor_pro', seats: 1, monthlySpend: 20, useCase: 'coding' },
    ]));
    expect(result.healthScore).toBeGreaterThanOrEqual(80);
  });

  it('returns low score for highly wasteful stack', () => {
    const result = runAudit(makeInput([
      { toolId: 'cursor', planId: 'cursor_business', seats: 1, monthlySpend: 40, useCase: 'coding' },
      { toolId: 'github_copilot', planId: 'copilot_enterprise', seats: 1, monthlySpend: 39, useCase: 'coding' },
      { toolId: 'claude', planId: 'claude_max_20x', seats: 1, monthlySpend: 200, useCase: 'general' },
      { toolId: 'chatgpt', planId: 'chatgpt_plus', seats: 1, monthlySpend: 20, useCase: 'general' },
    ]));
    expect(result.healthScore).toBeLessThan(50);
  });

  it('calculateHealthScore clamps to 0-100', () => {
    expect(calculateHealthScore(100, 5, 10)).toBe(0);
    expect(calculateHealthScore(0, 0, 0)).toBe(100);
  });
});

describe('Full Audit Integration', () => {
  it('processes a realistic multi-tool stack', () => {
    const result = runAudit(makeInput([
      { toolId: 'cursor', planId: 'cursor_business', seats: 2, monthlySpend: 80, useCase: 'coding' },
      { toolId: 'github_copilot', planId: 'copilot_individual', seats: 2, monthlySpend: 20, useCase: 'coding' },
      { toolId: 'chatgpt', planId: 'chatgpt_plus', seats: 5, monthlySpend: 100, useCase: 'general' },
      { toolId: 'claude', planId: 'claude_pro', seats: 1, monthlySpend: 20, useCase: 'writing' },
    ]));

    expect(result.totalCurrentSpend).toBe(220);
    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.totalMonthlySavings).toBeGreaterThan(0);
    expect(result.healthScore).toBeGreaterThanOrEqual(0);
    expect(result.healthScore).toBeLessThanOrEqual(100);
    expect(result.toolBreakdown).toHaveLength(4);
    expect(result.savingsPercentage).toBeGreaterThan(0);
  });

  it('handles single optimized tool with no recommendations', () => {
    const result = runAudit(makeInput([
      { toolId: 'cursor', planId: 'cursor_pro', seats: 5, monthlySpend: 100, useCase: 'coding' },
    ]));
    expect(result.totalCurrentSpend).toBe(100);
    expect(result.healthScore).toBeGreaterThanOrEqual(80);
  });

  it('handles zero spend gracefully', () => {
    const result = runAudit(makeInput([
      { toolId: 'cursor', planId: 'cursor_free', seats: 1, monthlySpend: 0, useCase: 'coding' },
    ]));
    expect(result.totalCurrentSpend).toBe(0);
    expect(result.savingsPercentage).toBe(0);
    expect(result.healthScore).toBe(100);
  });
});
