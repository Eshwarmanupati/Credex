// =============================================================================
// Trim.ai — Zod Validation Schemas
// =============================================================================
// Shared validation schemas for form inputs and API requests.
// Used on both client (React Hook Form) and server (API routes).
// =============================================================================

import { z } from 'zod';

export const toolIdSchema = z.enum([
  'cursor',
  'github_copilot',
  'chatgpt',
  'claude',
  'openai_api',
  'anthropic_api',
  'gemini',
  'windsurf',
]);

export const useCaseSchema = z.enum([
  'coding',
  'writing',
  'research',
  'data_analysis',
  'customer_support',
  'general',
]);

export const toolEntrySchema = z.object({
  toolId: toolIdSchema,
  planId: z.string().min(1, 'Please select a plan'),
  seats: z.number().int().min(1, 'At least 1 seat required').max(10000, 'Maximum 10,000 seats'),
  monthlySpend: z.number().min(0, 'Spend cannot be negative').max(1000000, 'Maximum $1M'),
  useCase: useCaseSchema,
});

export const auditInputSchema = z.object({
  tools: z
    .array(toolEntrySchema)
    .min(1, 'Select at least one AI tool')
    .max(20, 'Maximum 20 tool entries'),
  companyName: z.string().max(255).optional(),
  teamSize: z.number().int().min(1).max(100000).optional(),
});

export const leadSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  companyName: z.string().max(255).optional(),
  teamSize: z.number().int().min(1).max(100000).optional(),
  auditId: z.string().uuid().optional(),
  marketingConsent: z.boolean().default(false),
});

export type AuditInputSchema = z.infer<typeof auditInputSchema>;
export type LeadSchema = z.infer<typeof leadSchema>;
export type ToolEntrySchema = z.infer<typeof toolEntrySchema>;
