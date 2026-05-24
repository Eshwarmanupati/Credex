# Key Product Metrics, KPI Targets & Telemetry Framework

To ensure **Trim.ai** functions as an exceptionally high-performing Product-Led Growth (PLG) wedge for Credex Consulting, we track a comprehensive suite of activation, engagement, and conversion metrics. This telemetry framework enables our growth team to pinpoint drop-offs, optimize UX flows, and quantify our return on investment (ROI).

---

## 📊 Key KPI Targets & Benchmark Metrics

Below are the operational targets we measure our performance against, representing best-in-class B2B PLG benchmarks.

| Funnel Stage | Metric Name | Definition | Target Benchmark |
| :--- | :--- | :--- | :--- |
| **Acquisition** | **Traffic-to-Start** | % of landing page visitors who click "Audit My Spend" | **>= 60%** |
| **Activation** | **Step 1 -> Step 2** | % of users who select tools and proceed to configure | **>= 85%** |
| **Activation** | **Step 2 -> Step 3** | % of users who configure their plans and proceed to review | **>= 75%** |
| **Activation** | **Form Completion** | Overall % of started audits that successfully hit the report | **>= 40%** |
| **Activation** | **Time to Value (TTV)** | Average seconds from landing page to viewing report | **< 90 seconds** |
| **Engagement** | **Report Share Rate** | % of users who click "Share Report" or copy link | **>= 15%** |
| **Engagement** | **Viral Loop (K-factor)** | Average number of new visitors generated per shared report | **>= 0.15** |
| **Conversion** | **Lead Gen Qualification** | % of completed audits with total AI spend >$500/mo | **>= 25%** |
| **Conversion** | **Lead Capture Opt-In** | % of qualified users who request a free Credex consultation | **>= 15%** |

---

## ⚡ Production Telemetry & Event Schema

To support data-driven optimization, Trim.ai's client application tracks the following distinct user action events. In production, these are routed to analytics providers like **PostHog** or **Amplitude**.

### 1. User Engagement Events
- **`landing_page_viewed`**: Triggered when a user lands on `page.tsx`. Tracks traffic sources (UTM parameters).
- **`audit_wizard_started`**: Triggered on Step 1 load. Tracks intent to run an audit.
- **`tool_toggled`**: Tracks which specific tools are being checked/unchecked. Helps identify market-share popularities (e.g., Cursor vs. VS Code Copilot).
- **`step_completed`**: Triggered when a user successfully hits "Continue" on Step 1, 2, or 3. Tracks step-level drop-offs.
  - *Properties:* `stepIndex` (0, 1, 2).

### 2. Audit & Report Events
- **`audit_submitted`**: Triggered when the user hits "Run Audit" on Step 3, triggering the deterministic rules engine API.
- **`report_viewed`**: Triggered when `/report/[slug]` loads successfully.
  - *Properties:* `healthScore`, `savingsAmount`, `recommendationCount`, `isFallbackMode` (boolean, indicating if loaded from localStorage).
- **`report_shared`**: Triggered when the user clicks the "Share Report" button or copies the URL.

### 3. Lead Generation Events
- **`consultation_cta_rendered`**: Triggered when the Credex Consultation banner is displayed to users with savings >$200/mo.
- **`consultation_opt_in_clicked`**: Triggered when the qualified user clicks "Claim Free Consultation" to expand the email input.
- **`lead_submitted`**: Triggered when the lead capture form successfully posts to `/api/lead`.
  - *Properties:* `auditId`, `hasEmail` (boolean).

---

## 🛠️ Telemetry Implementation Recommendations

To maintain low latency and privacy compliance:
1. **Anonymized Analytics:** No personally identifiable information (PII) like email addresses should ever be passed to external telemetry services.
2. **Server-Side Tracking:** Save lead capture conversions and audit completions on the server via Supabase inserts to bypass ad-blockers and maintain 100% accurate conversion records.
