import { NextRequest, NextResponse } from 'next/server';
import { auditInputSchema } from '@/lib/validations';
import { runAudit } from '@/lib/audit-engine';
import { generateAuditSummary } from '@/lib/generate-summary';
import { supabaseAdmin } from '@/lib/supabase/server';
import { generateShareSlug } from '@/lib/utils';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import type { AuditApiResponse, ApiError } from '@/types';

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = rateLimit(ip, { maxRequests: 5, windowSeconds: 60 });
  if (!rl.allowed) {
    return NextResponse.json<ApiError>(
      { success: false, error: 'Too many requests. Please wait a moment.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json<ApiError>(
        { success: false, error: 'Invalid JSON body', code: 'PARSE_ERROR' },
        { status: 400 }
      );
    }
    const parsed = auditInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json<ApiError>(
        { success: false, error: 'Invalid input', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    const result = runAudit(parsed.data);
    const aiSummary = await generateAuditSummary(result);
    const shareSlug = generateShareSlug();

    try {
      await supabaseAdmin.from('audits').insert({
        share_slug: shareSlug,
        tools_input: parsed.data.tools,
        total_current: result.totalCurrentSpend,
        total_optimized: result.totalOptimizedSpend,
        savings_amount: result.totalMonthlySavings,
        savings_pct: result.savingsPercentage,
        health_score: result.healthScore,
        recommendations: result.recommendations,
        tool_breakdown: result.toolBreakdown,
        redundancies: result.redundancies,
        ai_summary: aiSummary,
      });
    } catch (dbError) {
      console.error('Supabase insert error:', dbError);
    }

    return NextResponse.json<AuditApiResponse>({
      success: true,
      shareSlug,
      result,
      aiSummary,
    });
  } catch (error) {
    console.error('Audit API error:', error);
    return NextResponse.json<ApiError>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
