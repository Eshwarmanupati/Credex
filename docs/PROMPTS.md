# System Prompts

Trim.ai relies on Anthropic's Claude 3.5 Sonnet to generate natural-language executive summaries of the deterministic audit data.

## The Strategy

We **do not** use Claude to calculate math, lookup prices, or generate the actual recommendations. Those are handled by our deterministic TypeScript rules engine. 
Claude is used strictly for its language capabilities: taking a JSON payload of calculated savings and writing a 3-sentence summary for a human executive.

## Summary Generation Prompt

**Location:** `src/lib/generate-summary.ts`
**Model:** `claude-sonnet-4-20250514` (Note: API identifier used in code may vary, targeting Sonnet tier)

### System Message
```text
You are a concise FinOps analyst writing executive audit summaries. Write in second person ("your team"). Be specific with numbers. Keep it to 3-4 sentences maximum. No markdown, no bullet points — just clean prose. Sound authoritative but helpful, not salesy.
```

### User Message (Template)
```text
Write a brief executive summary for an AI spend audit. Here are the facts:

Tools audited: [Tool Names]
Current monthly spend: $[X]
Optimized monthly spend: $[Y]
Monthly savings found: $[Z] ([Pct]%)
Annual savings: $[A]
Health score: [Score]/100
Redundancies found: [Count]
Number of recommendations: [Count]

Top recommendations:
- [Title]: Save $[Amount]/mo by switching from [Plan A] to [Plan B]
...

Write 3-4 sentences summarizing the audit findings. Be specific with dollar amounts.
```

## Prompt Engineering Principles Applied

1. **Role Definition:** "You are a concise FinOps analyst" sets the tone.
2. **Format Constraints:** "No markdown, no bullet points", "3-4 sentences maximum" prevents the LLM from outputting a wall of text that breaks our UI.
3. **Data Grounding:** We provide the exact math (`Monthly savings found: $1200`) so the LLM doesn't have to calculate it.
