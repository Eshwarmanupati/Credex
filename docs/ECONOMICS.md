# SaaS Economics & Lead Generation Funnel

Trim.ai is built as a lead-generation wedge for a higher-ticket service business (Credex Consulting). Therefore, the standard SaaS economics (MRR, Churn) are replaced by Lead Gen economics.

## The Funnel

1. **Top of Funnel (Website Visitors):** Acquired via PLG loops, social shares, and Product Hunt.
   - *Target Cost:* $0 (Organic)
2. **Activation (Run Audit):** Visitors who complete the 3-step form.
   - *Expected Conversion:* 40% (No signup required, low friction).
3. **Qualification (High Spend):** Users whose audit reveals >$500/mo spend.
   - *Expected Rate:* 25% of activated users.
4. **Lead Capture (Consultation Request):** Qualified users who enter their email.
   - *Expected Conversion:* 15% of qualified users.

## Unit Economics Example

Assume 10,000 visitors per month:
- 4,000 complete the audit.
- 1,000 are qualified (high spend).
- 150 request a consultation.

If Credex closes 10% of these consultations for a $15,000 enterprise engagement:
- 15 closed deals * $15,000 = **$225,000 in generated revenue.**

## Hosting Costs

Because Trim.ai relies on a deterministic engine, hosting costs are incredibly low:
- **Vercel (Hosting/Compute):** $20/mo (Pro plan)
- **Supabase (Database):** $25/mo (Pro plan)
- **Anthropic API (Claude):** ~$0.01 per audit summary. (4,000 audits = $40/mo)

*Total Operating Cost:* ~$85/month.

## ROI

Spending $85/month to maintain an automated system that generates 150 highly qualified enterprise leads per month represents an massive ROI compared to traditional B2B outbound marketing.
