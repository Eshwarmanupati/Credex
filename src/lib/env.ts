// =============================================================================
// Trim.ai — Environment Variable Validation
// =============================================================================
// Uses Zod to validate all required environment variables at startup.
// Fails fast with clear error messages if any are missing.
// =============================================================================

import { z } from 'zod';

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),

  // Anthropic
  ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-', 'ANTHROPIC_API_KEY must start with sk-ant-'),

  // Resend
  RESEND_API_KEY: z.string().startsWith('re_', 'RESEND_API_KEY must start with re_'),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    const errors = parsed.error.flatten().fieldErrors;
    for (const [key, messages] of Object.entries(errors)) {
      console.error(`  ${key}: ${messages?.join(', ')}`);
    }
    throw new Error('Missing or invalid environment variables. Check .env file.');
  }

  return parsed.data;
}

export const env = validateEnv();
