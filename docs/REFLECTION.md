# Project Reflection & Tradeoffs

Building a production-grade SaaS MVP requires making deliberate technical and product tradeoffs to optimize for speed, reliability, and cost.

## 1. Deterministic Engine vs. LLM Agent

**The Temptation:** It's very easy to just pass user input into an LLM and say "Audit this AI spend and tell me how to save money."

**The Reality:** LLMs are prone to hallucination, struggle with accurate math across multiple tiers, are slow (high latency), and cost money per request.

**Our Approach:** We built a **deterministic rules engine** in pure TypeScript. It's instantly testable, mathematically accurate, and executes in ~1ms for free. 
We *only* use an LLM (Claude Sonnet) at the very end of the pipeline to read the deterministic JSON output and write a narrative, human-friendly executive summary. 

*Tradeoff:* We have to manually update `pricing-data.ts` when SaaS companies change their prices, rather than an LLM attempting to look it up in real-time. For a FinOps product where trust and accuracy are paramount, manual pricing updates are a necessary operational cost.

## 2. In-Memory Rate Limiting vs. Redis

**The Temptation:** Use Upstash Redis for global edge rate limiting.

**Our Approach:** For the MVP, we implemented a simple, in-memory sliding window rate limiter in `src/lib/rate-limit.ts`. 

*Tradeoff:* In a serverless environment (like Vercel), memory doesn't persist consistently across regions or cold starts, meaning our rate limiter isn't perfectly global. However, it is sufficient to prevent catastrophic spam attacks during an MVP launch without adding another external infrastructure dependency.

## 3. Zustand vs. URL State

**The Temptation:** Store the multi-step form state entirely in URL query parameters so it's perfectly shareable mid-flow.

**Our Approach:** We used Zustand (client-side state).

*Tradeoff:* The user can't send a link to step 2 of their unfinished form to a coworker. However, handling complex nested arrays (like multiple tool configurations with variable seats and plans) in URL search params is fragile and limits URL length. Zustand provides a much cleaner, strongly-typed DX for complex form building.

## 4. UI/UX: Dark Mode Only

**The Temptation:** Build light and dark modes.

**Our Approach:** Trim.ai forces a premium dark mode using a carefully curated palette (slate blues and emeralds).

*Tradeoff:* We alienate users who strictly prefer light mode. However, in the developer/FinOps space, dark mode signals "pro tool" and "modern." By focusing only on dark mode, we cut CSS complexity in half and ensured a perfectly polished visual experience.

## What's Next (Technical Debt)

If this project were to continue past MVP:
1. **Move pricing data to the database:** `pricing-data.ts` should be migrated to a Supabase table so non-engineers can update pricing tiers via an admin panel.
2. **Move rate limiting to Redis:** To ensure true global protection against DDOS.
3. **Add Auth:** Currently, reports are secured by a unique slug (security by obscurity). We'd want to add NextAuth/Supabase Auth so users can manage their historical audits.
