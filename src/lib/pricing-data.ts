// =============================================================================
// Trim.ai — AI Tool Pricing Database
// =============================================================================
// Static, normalized pricing data for all supported AI tools.
// Sources: Official pricing pages as of May 2025.
// See docs/PRICING_DATA.md for detailed source links.
// =============================================================================

import type { ToolMeta, ToolId, PricingTier } from '@/types';

// ---------------------------------------------------------------------------
// Individual Tool Definitions
// ---------------------------------------------------------------------------

export const TOOLS: Record<ToolId, ToolMeta> = {
  cursor: {
    id: 'cursor',
    name: 'Cursor',
    icon: '⌨️',
    description: 'AI-powered code editor with inline completions and chat',
    category: 'ide',
    plans: [
      {
        planId: 'cursor_free',
        tool: 'cursor',
        planName: 'Hobby (Free)',
        pricePerSeat: 0,
        features: ['2000 completions', '50 slow premium requests'],
        category: 'ide',
      },
      {
        planId: 'cursor_pro',
        tool: 'cursor',
        planName: 'Pro',
        pricePerSeat: 20,
        features: ['Unlimited completions', '500 fast premium requests', 'Unlimited slow requests'],
        category: 'ide',
      },
      {
        planId: 'cursor_business',
        tool: 'cursor',
        planName: 'Business',
        pricePerSeat: 40,
        minSeats: 1,
        features: ['Everything in Pro', 'Admin dashboard', 'SAML SSO', 'Usage analytics', 'Enforce privacy mode'],
        category: 'ide',
      },
    ],
  },

  github_copilot: {
    id: 'github_copilot',
    name: 'GitHub Copilot',
    icon: '🐙',
    description: 'AI pair programmer integrated into VS Code, JetBrains, and more',
    category: 'ide',
    plans: [
      {
        planId: 'copilot_free',
        tool: 'github_copilot',
        planName: 'Free',
        pricePerSeat: 0,
        features: ['2000 completions/month', '50 chat messages/month'],
        category: 'ide',
      },
      {
        planId: 'copilot_individual',
        tool: 'github_copilot',
        planName: 'Individual',
        pricePerSeat: 10,
        features: ['Unlimited completions', 'Unlimited chat', 'Multi-model support'],
        category: 'ide',
      },
      {
        planId: 'copilot_business',
        tool: 'github_copilot',
        planName: 'Business',
        pricePerSeat: 19,
        minSeats: 1,
        features: ['Everything in Individual', 'Organization management', 'IP indemnity', 'Content exclusion'],
        category: 'ide',
      },
      {
        planId: 'copilot_enterprise',
        tool: 'github_copilot',
        planName: 'Enterprise',
        pricePerSeat: 39,
        minSeats: 1,
        features: ['Everything in Business', 'Knowledge bases', 'Fine-tuned models', 'Custom docs indexing'],
        category: 'ide',
      },
    ],
  },

  chatgpt: {
    id: 'chatgpt',
    name: 'ChatGPT',
    icon: '💬',
    description: 'OpenAI conversational AI assistant for general tasks',
    category: 'chat',
    plans: [
      {
        planId: 'chatgpt_free',
        tool: 'chatgpt',
        planName: 'Free',
        pricePerSeat: 0,
        features: ['GPT-4o mini', 'Limited GPT-4o access', 'Basic DALL-E'],
        category: 'chat',
      },
      {
        planId: 'chatgpt_plus',
        tool: 'chatgpt',
        planName: 'Plus',
        pricePerSeat: 20,
        features: ['GPT-4o', 'GPT-4', 'DALL-E 3', 'Advanced data analysis', 'Custom GPTs'],
        category: 'chat',
      },
      {
        planId: 'chatgpt_team',
        tool: 'chatgpt',
        planName: 'Team',
        pricePerSeat: 25,
        minSeats: 2,
        features: ['Everything in Plus', 'Higher usage caps', 'Shared workspace', 'Admin console', 'No training on data'],
        category: 'chat',
      },
      {
        planId: 'chatgpt_enterprise',
        tool: 'chatgpt',
        planName: 'Enterprise',
        pricePerSeat: 60,
        minSeats: 50,
        features: ['Unlimited GPT-4', 'SAML SSO', 'Custom data retention', 'API credits included'],
        category: 'chat',
      },
    ],
  },

  claude: {
    id: 'claude',
    name: 'Claude',
    icon: '🧠',
    description: 'Anthropic AI assistant for analysis, writing, and coding',
    category: 'chat',
    plans: [
      {
        planId: 'claude_free',
        tool: 'claude',
        planName: 'Free',
        pricePerSeat: 0,
        features: ['Limited Claude Sonnet usage', 'Basic features'],
        category: 'chat',
      },
      {
        planId: 'claude_pro',
        tool: 'claude',
        planName: 'Pro',
        pricePerSeat: 20,
        features: ['5x more usage', 'Claude Opus access', 'Priority access', 'Projects'],
        category: 'chat',
      },
      {
        planId: 'claude_max_5x',
        tool: 'claude',
        planName: 'Max (5x)',
        pricePerSeat: 100,
        features: ['5x Pro usage', 'Extended thinking', 'Higher rate limits'],
        category: 'chat',
      },
      {
        planId: 'claude_max_20x',
        tool: 'claude',
        planName: 'Max (20x)',
        pricePerSeat: 200,
        features: ['20x Pro usage', 'Extended thinking', 'Highest rate limits'],
        category: 'chat',
      },
    ],
  },

  openai_api: {
    id: 'openai_api',
    name: 'OpenAI API',
    icon: '🔌',
    description: 'Direct API access to GPT-4o, GPT-4, embeddings, and more',
    category: 'api',
    plans: [
      {
        planId: 'openai_api_payg',
        tool: 'openai_api',
        planName: 'Pay-as-you-go',
        pricePerSeat: 0,
        isPayAsYouGo: true,
        features: ['GPT-4o: $2.50/1M input tokens', 'GPT-4o-mini: $0.15/1M input tokens', 'Pay per token usage'],
        category: 'api',
      },
    ],
  },

  anthropic_api: {
    id: 'anthropic_api',
    name: 'Anthropic API',
    icon: '🔧',
    description: 'Direct API access to Claude Sonnet, Opus, and Haiku models',
    category: 'api',
    plans: [
      {
        planId: 'anthropic_api_payg',
        tool: 'anthropic_api',
        planName: 'Pay-as-you-go',
        pricePerSeat: 0,
        isPayAsYouGo: true,
        features: ['Sonnet: $3/1M input tokens', 'Haiku: $0.25/1M input tokens', 'Opus: $15/1M input tokens'],
        category: 'api',
      },
    ],
  },

  gemini: {
    id: 'gemini',
    name: 'Gemini',
    icon: '✨',
    description: 'Google AI assistant with multimodal capabilities',
    category: 'chat',
    plans: [
      {
        planId: 'gemini_free',
        tool: 'gemini',
        planName: 'Free',
        pricePerSeat: 0,
        features: ['Gemini Flash', 'Basic features', 'Limited usage'],
        category: 'chat',
      },
      {
        planId: 'gemini_advanced',
        tool: 'gemini',
        planName: 'Advanced',
        pricePerSeat: 20,
        features: ['Gemini Ultra', '1TB Google storage', 'Google One AI Premium', 'Longer context windows'],
        category: 'chat',
      },
    ],
  },

  windsurf: {
    id: 'windsurf',
    name: 'Windsurf',
    icon: '🏄',
    description: 'AI-powered IDE by Codeium with Cascade agent',
    category: 'ide',
    plans: [
      {
        planId: 'windsurf_free',
        tool: 'windsurf',
        planName: 'Free',
        pricePerSeat: 0,
        features: ['Limited autocomplete', 'Limited Cascade credits'],
        category: 'ide',
      },
      {
        planId: 'windsurf_pro',
        tool: 'windsurf',
        planName: 'Pro',
        pricePerSeat: 15,
        features: ['Unlimited autocomplete', 'Pro Cascade flows', 'GPT-4 & Claude access'],
        category: 'ide',
      },
      {
        planId: 'windsurf_team',
        tool: 'windsurf',
        planName: 'Team',
        pricePerSeat: 35,
        minSeats: 2,
        features: ['Everything in Pro', 'Team management', 'Shared knowledge', 'Priority support'],
        category: 'ide',
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

/** Get all tools as an array */
export function getAllTools(): ToolMeta[] {
  return Object.values(TOOLS);
}

/** Get a specific tool by ID */
export function getToolById(toolId: ToolId): ToolMeta {
  return TOOLS[toolId];
}

/** Get a specific plan from a tool */
export function getPlan(toolId: ToolId, planId: string): PricingTier | undefined {
  return TOOLS[toolId]?.plans.find((p) => p.planId === planId);
}

/** Get all plan IDs for a tool */
export function getPlanIds(toolId: ToolId): string[] {
  return TOOLS[toolId]?.plans.map((p) => p.planId) ?? [];
}

/** Get the cheapest non-free plan for a tool */
export function getCheapestPaidPlan(toolId: ToolId): PricingTier | undefined {
  return TOOLS[toolId]?.plans
    .filter((p) => p.pricePerSeat > 0)
    .sort((a, b) => a.pricePerSeat - b.pricePerSeat)[0];
}

/** Check if two tools are in the same category (potential redundancy) */
export function isSameCategory(toolA: ToolId, toolB: ToolId): boolean {
  return TOOLS[toolA]?.category === TOOLS[toolB]?.category;
}

/** Get all tools in a specific category */
export function getToolsByCategory(category: 'ide' | 'chat' | 'api' | 'platform'): ToolMeta[] {
  return Object.values(TOOLS).filter((t) => t.category === category);
}
