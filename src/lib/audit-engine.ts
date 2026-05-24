import type {
  ToolEntry,
  AuditInput,
  AuditResult,
  Recommendation,
  ToolBreakdownItem,
  RedundancyFlag,
  RecommendationType,
  Severity,
  ToolId,
} from '@/types';
import { TOOLS, getPlan } from './pricing-data';
import { clamp } from './utils';

function createIdGenerator() {
  let counter = 0;
  return () => `rec_${++counter}`;
}

export function runAudit(input: AuditInput): AuditResult {
  const nextId = createIdGenerator();
  const recommendations: Recommendation[] = [];

  recommendations.push(...ruleSeatTierMismatch(input.tools, nextId));
  recommendations.push(...ruleRedundantSubscriptions(input.tools, nextId));
  recommendations.push(...ruleApiVsSubscription(input.tools, nextId));
  recommendations.push(...ruleOverpoweredPlan(input.tools, nextId));
  recommendations.push(...ruleCheaperAlternatives(input.tools, nextId));
  recommendations.push(...ruleVolumeConsolidation(input.tools, nextId));

  const totalCurrentSpend = input.tools.reduce((sum, t) => sum + t.monthlySpend, 0);
  const totalMonthlySavings = recommendations.reduce((sum, r) => sum + r.monthlySavings, 0);
  const totalOptimizedSpend = Math.max(0, totalCurrentSpend - totalMonthlySavings);
  const savingsPercentage = totalCurrentSpend > 0
    ? (totalMonthlySavings / totalCurrentSpend) * 100
    : 0;

  const toolBreakdown = buildToolBreakdown(input.tools, recommendations);
  const redundancies = detectRedundancies(input.tools);
  const healthScore = calculateHealthScore(
    savingsPercentage,
    redundancies.length,
    recommendations.filter((r) => r.severity === 'high').length
  );

  return {
    totalCurrentSpend,
    totalOptimizedSpend,
    totalMonthlySavings,
    totalAnnualSavings: totalMonthlySavings * 12,
    savingsPercentage: Math.round(savingsPercentage * 10) / 10,
    healthScore,
    recommendations: recommendations.sort((a, b) => {
      const order: Record<Severity, number> = { high: 0, medium: 1, low: 2, info: 3 };
      return order[a.severity] - order[b.severity];
    }),
    toolBreakdown,
    redundancies,
  };
}

function ruleSeatTierMismatch(tools: ToolEntry[], nextId: () => string): Recommendation[] {
  const recs: Recommendation[] = [];

  for (const entry of tools) {
    const plan = getPlan(entry.toolId, entry.planId);
    if (!plan) continue;

    if (entry.planId === 'cursor_business' && entry.seats < 3) {
      const optimizedCost = 20 * entry.seats;
      if (entry.monthlySpend > optimizedCost) {
        recs.push(makeRec(nextId, {
          type: 'downgrade_plan',
          severity: 'high',
          toolId: entry.toolId,
          title: 'Cursor Business is overkill for small teams',
          description: `With only ${entry.seats} seat(s), you don't need Business-tier admin features. Cursor Pro provides the same AI coding capabilities.`,
          currentPlan: plan.planName,
          recommendedPlan: 'Pro',
          currentMonthlyCost: entry.monthlySpend,
          optimizedMonthlyCost: optimizedCost,
          reasoning: 'Business ($40/seat) vs Pro ($20/seat). Admin dashboard and SSO are unnecessary for teams under 3.',
        }));
      }
    }

    if (entry.planId === 'copilot_enterprise' && entry.seats < 10) {
      const optimizedCost = 19 * entry.seats;
      if (entry.monthlySpend > optimizedCost) {
        recs.push(makeRec(nextId, {
          type: 'downgrade_plan',
          severity: 'high',
          toolId: entry.toolId,
          title: 'GitHub Copilot Enterprise is oversized for your team',
          description: `Enterprise features like knowledge bases and fine-tuned models require scale. Business tier covers your team of ${entry.seats}.`,
          currentPlan: plan.planName,
          recommendedPlan: 'Business',
          currentMonthlyCost: entry.monthlySpend,
          optimizedMonthlyCost: optimizedCost,
          reasoning: 'Enterprise ($39/seat) vs Business ($19/seat). Knowledge bases and custom models need 10+ seats to justify cost.',
        }));
      }
    }

    if (entry.planId === 'chatgpt_plus' && entry.seats > 3) {
      recs.push(makeRec(nextId, {
        type: 'consolidate_seats',
        severity: 'info',
        toolId: entry.toolId,
        title: 'Consider consolidating ChatGPT seats to a Team plan',
        description: `Managing ${entry.seats} separate Plus subscriptions creates admin overhead. Team plan adds shared workspace, higher caps, and a no-training guarantee for $5/seat more.`,
        currentPlan: plan.planName,
        recommendedPlan: 'Team',
        currentMonthlyCost: entry.monthlySpend,
        optimizedMonthlyCost: entry.monthlySpend,
        reasoning: `Individual Plus seats lack admin controls. Team ($25/seat) gives higher caps, shared workspace, and data privacy — valuable for ${entry.seats}+ users.`,
      }));
    }

    if (entry.planId === 'windsurf_team' && entry.seats < 3) {
      const optimizedCost = 15 * entry.seats;
      if (entry.monthlySpend > optimizedCost) {
        recs.push(makeRec(nextId, {
          type: 'downgrade_plan',
          severity: 'medium',
          toolId: entry.toolId,
          title: 'Windsurf Team is unnecessary for small teams',
          description: 'Pro plan covers all AI features. Team management only pays off at 3+ seats.',
          currentPlan: plan.planName,
          recommendedPlan: 'Pro',
          currentMonthlyCost: entry.monthlySpend,
          optimizedMonthlyCost: optimizedCost,
          reasoning: `Team ($35/seat) vs Pro ($15/seat). Team management features are irrelevant for ${entry.seats} user(s).`,
        }));
      }
    }
  }

  return recs;
}

function ruleRedundantSubscriptions(tools: ToolEntry[], nextId: () => string): Recommendation[] {
  const recs: Recommendation[] = [];
  const paidTools = tools.filter((t) => t.monthlySpend > 0);

  const ideTools = paidTools.filter((t) =>
    ['cursor', 'github_copilot', 'windsurf'].includes(t.toolId)
  );
  if (ideTools.length > 1) {
    const sorted = [...ideTools].sort((a, b) => a.monthlySpend - b.monthlySpend);
    const keeper = sorted[sorted.length - 1];
    for (const tool of sorted.slice(0, -1)) {
      const toolMeta = TOOLS[tool.toolId];
      const keeperMeta = TOOLS[keeper.toolId];
      recs.push(makeRec(nextId, {
        type: 'remove_redundancy',
        severity: 'high',
        toolId: tool.toolId,
        title: `${toolMeta.name} overlaps with ${keeperMeta.name}`,
        description: `You're paying for two AI code editors. Both provide inline completions and AI chat. Consider consolidating to ${keeperMeta.name}.`,
        currentPlan: getPlan(tool.toolId, tool.planId)?.planName || tool.planId,
        recommendedPlan: 'Remove subscription',
        currentMonthlyCost: tool.monthlySpend,
        optimizedMonthlyCost: 0,
        reasoning: `${toolMeta.name} ($${tool.monthlySpend}/mo) provides similar features to ${keeperMeta.name}. Removing eliminates redundant IDE costs.`,
      }));
    }
  }

  const chatTools = paidTools.filter((t) =>
    ['claude', 'chatgpt'].includes(t.toolId) && !t.planId.includes('free')
  );
  if (chatTools.length > 1) {
    const cheaper = chatTools.reduce((a, b) => a.monthlySpend <= b.monthlySpend ? a : b);
    const cheaperMeta = TOOLS[cheaper.toolId];
    const otherTool = chatTools.find((t) => t.toolId !== cheaper.toolId)!;
    const otherMeta = TOOLS[otherTool.toolId];

    recs.push(makeRec(nextId, {
      type: 'remove_redundancy',
      severity: 'medium',
      toolId: cheaper.toolId,
      title: `${cheaperMeta.name} and ${otherMeta.name} serve similar purposes`,
      description: `Both are general-purpose AI chat tools. Consider using ${otherMeta.name} as your primary and dropping ${cheaperMeta.name}, or vice versa based on your workflow.`,
      currentPlan: getPlan(cheaper.toolId, cheaper.planId)?.planName || cheaper.planId,
      recommendedPlan: `Use ${otherMeta.name} only`,
      currentMonthlyCost: cheaper.monthlySpend,
      optimizedMonthlyCost: 0,
      reasoning: `Paying for both ${cheaperMeta.name} ($${cheaper.monthlySpend}/mo) and ${otherMeta.name} ($${otherTool.monthlySpend}/mo) is redundant for most workflows. Pick one as primary.`,
    }));
  }

  return recs;
}

function ruleApiVsSubscription(tools: ToolEntry[], nextId: () => string): Recommendation[] {
  const recs: Recommendation[] = [];

  const hasOpenAIApi = tools.find((t) => t.toolId === 'openai_api' && t.monthlySpend > 0);
  const hasChatGPTPlus = tools.find((t) => t.toolId === 'chatgpt' && t.planId === 'chatgpt_plus');

  if (hasOpenAIApi && hasChatGPTPlus && hasOpenAIApi.monthlySpend > 30) {
    recs.push(makeRec(nextId, {
      type: 'switch_to_api',
      severity: 'medium',
      toolId: 'chatgpt',
      title: 'ChatGPT Plus may be redundant with high API usage',
      description: `You're spending $${hasOpenAIApi.monthlySpend}/mo on OpenAI API directly. With that level of API usage, ChatGPT Plus provides marginal value.`,
      currentPlan: 'Plus',
      recommendedPlan: 'Free (use API directly)',
      currentMonthlyCost: hasChatGPTPlus.monthlySpend,
      optimizedMonthlyCost: 0,
      reasoning: `At $${hasOpenAIApi.monthlySpend}/mo API spend, you're already a power user. The web UI's value doesn't justify $20/mo extra.`,
    }));
  }

  const hasAnthropicApi = tools.find((t) => t.toolId === 'anthropic_api' && t.monthlySpend > 0);
  const hasClaudePro = tools.find((t) => t.toolId === 'claude' && t.planId === 'claude_pro');

  if (hasAnthropicApi && hasClaudePro && hasAnthropicApi.monthlySpend > 30) {
    recs.push(makeRec(nextId, {
      type: 'switch_to_api',
      severity: 'medium',
      toolId: 'claude',
      title: 'Claude Pro may be redundant with high API usage',
      description: `You're spending $${hasAnthropicApi.monthlySpend}/mo on Anthropic API. Consider using API-based interfaces instead of the Pro subscription.`,
      currentPlan: 'Pro',
      recommendedPlan: 'Free (use API directly)',
      currentMonthlyCost: hasClaudePro.monthlySpend,
      optimizedMonthlyCost: 0,
      reasoning: `Heavy API users ($${hasAnthropicApi.monthlySpend}/mo) get more value from direct API access than the Pro web interface.`,
    }));
  }

  return recs;
}

function ruleOverpoweredPlan(tools: ToolEntry[], nextId: () => string): Recommendation[] {
  const recs: Recommendation[] = [];

  for (const entry of tools) {
    if (entry.planId === 'claude_max_20x' && entry.useCase !== 'research') {
      const optimizedCost = entry.useCase === 'coding' ? 20 * entry.seats : 100 * entry.seats;
      if (entry.monthlySpend > optimizedCost) {
        recs.push(makeRec(nextId, {
          type: 'downgrade_plan',
          severity: 'high',
          toolId: entry.toolId,
          title: 'Claude Max (20x) is excessive for your use case',
          description: `Max 20x is designed for heavy research workloads. For ${entry.useCase}, Pro or Max 5x provides sufficient capacity.`,
          currentPlan: 'Max (20x)',
          recommendedPlan: entry.useCase === 'coding' ? 'Pro' : 'Max (5x)',
          currentMonthlyCost: entry.monthlySpend,
          optimizedMonthlyCost: optimizedCost,
          reasoning: `Max 20x ($200/seat) is for power researchers. ${entry.useCase} workflows rarely exhaust Pro ($20/seat) or Max 5x ($100/seat) limits.`,
        }));
      }
    }

    if (entry.planId === 'claude_max_5x' && ['coding', 'general'].includes(entry.useCase)) {
      const optimizedCost = 20 * entry.seats;
      if (entry.monthlySpend > optimizedCost) {
        recs.push(makeRec(nextId, {
          type: 'downgrade_plan',
          severity: 'medium',
          toolId: entry.toolId,
          title: 'Claude Max (5x) may be more than you need',
          description: `For ${entry.useCase} tasks, Claude Pro's limits are usually sufficient. Max is better suited for extended research sessions.`,
          currentPlan: 'Max (5x)',
          recommendedPlan: 'Pro',
          currentMonthlyCost: entry.monthlySpend,
          optimizedMonthlyCost: optimizedCost,
          reasoning: `Max 5x ($100/seat) vs Pro ($20/seat). Most ${entry.useCase} users don't hit Pro's rate limits.`,
        }));
      }
    }
  }

  return recs;
}

function ruleCheaperAlternatives(tools: ToolEntry[], nextId: () => string): Recommendation[] {
  const recs: Recommendation[] = [];

  for (const entry of tools) {
    if (entry.planId === 'copilot_business' && entry.useCase === 'coding') {
      const hasCursor = tools.some((t) => t.toolId === 'cursor' && t.monthlySpend > 0);
      const optimizedCost = 20 * entry.seats;
      if (!hasCursor && entry.monthlySpend >= optimizedCost) {
        recs.push(makeRec(nextId, {
          type: 'cheaper_alternative',
          severity: 'low',
          toolId: entry.toolId,
          title: 'Consider Cursor Pro as an alternative to Copilot Business',
          description: 'Cursor Pro ($20/seat) offers a more integrated AI coding experience with inline chat, multi-file edits, and agent mode — at a comparable price to Copilot Business ($19/seat).',
          currentPlan: 'Business',
          recommendedPlan: 'Cursor Pro (alternative)',
          currentMonthlyCost: entry.monthlySpend,
          optimizedMonthlyCost: optimizedCost,
          reasoning: "Cursor's AI features (Composer, Agent mode) are more advanced than Copilot for pure coding workflows. Price is comparable at $20 vs $19/seat.",
        }));
      }
    }

    if (entry.planId === 'chatgpt_plus' && entry.useCase === 'coding') {
      const hasClaude = tools.some((t) => t.toolId === 'claude' && t.monthlySpend > 0);
      if (!hasClaude && entry.monthlySpend > 0) {
        recs.push(makeRec(nextId, {
          type: 'cheaper_alternative',
          severity: 'low',
          toolId: entry.toolId,
          title: 'Claude Pro may be better for coding workflows',
          description: "Claude excels at code generation, debugging, and technical analysis. At the same price ($20/mo), it may serve your coding use case better.",
          currentPlan: 'Plus',
          recommendedPlan: 'Claude Pro (alternative)',
          currentMonthlyCost: entry.monthlySpend,
          optimizedMonthlyCost: entry.monthlySpend,
          reasoning: "Claude's Artifacts feature and longer context window make it superior for coding tasks. Same price point as ChatGPT Plus.",
        }));
      }
    }

    if (entry.planId === 'gemini_advanced' && entry.useCase === 'general') {
      if (entry.monthlySpend > 0) {
        recs.push(makeRec(nextId, {
          type: 'downgrade_plan',
          severity: 'low',
          toolId: entry.toolId,
          title: 'Gemini Free may be sufficient for general use',
          description: 'Gemini Advanced mainly adds longer context and Google One storage. For general tasks, the free tier is quite capable.',
          currentPlan: 'Advanced',
          recommendedPlan: 'Free',
          currentMonthlyCost: entry.monthlySpend,
          optimizedMonthlyCost: 0,
          reasoning: 'At $20/mo, Advanced is only justified for power users needing Gemini Ultra and extended context. General use rarely hits free-tier limits.',
        }));
      }
    }
  }

  return recs;
}

function ruleVolumeConsolidation(tools: ToolEntry[], nextId: () => string): Recommendation[] {
  const recs: Recommendation[] = [];
  const totalSpend = tools.reduce((sum, t) => sum + t.monthlySpend, 0);

  if (totalSpend > 500) {
    recs.push(makeRec(nextId, {
      type: 'credex_consultation',
      severity: 'info',
      toolId: tools[0].toolId,
      title: 'Eligible for enterprise AI spend consultation',
      description: `Your team spends $${totalSpend}/mo on AI tools. At this scale, enterprise agreements and volume discounts can yield 15-30% additional savings beyond tool-level optimization.`,
      currentPlan: 'Multiple tools',
      recommendedPlan: 'Credex Enterprise Consultation',
      currentMonthlyCost: totalSpend,
      optimizedMonthlyCost: Math.round(totalSpend * 0.8),
      reasoning: 'Teams spending $500+/mo qualify for enterprise pricing negotiations. Credex specialists can help secure volume discounts and consolidated billing.',
    }));
  }

  const apiTools = tools.filter((t) => ['openai_api', 'anthropic_api'].includes(t.toolId) && t.monthlySpend > 0);
  if (apiTools.length > 1) {
    const totalApiSpend = apiTools.reduce((sum, t) => sum + t.monthlySpend, 0);
    if (totalApiSpend > 100) {
      recs.push(makeRec(nextId, {
        type: 'model_optimization',
        severity: 'medium',
        toolId: 'openai_api',
        title: 'Optimize API model selection across providers',
        description: `You're spending $${totalApiSpend}/mo across multiple API providers. Routing simple tasks to cheaper models (GPT-4o-mini, Haiku) can cut costs by 50-80%.`,
        currentPlan: 'Multiple API providers',
        recommendedPlan: 'Tiered model routing',
        currentMonthlyCost: totalApiSpend,
        optimizedMonthlyCost: Math.round(totalApiSpend * 0.5),
        reasoning: "80% of API calls don't need frontier models. Using GPT-4o-mini ($0.15/1M tokens) instead of GPT-4o ($2.50/1M) for simple tasks slashes costs.",
      }));
    }
  }

  return recs;
}

function detectRedundancies(tools: ToolEntry[]): RedundancyFlag[] {
  const flags: RedundancyFlag[] = [];
  const paidTools = tools.filter((t) => t.monthlySpend > 0);

  const ideTools = paidTools.filter((t) => ['cursor', 'github_copilot', 'windsurf'].includes(t.toolId));
  if (ideTools.length > 1) {
    const cheapest = ideTools.reduce((a, b) => a.monthlySpend <= b.monthlySpend ? a : b);
    flags.push({
      tools: ideTools.map((t) => t.toolId),
      reason: 'Multiple AI code editors active. Features overlap significantly.',
      potentialSavings: cheapest.monthlySpend,
    });
  }

  const chatTools = paidTools.filter((t) => ['claude', 'chatgpt', 'gemini'].includes(t.toolId));
  if (chatTools.length > 1) {
    const cheapest = chatTools.reduce((a, b) => a.monthlySpend <= b.monthlySpend ? a : b);
    flags.push({
      tools: chatTools.map((t) => t.toolId),
      reason: 'Multiple AI chat assistants with overlapping capabilities.',
      potentialSavings: cheapest.monthlySpend,
    });
  }

  return flags;
}

export function calculateHealthScore(
  savingsPercentage: number,
  redundancyCount: number,
  highSeverityCount: number
): number {
  let score = 100;
  score -= savingsPercentage * 0.8;
  score -= redundancyCount * 12;
  score -= highSeverityCount * 8;
  return clamp(Math.round(score), 0, 100);
}

function buildToolBreakdown(
  tools: ToolEntry[],
  recommendations: Recommendation[]
): ToolBreakdownItem[] {
  return tools.map((entry) => {
    const toolRecs = recommendations.filter((r) => r.toolId === entry.toolId);
    const totalSavings = toolRecs.reduce((sum, r) => sum + r.monthlySavings, 0);
    return {
      toolId: entry.toolId,
      toolName: TOOLS[entry.toolId]?.name || entry.toolId,
      currentSpend: entry.monthlySpend,
      optimizedSpend: Math.max(0, entry.monthlySpend - totalSavings),
      savings: totalSavings,
    };
  });
}

interface RecInput {
  type: RecommendationType;
  severity: Severity;
  toolId: ToolId;
  title: string;
  description: string;
  currentPlan: string;
  recommendedPlan: string;
  currentMonthlyCost: number;
  optimizedMonthlyCost: number;
  reasoning: string;
}

function makeRec(nextId: () => string, input: RecInput): Recommendation {
  const monthlySavings = Math.max(0, input.currentMonthlyCost - input.optimizedMonthlyCost);
  return {
    id: nextId(),
    ...input,
    monthlySavings,
    annualSavings: monthlySavings * 12,
  };
}
