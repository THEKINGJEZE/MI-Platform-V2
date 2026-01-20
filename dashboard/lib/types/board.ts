/**
 * Board Types - Stub for V2 Migration
 *
 * These are minimal types to allow board components to compile.
 * Full implementations deferred to future phases.
 */

// =============================================================================
// KPI TYPES
// =============================================================================

export type KPIStatus = 'good' | 'warning' | 'critical' | 'neutral';

export interface KPI {
  id: string;
  label: string;
  value: number;
  target?: number;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  status?: KPIStatus;
  details?: string[];
  unit?: string;
  format?: 'number' | 'currency' | 'percentage';
}

export interface KPIData {
  value: number;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  label: string;
  details?: string[];
}

export interface BoardKPIsResponse {
  kpis: KPI[];
  lastUpdated: string;
}

// =============================================================================
// SIGNAL TYPES
// =============================================================================

export interface BoardSignal {
  id: string;
  type: string;
  title: string;
  description?: string;
  source: string;
  detectedAt: string;
  forceId?: string;
  forceName?: string;
  priority?: 'hot' | 'high' | 'medium' | 'low';
  status?: string;
}

export interface StrategicSignal extends BoardSignal {
  impact: 'high' | 'medium' | 'low';
  actionRequired: boolean;
  recommendation?: string;
}

export interface SignalFilters {
  types: string[];
  sources: string[];
  regions: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface SignalsSummaryStats {
  total: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
  trend: 'up' | 'down' | 'stable';
}

// =============================================================================
// BUDGET CYCLE
// =============================================================================

export interface BudgetPhase {
  name: string;
  shortName?: string;
  startMonth: number;
  endMonth: number;
  months?: number;
  description: string;
}

export interface BudgetCycleData {
  currentPhase: string;
  phases: BudgetPhase[];
  fiscalYearStart: number;
  fiscalYearEnd: number;
}

// =============================================================================
// FORCE RANKING
// =============================================================================

export type EngagementStatus = 'active' | 'warm' | 'cold' | 'none';
export type RelationshipStatus = 'strong' | 'good' | 'developing' | 'new' | 'none';

export interface ForceRanking {
  // Core identifiers
  id?: string;
  forceId: string;
  forceName: string;
  name?: string;

  // Location
  region?: string;

  // Rankings
  rank: number;
  priorityRank?: number;
  priorityScore: number;
  opportunityScore?: number;

  // Counts
  signalCount: number;
  signalCount90d?: number;
  opportunityCount: number;

  // Status
  hmicfrsStatus?: string;
  engagementStatus?: EngagementStatus;
  relationshipStatus?: RelationshipStatus;
  engagementHeat?: number;
  relationshipHealth?: number;

  // Key signal info
  keySignal?: string;
  keySignalDate?: string;

  // Engagement
  lastContact?: string;
}

// =============================================================================
// PIPELINE
// =============================================================================

export interface PipelineStage {
  name: string;
  count: number;
  value: number;
  color: string;
}

export interface PipelineData {
  stages: PipelineStage[];
  totalValue: number;
  totalCount: number;
}

export interface PipelineScorecard {
  totalOpportunities: number;
  totalValue: number;
  averageDealSize: number;
  winRate: number;
  stages: PipelineStage[];
}

// =============================================================================
// CONVERSION & METRICS
// =============================================================================

export interface ConversionData {
  stage: string;
  rate: number;
  count: number;
}

export interface ConversionMetrics {
  stages: ConversionData[];
  overallRate: number;
  avgTimeToClose: number;
  trends: {
    stage: string;
    change: number;
  }[];
}

// =============================================================================
// REVENUE
// =============================================================================

export interface RevenueForecast {
  month: string;
  projected: number;
  actual?: number;
  target?: number;
}

// =============================================================================
// POLICY
// =============================================================================

export type PolicyType = 'regulation' | 'guidance' | 'initiative' | 'reform';
export type PolicyStatus = 'draft' | 'active' | 'pending' | 'completed' | 'archived';
export type PolicyImpact = 'high' | 'medium' | 'low';

export interface PolicyItem {
  id: string;
  title: string;
  type?: PolicyType;
  status: PolicyStatus;
  deadline?: string;
  impact?: PolicyImpact;
  description?: string;
}

// =============================================================================
// TRENDS & RECOMMENDATIONS
// =============================================================================

export interface WeeklyTrend {
  week: string;
  signalCount: number;
  opportunityCount: number;
  conversionRate: number;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  actionUrl?: string;
}

// =============================================================================
// PROCUREMENT
// =============================================================================

export interface ProcurementOpportunity {
  id: string;
  title: string;
  value: number;
  deadline: string;
  status: string;
  forceId?: string;
  forceName?: string;
}

export interface ProcurementSummary {
  total: number;
  byStatus: Record<string, number>;
  upcoming: ProcurementOpportunity[];
  totalValue: number;
}
