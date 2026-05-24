import { NextRequest, NextResponse } from 'next/server';
import { leadSchema } from '@/lib/validations';
import { supabaseAdmin } from '@/lib/supabase/server';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import type { LeadApiResponse, ApiError } from '@/types';

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = rateLimit(`lead_${ip}`, { maxRequests: 3, windowSeconds: 60 });
  if (!rl.allowed) {
    return NextResponse.json<ApiError>(
      { success: false, error: 'Too many requests.' },
      { status: 429 }
    );
  }

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json<ApiError>(
        { success: false, error: 'Invalid JSON body' },
        { status: 400 }
      );
    }
    const parsed = leadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json<ApiError>(
        { success: false, error: 'Invalid input' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin.from('leads').insert({
      email: parsed.data.email,
      company_name: parsed.data.companyName || null,
      team_size: parsed.data.teamSize || null,
      audit_id: parsed.data.auditId || null,
      marketing_consent: parsed.data.marketingConsent,
    });

    if (error) {
      console.error('Lead insert error:', error);
      return NextResponse.json<ApiError>(
        { success: false, error: 'Failed to save' },
        { status: 500 }
      );
    }

    sendConfirmationEmail(parsed.data.email).catch(console.error);

    return NextResponse.json<LeadApiResponse>({
      success: true,
      message: 'Thanks! We\'ll be in touch with optimization tips.',
    });
  } catch (error) {
    console.error('Lead API error:', error);
    return NextResponse.json<ApiError>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function sendConfirmationEmail(email: string) {
  if (!process.env.RESEND_API_KEY) return;
  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'Trim.ai <onboarding@resend.dev>',
      to: email,
      subject: 'Your AI Spend Audit Report is Ready',
      html: `<h2>Thanks for using Trim.ai!</h2>
<p>Your AI spend audit has been saved. You can revisit your report anytime using the share link.</p>
<p>If your team spends $500+/mo on AI tools, reply to this email for a free enterprise consultation with our specialists.</p>
<p>— The Trim.ai Team</p>`,
    });
  } catch (e) {
    console.error('Email send error:', e);
  }
}
