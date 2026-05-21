# Key Product Metrics & Telemetry

To ensure Trim.ai is functioning as an effective PLG wedge, we track the following key metrics.

## 1. Top of Funnel (Acquisition)
- **Unique Visitors:** Total traffic to `page.tsx`.
- **Conversion to Audit:** Percentage of visitors who click "Audit My Spend".
- **Source Attribution:** Tracking UTM parameters to see if traffic came from Twitter, Product Hunt, or direct share links.

## 2. Activation (The Audit)
- **Completion Rate:** Percentage of users who finish all 3 steps of the form. (Drop-off points indicate friction).
- **Time to Value:** Average time taken from landing on step 1 to viewing the report (Target: < 2 minutes).

## 3. Engagement (The Report)
- **Share Rate:** Percentage of generated reports where the "Share Report" button is clicked.
- **Viral Coefficient (K-factor):** Number of new unique visitors generated per shared report.

## 4. Monetization (Lead Gen)
- **Qualification Rate:** Percentage of audits that exceed the $500/mo spend threshold.
- **Lead Capture Rate:** Percentage of qualified users who submit their email for a Credex consultation.

## Future Telemetry Implementation
Currently, telemetry is inferred from database rows in Supabase (e.g., counting rows in `audits` and `leads`). For production scaling, we recommend integrating PostHog or Amplitude for event-based tracking on UI clicks (e.g., `audit_started`, `step_completed`, `report_shared`).
