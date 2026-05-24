import { ImageResponse } from 'next/og';
import { createClient } from '@supabase/supabase-js';

export const alt = 'Trim.ai Audit Report';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  try {
    const { slug } = await params;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project')) {
      throw new Error('Supabase not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: audit, error } = await supabase
      .from('audits')
      .select('health_score, savings_amount')
      .eq('share_slug', slug)
      .single();

    if (error || !audit) {
      throw new Error('Report not found');
    }

    const savings = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(audit.savings_amount);

    return new ImageResponse(
      (
        <div
          style={{
            background: 'linear-gradient(to bottom right, #0F172A, #020617)',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'sans-serif',
            color: 'white',
            padding: '40px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#10B981',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                fontWeight: 'bold',
                marginRight: '20px',
              }}
            >
              T
            </div>
            <div style={{ fontSize: '48px', fontWeight: 'bold' }}>Trim.ai</div>
          </div>

          <div
            style={{
              display: 'flex',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '24px',
              padding: '60px',
              width: '80%',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '32px', color: '#94A3B8', marginBottom: '16px' }}>
                Health Score
              </div>
              <div
                style={{
                  fontSize: '96px',
                  fontWeight: 'bold',
                  color: audit.health_score >= 80 ? '#4ADE80' : audit.health_score >= 50 ? '#FBBF24' : '#F87171',
                }}
              >
                {audit.health_score}
              </div>
            </div>

            <div style={{ width: '2px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '32px', color: '#94A3B8', marginBottom: '16px' }}>
                Potential Savings
              </div>
              <div style={{ fontSize: '96px', fontWeight: 'bold', color: '#10B981' }}>
                {savings}<span style={{ fontSize: '48px', color: '#94A3B8' }}>/mo</span>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        ...size,
      }
    );
  } catch {
    return new ImageResponse(
      (
        <div
          style={{
            background: 'linear-gradient(to bottom right, #0F172A, #020617)',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          <div style={{ fontSize: '64px', fontWeight: 'bold' }}>Trim.ai</div>
          <div style={{ fontSize: '32px', color: '#94A3B8', marginTop: '20px' }}>
            AI Spend Audit Report
          </div>
        </div>
      ),
      { ...size }
    );
  }
}
