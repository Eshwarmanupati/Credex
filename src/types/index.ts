// =============================================================================
// Trim.ai — Core TypeScript Types
// =============================================================================
// All shared types for the audit engine, form inputs, API responses, and DB.
// Keep this file as the single source of truth for data shapes.
// =============================================================================

/** Supported AI tool identifiers */
export type ToolId =
  | 'cursor'
  | 'github_copilot'
  | 'chatgpt'
  | 'claude'
  | 'openai_api'
  | 'anthropic_api'
  | 'gemini'
  | 'windsurf';

/** Use-case categories for AI tool usage */
export type UseCase =
  | 'coding'
  | 'writing'
  | 'research'
  | 'data_analysis'
  | 'customer_support'
  | 'general';

/** Pricing plan category */
export type PlanCategory = 'ide' | 'chat' | 'api' | 'platform';

// ---------------------------------------------------------------------------
// Pricing Data Types
// ---------------------------------------------------------------------------

export interface PricingTier {
  planId: string;
  tool: ToolId;
  planName: string;
  pricePerSeat: number; // monthly USD per seat
  isPayAsYouGo?: boolean;
  minSeats?: number;
  maxSeats?: number;
  features: string[];
  category: PlanCategory;
}

export interface ToolMeta {
  id: ToolId;
  name: string;
  icon: string; // emoji or icon identifier
  description: string;
  category: PlanCategory;
  plans: PricingTier[];
}

// ---------------------------------------------------------------------------
// Form Input Types
// ---------------------------------------------------------------------------

export interface ToolEntry {
  toolId: ToolId;
  planId: string;
  seats: number;
  monthlySpend: number;
  useCase: UseCase;
}

export interface AuditInput {
  tools: ToolEntry[];
  companyName?: string;
  teamSize?: number;
}

// ---------------------------------------------------------------------------
// Audit Engine Output Types
// ---------------------------------------------------------------------------

export type RecommendationType =
  | 'downgrade_plan'
  | 'upgrade_plan'
  | 'consolidate_seats'
  | 'remove_redundancy'
  | 'switch_to_api'
  | 'switch_from_api'
  | 'cheaper_alternative'
  | 'model_optimization'
  | 'credex_consultation';

export type Severity = 'high' | 'medium' | 'low' | 'info';

export interface Recommendation {
  id: string;
  type: RecommendationType;
  severity: Severity;
  toolId: ToolId;
  title: string;
  description: string;
  currentPlan: string;
  recommendedPlan: string;
  currentMonthlyCost: number;
  optimizedMonthlyCost: number;
  monthlySavings: number;
  annualSavings: number;
  reasoning: string;
}

export interface AuditResult {
  totalCurrentSpend: number;
  totalOptimizedSpend: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  savingsPercentage: number;
  healthScore: number; // 0-100
  recommendations: Recommendation[];
  toolBreakdown: ToolBreakdownItem[];
  redundancies: RedundancyFlag[];
}

export interface ToolBreakdownItem {
  toolId: ToolId;
  toolName: string;
  currentSpend: number;
  optimizedSpend: number;
  savings: number;
}

export interface RedundancyFlag {
  tools: ToolId[];
  reason: string;
  potentialSavings: number;
}

// ---------------------------------------------------------------------------
// API / Database Types
// ---------------------------------------------------------------------------

export interface AuditRecord {
  id: string;
  shareSlug: string;
  toolsInput: ToolEntry[];
  totalCurrent: number;
  totalOptimized: number;
  savingsAmount: number;
  savingsPct: number;
  recommendations: Recommendation[];
  aiSummary: string | null;
  healthScore: number;
  leadId: string | null;
  createdAt: string;
}

export interface LeadRecord {
  id: string;
  email: string;
  companyName: string | null;
  teamSize: number | null;
  totalSpend: number | null;
  totalSavings: number | null;
  auditId: string | null;
  marketingConsent: boolean;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// API Response Types
// ---------------------------------------------------------------------------

export interface AuditApiResponse {
  success: boolean;
  shareSlug: string;
  result: AuditResult;
  aiSummary: string;
}

export interface LeadApiResponse {
  success: boolean;
  message: string;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
}
