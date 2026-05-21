'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { TOOLS } from '@/lib/pricing-data';
import type { AuditRecord, Recommendation, ToolId } from '@/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';

export default function ReportPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [audit, setAudit] = useState<AuditRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showLead, setShowLead] = useState(false);
  const [leadEmail, setLeadEmail] = useState('');
  const [leadSent, setLeadSent] = useState(false);

  useEffect(() => {
    async function fetchAudit() {
      let cachedRecord: any = null;

      // First, try loading from localStorage as an instant/offline fallback!
      try {
        const cached = localStorage.getItem(`trim_audit_${slug}`);
        if (cached) {
          cachedRecord = JSON.parse(cached);
          setAudit(cachedRecord);
          setLoading(false);
        }
      } catch (e) {
        console.error('Failed to read from localStorage:', e);
      }

      try {
        const { data, error: dbError } = await supabase
          .from('audits')
          .select('*')
          .eq('share_slug', slug)
          .single();

        if (dbError || !data) {
          if (cachedRecord) {
            // If we have cached fallback, do not show error page
            return;
          }
          setError('Report not found');
          setLoading(false);
          return;
        }

        const record = {
          id: data.id,
          shareSlug: data.share_slug,
          toolsInput: data.tools_input,
          totalCurrent: data.total_current,
          totalOptimized: data.total_optimized,
          savingsAmount: data.savings_amount,
          savingsPct: data.savings_pct,
          recommendations: data.recommendations,
          aiSummary: data.ai_summary,
          healthScore: data.health_score,
          leadId: data.lead_id,
          createdAt: data.created_at,
        };

        // Update local cache
        try {
          localStorage.setItem(`trim_audit_${slug}`, JSON.stringify(record));
        } catch (e) {}

        setAudit(record);
        setLoading(false);
      } catch (err) {
        console.error('Fetch error:', err);
        if (!cachedRecord) {
          setError('Report not found');
          setLoading(false);
        }
      }
    }
    fetchAudit();
  }, [slug]);

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function submitLead() {
    if (!leadEmail) return;
    try {
      await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: leadEmail, auditId: audit?.id }),
      });
      setLeadSent(true);
    } catch {
      // silent fail
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading report...
        </div>
      </main>
    );
  }

  if (error || !audit) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Report not found</h1>
          <p className="text-muted-foreground">This audit link may have expired or doesn&apos;t exist.</p>
        </div>
      </main>
    );
  }

  const chartData = audit.recommendations
    .filter((r: Recommendation) => r.monthlySavings > 0)
    .slice(0, 6)
    .map((r: Recommendation) => ({
      name: TOOLS[r.toolId as ToolId]?.name || r.toolId,
      current: r.currentMonthlyCost,
      optimized: r.optimizedMonthlyCost,
    }));

  const severityColor: Record<string, string> = {
    high: 'text-red-400 bg-red-400/10 border-red-400/30',
    medium: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
    low: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
    info: 'text-primary bg-primary/10 border-primary/30',
  };

  const scoreColor = audit.healthScore >= 80 ? 'text-green-400' : audit.healthScore >= 50 ? 'text-amber-400' : 'text-red-400';

  return (
    <main className="min-h-screen px-4 py-12 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">AI Spend Audit Report</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Generated {new Date(audit.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <button
            onClick={copyLink}
            className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
          >
            {copied ? '✓ Copied!' : '🔗 Share Report'}
          </button>
        </div>

        {/* Score + Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* Health Score */}
          <div className="p-6 rounded-xl border border-border bg-card text-center">
            <div className="text-sm text-muted-foreground mb-2">Health Score</div>
            <div className={`text-5xl font-bold ${scoreColor}`}>{audit.healthScore}</div>
            <div className="text-xs text-muted-foreground mt-1">out of 100</div>
          </div>

          {/* Monthly Savings */}
          <div className="p-6 rounded-xl border border-border bg-card text-center">
            <div className="text-sm text-muted-foreground mb-2">Monthly Savings</div>
            <div className="text-3xl font-bold text-primary">{formatCurrency(audit.savingsAmount)}</div>
            <div className="text-xs text-muted-foreground mt-1">{formatPercentage(audit.savingsPct)} reduction</div>
          </div>

          {/* Annual Impact */}
          <div className="p-6 rounded-xl border border-border bg-card text-center">
            <div className="text-sm text-muted-foreground mb-2">Annual Impact</div>
            <div className="text-3xl font-bold text-foreground">{formatCurrency(audit.savingsAmount * 12)}</div>
            <div className="text-xs text-muted-foreground mt-1">projected yearly savings</div>
          </div>
        </div>

        {/* AI Summary */}
        {audit.aiSummary && (
          <div className="p-5 rounded-xl border border-primary/20 bg-primary/5 mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-primary">✦ AI Analysis</span>
            </div>
            <p className="text-sm leading-relaxed text-foreground/90">{audit.aiSummary}</p>
          </div>
        )}

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="p-5 rounded-xl border border-border bg-card mb-8">
            <h2 className="text-lg font-semibold mb-4">Current vs. Optimized Spend</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} barGap={4}>
                <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value: any) => [`$${value}`, '']}
                />
                <Bar dataKey="current" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} name="Current" />
                <Bar dataKey="optimized" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Optimized" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recommendations */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Recommendations ({audit.recommendations.length})</h2>
          <div className="space-y-3">
            {audit.recommendations.map((rec: Recommendation, i: number) => (
              <motion.div
                key={rec.id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-4 rounded-xl border border-border bg-card"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${severityColor[rec.severity]}`}>
                        {rec.severity.toUpperCase()}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {TOOLS[rec.toolId as ToolId]?.icon} {TOOLS[rec.toolId as ToolId]?.name}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm">{rec.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs">
                      <span className="text-muted-foreground line-through">{rec.currentPlan}</span>
                      <span>→</span>
                      <span className="text-primary font-medium">{rec.recommendedPlan}</span>
                    </div>
                  </div>
                  {rec.monthlySavings > 0 && (
                    <div className="text-right shrink-0">
                      <div className="text-lg font-bold text-primary">{formatCurrency(rec.monthlySavings)}</div>
                      <div className="text-xs text-muted-foreground">/month</div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Lead Capture / Credex CTA */}
        {audit.savingsAmount > 200 && !leadSent && (
          <div className="p-6 rounded-xl border border-primary/30 bg-primary/5 text-center mb-8">
            <h3 className="text-lg font-bold mb-2">💰 You could save {formatCurrency(audit.savingsAmount * 12)}/year</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get a free consultation with Credex specialists to negotiate enterprise rates and unlock additional savings.
            </p>
            {!showLead ? (
              <button
                onClick={() => setShowLead(true)}
                className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
              >
                Claim Free Consultation
              </button>
            ) : (
              <div className="flex gap-2 max-w-sm mx-auto">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-sm"
                />
                <button
                  onClick={submitLead}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90"
                >
                  Submit
                </button>
              </div>
            )}
          </div>
        )}

        {leadSent && (
          <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 text-center mb-8">
            <p className="text-sm text-primary font-medium">✓ Thanks! A Credex specialist will reach out within 24 hours.</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground py-8 border-t border-border">
          <p>Powered by <span className="font-semibold text-foreground">Trim.ai</span> — The AI Spend Audit Tool</p>
        </div>
      </motion.div>
    </main>
  );
}
