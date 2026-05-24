# AI Tool Pricing Database

This document outlines the snapshot of AI tool pricing used by the Trim.ai engine as of **May 2026**.

*Note: In the actual codebase, this data is structured in `src/lib/pricing-data.ts`.*

## IDE & Coding

### Cursor
- **Hobby:** $0 (2000 completions, 50 premium requests)
- **Pro:** $20/user/mo (Unlimited completions, 500 fast premium requests)
- **Business:** $40/user/mo (Requires 1+ seats, adds SSO and Admin dashboard)

### GitHub Copilot
- **Free:** $0 (2000 completions/mo, limited chat)
- **Individual:** $10/user/mo (Unlimited completions and chat)
- **Business:** $19/user/mo (Requires 1+ seats, IP indemnity, org management)
- **Enterprise:** $39/user/mo (Requires 1+ seats, fine-tuned models, knowledge bases)

### Windsurf
- **Free:** $0 (Limited autocomplete and agent flow)
- **Pro:** $15/user/mo (Unlimited autocomplete, advanced agents)
- **Team:** $35/user/mo (Requires 2+ seats, team management)

## Chat & General Assistants

### ChatGPT (OpenAI)
- **Free:** $0 (GPT-4o mini, limited GPT-4o)
- **Plus:** $20/user/mo (GPT-4, DALL-E 3, advanced data analysis)
- **Team:** $25/user/mo (Requires 2+ seats, shared workspace, higher limits, no data training)
- **Enterprise:** $60/user/mo (Requires 50+ seats, SAML SSO, unlimited GPT-4)

### Claude (Anthropic)
- **Free:** $0 (Limited Sonnet usage)
- **Pro:** $20/user/mo (Opus access, 5x usage, Projects)
- **Max (5x):** $100/user/mo (Extended thinking, higher rate limits)
- **Max (20x):** $200/user/mo (Extended thinking, highest rate limits for heavy research)

### Gemini (Google)
- **Free:** $0 (Gemini Flash)
- **Advanced:** $20/user/mo (Gemini Ultra, 1TB storage, deeper integrations)

## API Access

### OpenAI API
- **Model:** GPT-4o
- **Cost:** ~$2.50 / 1M input tokens

### Anthropic API
- **Model:** Claude 3.5 Sonnet
- **Cost:** ~$3.00 / 1M input tokens
