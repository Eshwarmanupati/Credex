import Anthropic from '@anthropic-ai/sdk';
import type { AuditResult } from '@/types';
import { formatCurrency } from './utils';

let anthropicClient: Anthropic | null = null;

function isPlaceholderKey(key: string | undefined): boolean {
  if (!key) return true;
  const normalized = key.toLowerCase();
  return (
    normalized === 'sk-ant-your-key' ||
    normalized === 'your-gemini-key' ||
    normalized === 'your-key' ||
    normalized.includes('your-key') ||
    normalized.includes('placeholder')
  );
}

function getAnthropicClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (isPlaceholderKey(apiKey)) return null;
  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey: apiKey! });
  }
  return anthropicClient;
}

async function generateSummaryWithGemini(result: AuditResult): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (isPlaceholderKey(apiKey)) return null;

  try {
    const prompt = buildPrompt(result);
    const systemPrompt = `You are a concise FinOps analyst writing executive audit summaries. Write in second person ("your team"). Be specific with numbers. Keep it to 3-4 sentences maximum. No markdown, no bullet points — just clean prose. Sound authoritative but helpful, not salesy.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: {
            maxOutputTokens: 600,
            temperature: 0.2,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`Gemini API returned status ${response.status}:`, errorText);
      return null;
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text && text.trim().length > 20) {
      return text.trim();
    }
    return null;
  } catch (error) {
    console.error('Gemini API error during summary generation:', error);
    return null;
  }
}

export async function generateAuditSummary(result: AuditResult): Promise<string> {
  const geminiSummary = await generateSummaryWithGemini(result);
  if (geminiSummary) return geminiSummary;

  try {
    const client = getAnthropicClient();
    if (!client) {
      return generateFallbackSummary(result);
    }

    const prompt = buildPrompt(result);
    const response = await client.messages.create({
      model: 'claude-sonnet-4-latest',
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
