/**
 * Zod schemas for IdeaPotential assessment data validation
 */

import { z } from "zod";

// Checklist factors enum
export const ChecklistKeySchema = z.enum([
  "problem_clarity",
  "market_pain_mentions",
  "outcome_gap",
  "competitive_moat",
  "team_solution_fit",
  "solution_evidence",
  "team_market_fit",
  "early_demand",
  "traffic_authority",
  "marketing_product_fit",
]);

// Evidence schema
export const EvidenceSchema = z.object({
  evidence_id: z.string(),
  type: z.enum([
    "manual_input",
    "auto_fetch",
    "peer_proof",
    "prospect_pulse",
    "seo_metric",
    "social_metric",
    "survey_response",
    "conversation",
    "user_statement",
    "market_research",
    "competitive_analysis",
    "demo_feedback",
    "metrics",
    "other",
  ]),
  source: z.string().optional(),
  value: z.unknown(),
  confidence: z.number().min(0).max(1).optional(),
  notes: z.string().optional(),
  timestamp: z.string(),
  added_by: z.enum(["agent", "system", "user"]),
});

// Checklist item schema
export const ChecklistItemSchema = z.object({
  score: z.number().min(0).max(5).nullable(),
  evidence_strength: z.union([
    z.literal(0),
    z.literal(1),
    z.literal(2),
    z.literal(3),
  ]),
  evidence: z.array(EvidenceSchema),
  last_scored_at: z.string().optional(),
});

// Derived scores schema
export const DerivedScoresSchema = z.object({
  potential_score: z.number().min(0).max(100),
  actualization_score: z.number().min(0).max(100),
  potential_bucket: z.enum(["unknown", "red", "yellow", "green"]),
  actualization_bucket: z.enum(["unknown", "red", "yellow", "green"]),
});

// Idea metrics schema
export const IdeaMetricsSchema = z.object({
  waitlist_signups: z.number().optional(),
  mrr: z.number().optional(),
  lois: z.number().optional(),
  pain_mentions: z
    .object({
      online: z.number(),
      conversations: z.number(),
    })
    .optional(),
});

// Idea schema
export const IdeaSchema = z.object({
  idea_id: z.string(),
  title: z.string(),
  one_liner: z.string().max(140),
  description: z.string().optional(),
  founder_background: z.string().optional(),
  target_market: z.string().optional(),
  business_model: z.string().optional(),
  conversation_insights: z
    .array(
      z.object({
        id: z.string(),
        type: z.enum([
          "user_quote",
          "market_insight",
          "competitive_intel",
          "user_behavior",
          "pain_point",
          "solution_feedback",
          "other",
        ]),
        content: z.string(),
        factor_related: ChecklistKeySchema.optional(),
        confidence_level: z.number().optional(),
        timestamp: z.string(),
      })
    )
    .optional(),
  stage: z.enum(["concept", "pre-MVP", "MVP", "post-launch"]),
  created_at: z.string(),
  updated_at: z.string(),
  metrics: IdeaMetricsSchema,
  checklist: z.record(ChecklistKeySchema, ChecklistItemSchema),
  derived: DerivedScoresSchema,
  recommended_tweak: z.string().optional(),
});

// Founder profile schema
export const FounderProfileSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  experience_years: z.number().optional(),
  team_size: z.number().optional(),
  passion_score: z.number().min(1).max(5).optional(),
  unfair_advantage: z.string().optional(),
  timezone: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

// Assessment progress schema
export const AssessmentProgressSchema = z.object({
  currentStep: z.number(),
  totalSteps: z.number(),
  completedFactors: z.array(ChecklistKeySchema),
  isAssessmentComplete: z.boolean(),
});

// Type exports
export type ChecklistKey = z.infer<typeof ChecklistKeySchema>;
export type Evidence = z.infer<typeof EvidenceSchema>;
export type ChecklistItem = z.infer<typeof ChecklistItemSchema>;
export type DerivedScores = z.infer<typeof DerivedScoresSchema>;
export type IdeaMetrics = z.infer<typeof IdeaMetricsSchema>;
export type Idea = z.infer<typeof IdeaSchema>;
export type FounderProfile = z.infer<typeof FounderProfileSchema>;
export type AssessmentProgress = z.infer<typeof AssessmentProgressSchema>;
