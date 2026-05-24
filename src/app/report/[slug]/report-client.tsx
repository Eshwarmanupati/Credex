'use client';

import { useState } from 'react';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { TOOLS } from '@/lib/pricing-data';
import type { AuditRecord, Recommendation, ToolId } from '@/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ToolIcon } from '@/components/ui/tool-icon';

interface ReportClientProps {
  audit: AuditRecord;
}

export default function ReportClient({ audit }: ReportClientProps) {
  const [copied, setCopied] = useState(false);
  const [showLead, setShowLead] = useState(false);
  const [leadEmail, setLeadEmail] = useState('');
  const [leadSent, setLeadSent] = useState(false);

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
        body: JSON.stringify({ email: leadEmail, auditId: audit.id }),
      });
      setLeadSent(true);
    } catch {
      // silent fail
    }
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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">AI Spend Audit Report</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Generated {new Date(audit.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/audit"
            className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
          >
            ✨ New Audit
          </Link>
          <button
            onClick={copyLink}
            className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
          >
            {copied ? '✓ Copied!' : '🔗 Share Report'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-6 rounded-xl border border-border bg-card text-center">
          <div className="text-sm text-muted-foreground mb-2">Health Score</div>
          <div className={`text-5xl font-bold ${scoreColor}`}>{audit.healthScore}</div>
          <div className="text-xs text-muted-foreground mt-1">out of 100</div>
        </div>

        <div className="p-6 rounded-xl border border-border bg-card text-center">
          <div className="text-sm text-muted-foreground mb-2">Monthly Savings</div>
          <div className="text-3xl font-bold text-primary">{formatCurrency(audit.savingsAmount)}</div>
          <div className="text-xs text-muted-foreground mt-1">{formatPercentage(audit.savingsPct)} reduction</div>
        </div>

        <div className="p-6 rounded-xl border border-border bg-card text-center">
          <div className="text-sm text-muted-foreground mb-2">Annual Impact</div>
          <div className="text-3xl font-bold text-foreground">{formatCurrency(audit.savingsAmount * 12)}</div>
          <div className="text-xs text-muted-foreground mt-1">projected yearly savings</div>
        </div>
      </div>

      {audit.aiSummary && (
        <div className="p-5 rounded-xl border border-primary/20 bg-primary/5 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-primary">✦ AI Analysis</span>
          </div>
          <p className="text-sm leading-relaxed text-foreground/90">{audit.aiSummary}</p>
        </div>
      )}

      {chartData.length > 0 && (
        <div className="p-6 rounded-xl border border-border bg-card mb-8">
          <h2 className="text-lg font-semibold mb-4 text-foreground">Current vs. Optimized Spend</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} barGap={6} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="currentSpendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--destructive)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--destructive)" stopOpacity={0.08} />
                </linearGradient>
                <linearGradient id="optimizedSpendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.2} vertical={false} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} 
                axisLine={false} 
                tickLine={false} 
              />
              <YAxis 
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} 
                axisLine={false} 
                tickLine={false} 
                tickFormatter={(v) => `$${v}`} 
              />
              <Tooltip
                cursor={false}
                isAnimationActive={false}
                contentStyle={{ 
                  backgroundColor: 'var(--card)', 
                  border: '1px solid var(--border)', 
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
                  backdropFilter: 'blur(8px)',
                  padding: '10px 14px',
                }}
                labelStyle={{ color: 'var(--foreground)', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}
                itemStyle={{ color: 'var(--foreground)', fontSize: '12px', padding: '2px 0' }}
                formatter={(value, name) => [`$${value ?? 0}`, name]}
              />
              <Legend 
                verticalAlign="top" 
                height={40} 
                iconType="circle" 
                iconSize={8}
                wrapperStyle={{ 
                  fontSize: 12, 
                  color: 'var(--muted-foreground)',
                  paddingBottom: '16px'
                }}
              />
              <Bar 
                dataKey="current" 
                fill="url(#currentSpendGrad)" 
                stroke="var(--destructive)" 
                strokeWidth={1.5}
                strokeOpacity={0.7}
                radius={[6, 6, 0, 0]} 
                name="Current Spend" 
                maxBarSize={48} 
                isAnimationActive={true}
                animationDuration={500}
                animationEasing="ease-out"
              />
              <Bar 
                dataKey="optimized" 
                fill="url(#optimizedSpendGrad)" 
                stroke="var(--primary)" 
                strokeWidth={1.5}
                strokeOpacity={0.8}
                radius={[6, 6, 0, 0]} 
                name="Optimized Spend" 
                maxBarSize={48} 
                isAnimationActive={true}
                animationDuration={500}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

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
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <ToolIcon toolId={rec.toolId} className="w-3.5 h-3.5" />
                      <span>{TOOLS[rec.toolId as ToolId]?.name}</span>
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
                aria-label="Email address for consultation"
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

      <div className="text-center text-xs text-muted-foreground py-8 border-t border-border">
        <p>Powered by <span className="font-semibold text-foreground">Trim.ai</span> — The AI Spend Audit Tool</p>
      </div>
    </motion.div>
  );
}
