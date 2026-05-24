# Go-To-Market Strategy

Trim.ai is designed as a **Product-Led Growth (PLG) wedge** into the broader Credex enterprise consulting business. 

## The Wedge Strategy

We give away the core value (the AI spend audit) completely for free, with no signup required. This removes all friction and encourages viral sharing among engineering managers and CTOs.

## Acquisition Channels

### 1. Product Hunt Launch
- **Hook:** "Stop paying for ChatGPT Plus and Claude Pro for the same developers. Trim.ai audits your AI stack in 2 minutes."
- **Asset:** High-quality, fast-paced demo video showing a user saving $500/mo.

### 2. Engineering Twitter / LinkedIn
- Content strategy focusing on "AI Stack Sprawl."
- Visualizing data: e.g., "40% of teams pay for both Copilot and Cursor. Here is why that is a mistake."
- Dynamic OG Images (implemented via `@vercel/og`) ensure that when an Engineering Manager shares their audit on Slack/Twitter, the preview shows the exact dollar amount they saved and their health score, prompting others to check their own score.

## The Viral Loop

1. CTO enters their 5 tools on Trim.ai.
2. Trim.ai outputs a report showing they are wasting $1,200/mo on overpowered Claude Max licenses and redundant Copilot seats.
3. CTO clicks "Share Report" and drops the link into their `#engineering-managers` Slack channel.
4. The Slack preview shows the dynamic OG image: "Health Score: 45 | Potential Savings: $1,200/mo".
5. EMs click the link, read the report, and then click "Audit My Stack" at the top to run it for their specific squads.

## Monetization (The Credex Funnel)

Trim.ai does not charge a SaaS fee. Instead, it serves as a lead generation tool for Credex Enterprise Consulting.

- **Trigger:** If the rules engine detects `totalSpend > $500/mo` OR `savingsAmount > $200/mo`, a CTA appears at the bottom of the report.
- **Offer:** "Claim Free Consultation. Credex specialists can negotiate enterprise volume discounts for you."
- **Conversion:** User enters their email (`/api/lead`). This is saved to Supabase and pinged to the sales team.
