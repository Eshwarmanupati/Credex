import { createClient } from '@supabase/supabase-js';
import type { Metadata } from 'next';
import type { AuditRecord } from '@/types';
import ReportClient from './report-client';
import ReportFallback from './report-fallback';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || url.includes('your-project')) return null;

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function getAudit(slug: string): Promise<AuditRecord | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('audits')
      .select('*')
      .eq('share_slug', slug)
      .single();

    if (error || !data) return null;

    return {
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
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const audit = await getAudit(slug);

  if (!audit) {
    return {
      title: 'AI Spend Audit Report — Trim.ai',
      description: 'View your personalized AI spend audit report with actionable recommendations.',
    };
  }

  const savings = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(audit.savingsAmount);

  const annual = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(audit.savingsAmount * 12);

  const title = `Save ${savings}/mo on AI Tools — Trim.ai Audit`;
  const description = `This audit found ${savings}/mo (${Math.round(audit.savingsPct)}%) in potential savings across ${audit.recommendations.length} recommendations. Health score: ${audit.healthScore}/100. Annual impact: ${annual}.`;

  return {
    title,
    description,
    openGraph: { title, description, type: 'article' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function ReportPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const audit = await getAudit(slug);

  if (audit) {
    return (
      <main className="min-h-screen px-4 py-12 max-w-4xl mx-auto">
        <ReportClient audit={audit} />
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-12 max-w-4xl mx-auto">
      <ReportFallback slug={slug} />
    </main>
  );
}
