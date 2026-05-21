# System Architecture

Trim.ai is built on a modern, serverless architecture utilizing Next.js App Router for both frontend and backend API routes, backed by Supabase for PostgreSQL data persistence.

## Core Design Principles

1. **Deterministic First, AI Second:**
   The core value proposition (finding pricing inefficiencies) is deterministic. It relies on a normalized pricing database (`src/lib/pricing-data.ts`) and a pure-function rules engine (`src/lib/audit-engine.ts`). 
   *Why?* LLMs are slow, non-deterministic, and expensive. Math is fast, predictable, and free. We only use AI (Claude) at the very end to write a nice executive summary of the deterministic findings.

2. **Single Source of Truth:**
   Types and schemas are defined centrally. `src/types/index.ts` holds TS interfaces, while `src/lib/validations.ts` holds Zod schemas. Zod is used for both client-side form validation (via `react-hook-form` + `zodResolver`) and server-side API request validation.

3. **Fail-Fast Startup:**
   `src/lib/env.ts` validates environment variables using Zod. If a required key (like `SUPABASE_SERVICE_ROLE_KEY`) is missing, the application crashes immediately in development, rather than failing silently later.

## Data Flow: The Audit Pipeline

1. **Client Collection:** User inputs data via a multi-step Zustand-managed form (`/audit`).
2. **API Submission:** Client POSTs structured `AuditInput` to `/api/audit`.
3. **Server Validation:** Next.js route validates payload using Zod. Rate limiting is applied.
4. **Engine Execution:** Server passes payload to `runAudit()`. Engine runs 6 categories of rules and outputs `AuditResult`.
5. **AI Summarization:** Server calls Anthropic Claude API (`generateAuditSummary`) to summarize the `AuditResult`. (Falls back to template if API fails).
6. **Persistence:** Server generates a nanoid slug and saves the entire JSON structure to Supabase.
7. **Delivery:** API returns the slug to the client, which redirects to the generated report page (`/report/[slug]`).

## Database Schema (Supabase)

### `audits` Table
- `id` (uuid, PK)
- `share_slug` (text, unique) - e.g., "tr_8f92j1"
- `tools_input` (jsonb) - The raw input data
- `total_current`, `total_optimized`, `savings_amount`, `savings_pct` (numeric)
- `health_score` (int)
- `recommendations` (jsonb) - The structured output from the rules engine
- `tool_breakdown` (jsonb)
- `redundancies` (jsonb)
- `ai_summary` (text)
- `created_at` (timestamp)

*Security:* Protected by Row Level Security (RLS). SELECT is allowed for anyone with the unique `share_slug`. INSERT/UPDATE is restricted to the Service Role (server-side only).

### `leads` Table
- `id` (uuid, PK)
- `email` (text)
- `company_name` (text, nullable)
- `audit_id` (uuid, FK, nullable)
- `created_at` (timestamp)

*Security:* RLS restricts all access to the Service Role only. No client can read leads.

## Security & Reliability Measures

- **Rate Limiting:** In-memory sliding window rate limiter protects `/api/audit` and `/api/lead` from abuse.
- **Graceful Fallbacks:** If the Anthropic API fails or timeouts, the system falls back to a deterministic, template-based summary.
- **Type Safety:** Strict TypeScript rules enforced across the codebase.
