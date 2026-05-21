// =============================================================================
// Trim.ai — AI Summary Generator (Anthropic Claude)
// =============================================================================
// Generates a narrative executive summary from structured audit results.
// Falls back to a template-based summary if the API call fails.
// =============================================================================

import Anthropic from '@anthropic-ai/sdk';
import type { AuditResult } from '@/types';
import { TOOLS } from './pricing-data';
import { formatCurrency } from './utils';

let anthropicClient: Anthropic | null = null;

function getClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropicClient;
}

export async function generateAuditSummary(result: AuditResult): Promise<string> {
  try {
    const client = getClient();
    if (!client) return generateFallbackSummary(result);

    const prompt = buildPrompt(result);
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
      system: `You are a concise FinOps analyst writing executive audit summaries. Write in second person ("your team"). Be specific with numbers. Keep it to 3-4 sentences maximum. No markdown, no bullet points — just clean prose. Sound authoritative but helpful, not salesy.`,
    });

    const text = response.content[0];
    if (text.type === 'text' && text.text.length > 20) {
      return text.text.trim();
    }
    return generateFallbackSummary(result);
  } catch (error) {
    console.error('Claude API error, using fallback summary:', error);
    return generateFallbackSummary(result);
  }
}

function buildPrompt(result: AuditResult): string {
  const topRecs = result.recommendations
    .slice(0, 4)
    .map((r) => `- ${r.title}: Save ${formatCurrency(r.monthlySavings)}/mo by switching from ${r.currentPlan} to ${r.recommendedPlan}`)
    .join('\n');

  const toolNames = result.toolBreakdown.map((t) => t.toolName).join(', ');

  return `Write a brief executive summary for an AI spend audit. Here are the facts:

Tools audited: ${toolNames}
Current monthly spend: ${formatCurrency(result.totalCurrentSpend)}
Optimized monthly spend: ${formatCurrency(result.totalOptimizedSpend)}
Monthly savings found: ${formatCurrency(result.totalMonthlySavings)} (${result.savingsPercentage}%)
Annual savings: ${formatCurrency(result.totalAnnualSavings)}
Health score: ${result.healthScore}/100
Redundancies found: ${result.redundancies.length}
Number of recommendations: ${result.recommendations.length}

Top recommendations:
${topRecs}

Write 3-4 sentences summarizing the audit findings. Be specific with dollar amounts.`;
}

export function generateFallbackSummary(result: AuditResult): string {
  if (result.totalMonthlySavings === 0) {
    return `Your AI stack is well-optimized. Across ${result.toolBreakdown.length} tool(s) totaling ${formatCurrency(result.totalCurrentSpend)}/mo, we found no significant savings opportunities. Your health score of ${result.healthScore}/100 reflects efficient tool selection and plan sizing.`;
  }

  const topRec = result.recommendations[0];
  const topRecText = topRec
    ? ` The biggest opportunity: ${topRec.title.toLowerCase()}, which alone saves ${formatCurrency(topRec.monthlySavings)}/mo.`
    : '';

  const redundancyText = result.redundancies.length > 0
    ? ` We also detected ${result.redundancies.length} redundant subscription overlap(s) that should be consolidated.`
    : '';

  return `Your AI stack audit revealed ${formatCurrency(result.totalMonthlySavings)}/mo in potential savings across ${result.toolBreakdown.length} tool(s) — that's ${formatCurrency(result.totalAnnualSavings)} annually (${result.savingsPercentage}% reduction).${topRecText}${redundancyText} Your current health score is ${result.healthScore}/100.`;
}
