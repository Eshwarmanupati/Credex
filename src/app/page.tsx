import Link from "next/link";
import { getAllTools } from "@/lib/pricing-data";
import { ToolIcon } from "@/components/ui/tool-icon";

export default function HomePage() {
  const tools = getAllTools();
  
  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <nav className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
            T
          </div>
          <span className="font-semibold text-lg tracking-tight">Trim.ai</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/audit" className="text-sm font-medium hover:text-primary transition-colors">
            Run Audit
          </Link>
        </div>
      </nav>

      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-32 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/60 bg-card/40 backdrop-blur-sm text-sm text-muted-foreground mb-8 animate-fade-in">
          <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
          The FinOps dashboard for the AI era
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
          Your AI stack is <br className="hidden sm:block" />
          <span className="text-gradient">bleeding money.</span>
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10 animate-fade-in" style={{ animationDelay: '200ms' }}>
          Discover overlapping subscriptions, optimize seat plans, and find cheaper
          API alternatives. Audit your entire AI spend in under 2 minutes.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <Link
            href="/audit"
            className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] glow-primary"
          >
            Audit My Spend — Free
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <span className="text-sm text-muted-foreground flex items-center gap-1.5">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path></svg>
            No credit card required
          </span>
        </div>

        <div className="w-full max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '400ms' }}>
          <p className="text-sm text-muted-foreground font-medium mb-6 uppercase tracking-wider">Works with your favorite AI tools</p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 opacity-70 grayscale transition-all hover:grayscale-0">
             {tools.slice(0, 8).map(tool => (
               <div key={tool.id} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border/50">
                 <ToolIcon toolId={tool.id} className="w-5 h-5 text-foreground" />
                 <span className="font-medium text-sm">{tool.name}</span>
               </div>
             ))}
          </div>
        </div>
      </section>

      <section className="w-full bg-secondary/50 border-y border-border/50 py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Stop overpaying for AI</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">Our deterministic rules engine analyzes your stack against current pricing data to find hidden waste.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass p-8 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary text-xl mb-6">
                👥
              </div>
              <h3 className="text-xl font-bold mb-3">Seat Optimization</h3>
              <p className="text-muted-foreground leading-relaxed">
                Paying for Enterprise features you don&apos;t use? We detect oversized team plans and recommend right-sized individual or pro tiers based on your actual headcount.
              </p>
            </div>
            
            <div className="glass p-8 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary text-xl mb-6">
                🔄
              </div>
              <h3 className="text-xl font-bold mb-3">Redundancy Detection</h3>
              <p className="text-muted-foreground leading-relaxed">
                Using ChatGPT Plus and Claude Pro? Paying for Cursor and Copilot? We identify overlapping capabilities so you can consolidate to a single best-in-class tool.
              </p>
            </div>

            <div className="glass p-8 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary text-xl mb-6">
                🔌
              </div>
              <h3 className="text-xl font-bold mb-3">API Arbitrage</h3>
              <p className="text-muted-foreground leading-relaxed">
                Sometimes $20/month subscriptions are cheaper than API calls. Sometimes it&apos;s the other way around. We analyze your spend to recommend the most cost-effective interface.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-24 text-center">
        <div className="glass p-12 rounded-3xl border-primary/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 relative z-10">Spending over $500/month on AI?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 relative z-10">
            High-volume teams qualify for enterprise pricing. Get a free consultation with Credex specialists to negotiate volume discounts and unified billing.
          </p>
          <Link
            href="/audit"
            className="inline-flex items-center justify-center px-8 py-3 rounded-lg border-2 border-primary text-primary font-semibold hover:bg-primary hover:text-primary-foreground transition-colors relative z-10"
          >
            Check Eligibility
          </Link>
        </div>
      </section>

      <footer className="w-full border-t border-border/50 py-12 text-center text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center text-foreground font-bold text-xs">
            T
          </div>
          <span className="font-semibold text-foreground">Trim.ai</span>
        </div>
        <p className="text-sm">Built for Credex WebDev 2026. A production-grade SaaS MVP.</p>
      </footer>
    </main>
  );
}
