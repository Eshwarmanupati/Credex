# Trim.ai ✂️ — FinOps for the AI Era

<div align="center">
  <img src="https://via.placeholder.com/1200x630/0F172A/10B981?text=Trim.ai+Audit" alt="Trim.ai Cover" width="600"/>
</div>

Trim.ai is a **production-grade SaaS MVP** built for the Credex WebDev 2026 assignment. It audits a company's AI software stack (ChatGPT, GitHub Copilot, Cursor, Claude, etc.) and provides a deterministic, personalized report on how to cut costs, eliminate redundancies, and optimize API usage.

## 🌟 Why Trim.ai?

The AI tooling market is exploding. Companies are unknowingly paying for:
1. **Redundant features:** Developers have Cursor ($20/mo) *and* Copilot ($19/mo) which overlap significantly.
2. **Oversized plans:** Teams of 2 paying for Enterprise features designed for teams of 50.
3. **SaaS vs API Arbitrage:** Paying $20/mo for a web UI when their API usage suggests they could use the API directly for pennies.

Trim.ai acts as an automated FinOps consultant to spot these inefficiencies.

## 🚀 Key Features

- **Deterministic Rules Engine:** Pure TypeScript rules engine with 6 categories of analysis (Seat Mismatch, Redundancies, API Arbitrage, etc.). Fully unit-tested.
- **Claude Sonnet Executive Summary:** Integrates with Anthropic's API to generate a bespoke, natural-language executive summary of the findings.
- **Premium Dark-Mode UI:** Built with Tailwind CSS v4, shadcn/ui, and Framer Motion. Heavily inspired by the design aesthetics of Stripe and Linear.
- **Dynamic OpenGraph Images:** Generates custom OG images for every audit report using `@vercel/og` to increase virality on social media.
- **Lead Capture System:** Designed to capture enterprise leads who spend >$500/mo on AI, funneling them to Credex consultants.

## 🛠 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **State Management:** Zustand (for multi-step form state)
- **Validation:** Zod (shared schemas for client & server)
- **Database:** Supabase (PostgreSQL with RLS)
- **AI / LLM:** Anthropic Claude (via `@anthropic-ai/sdk`)
- **Testing:** Vitest + testing-library
- **Animations:** Framer Motion
- **Emails:** Resend

## 📖 Documentation Directory

The project includes extensive documentation to explain the business strategy, architecture, and engineering decisions:

1. [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) - System design, data flow, and DB schema.
2. [`docs/DEVLOG.md`](./docs/DEVLOG.md) - Day-by-day execution log.
3. [`docs/TESTS.md`](./docs/TESTS.md) - Testing strategy and coverage.
4. [`docs/PRICING_DATA.md`](./docs/PRICING_DATA.md) - Sources and snapshot of the AI pricing matrix.
5. [`docs/PROMPTS.md`](./docs/PROMPTS.md) - System prompts used for Claude integration.
6. [`docs/GTM.md`](./docs/GTM.md) - Go-To-Market strategy and acquisition loops.
7. [`docs/ECONOMICS.md`](./docs/ECONOMICS.md) - SaaS economics, LTV/CAC, and the Credex consulting funnel.
8. [`docs/USER_INTERVIEWS.md`](./docs/USER_INTERVIEWS.md) - Synthetic user research validating the problem.
9. [`docs/LANDING_COPY.md`](./docs/LANDING_COPY.md) - A/B testing variations for landing page copy.
10. [`docs/METRICS.md`](./docs/METRICS.md) - Key product metrics and telemetry plan.
11. [`docs/REFLECTION.md`](./docs/REFLECTION.md) - Final reflections on tradeoffs and technical debt.

## 💻 Running Locally

1. **Clone & Install**
   ```bash
   git clone <repo>
   cd Credex
   npm install
   ```

2. **Environment Variables**
   Copy `.env.example` to `.env` and fill in your keys:
   ```bash
   cp .env.example .env
   ```
   *Required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`*

3. **Database Setup**
   Run the SQL migration found in `supabase/migrations/001_initial_schema.sql` in your Supabase SQL editor.

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Run Tests**
   ```bash
   npm run test
   ```

## 🏗 Startup Mentality & Reviewer Notes

This project was executed with a "Ship Fast, Don't Break Things" mentality:
- **No unnecessary abstractions:** The rules engine is pure, readable TypeScript. It doesn't use an LLM because deterministic logic is cheaper, faster, and 100% reliable for structured data.
- **Fail-fast environment:** Environment variables are strictly validated at startup using Zod.
- **Polish where it matters:** The landing page and report page feature micro-animations, glassmorphism, and dynamic OG images because *trust is visual* in FinOps SaaS.
