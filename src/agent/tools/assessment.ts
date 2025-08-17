import { getCurrentAgent } from "agents";
import { tool } from "ai";
import { z } from "zod";
import { generateId } from "ai";
import type {
  AppAgent,
  AppAgentState,
  ChecklistKey,
  Evidence,
  Idea,
} from "../AppAgent";
import { calculateDerivedScores } from "../utils/scoring-utils";

/**
 * Helper function to get idea progress summary
 */
function getIdeaProgress(idea: Idea): string {
  const factors = Object.values(idea.checklist || {});
  const scored = factors.filter(
    (f) => f.score !== null && f.score !== undefined
  ).length;
  const totalFactors = factors.length;
  const percentage =
    totalFactors > 0 ? Math.round((scored / totalFactors) * 100) : 0;

  if (percentage === 0) return "not started";
  if (percentage < 50) return `${percentage}% complete (early stage)`;
  if (percentage < 100) return `${percentage}% complete (in progress)`;
  return "assessment complete";
}

/**
 * Store or update basic idea information extracted from conversation
 */
export const storeIdeaInformation = tool({
  description:
    "Store or update basic idea information extracted from user conversation",
  execute: async ({
    title,
    one_liner,
    description,
    stage,
    founder_background,
    target_market,
    business_model,
  }: {
    title?: string;
    one_liner?: string;
    description?: string;
    stage?: "concept" | "pre-MVP" | "MVP" | "post-launch";
    founder_background?: string;
    target_market?: string;
    business_model?: string;
  }) => {
    const { agent } = getCurrentAgent<AppAgent>();

    if (!agent) {
      return "Error: Could not get agent reference";
    }

    try {
      const currentState = agent.state as AppAgentState;
      const now = new Date().toISOString();

      let updatedIdea: Idea;

      // If no current idea, create new one
      if (!currentState.currentIdea) {
        updatedIdea = {
          idea_id: generateId(),
          title: title || "Untitled Idea",
          one_liner: one_liner || "",
          description: description || "",
          stage: stage || "concept",
          created_at: now,
          updated_at: now,
          founder_background,
          target_market,
          business_model,
          metrics: {},
          checklist: {
            problem_clarity: {
              score: null,
              evidence_strength: 0,
              evidence: [],
            },
            market_pain_mentions: {
              score: null,
              evidence_strength: 0,
              evidence: [],
            },
            outcome_gap: { score: null, evidence_strength: 0, evidence: [] },
            competitive_moat: {
              score: null,
              evidence_strength: 0,
              evidence: [],
            },
            team_solution_fit: {
              score: null,
              evidence_strength: 0,
              evidence: [],
            },
            solution_evidence: {
              score: null,
              evidence_strength: 0,
              evidence: [],
            },
            team_market_fit: {
              score: null,
              evidence_strength: 0,
              evidence: [],
            },
            early_demand: { score: null, evidence_strength: 0, evidence: [] },
            traffic_authority: {
              score: null,
              evidence_strength: 0,
              evidence: [],
            },
            marketing_product_fit: {
              score: null,
              evidence_strength: 0,
              evidence: [],
            },
          },
          derived: {
            potential_score: 0,
            actualization_score: 0,
            potential_bucket: "unknown",
            actualization_bucket: "unknown",
          },
        };
      } else {
        // Update existing idea
        updatedIdea = {
          ...currentState.currentIdea,
          title: title || currentState.currentIdea.title,
          one_liner: one_liner || currentState.currentIdea.one_liner,
          description: description || currentState.currentIdea.description,
          stage: stage || currentState.currentIdea.stage,
          founder_background:
            founder_background || currentState.currentIdea.founder_background,
          target_market:
            target_market || currentState.currentIdea.target_market,
          business_model:
            business_model || currentState.currentIdea.business_model,
          updated_at: now,
        };
      }

      // Update agent state
      const updatedState: AppAgentState = {
        ...currentState,
        currentIdea: updatedIdea,
        ideas: currentState.ideas?.map((i) =>
          i.idea_id === updatedIdea.idea_id ? updatedIdea : i
        ) || [updatedIdea],
      };

      await agent.setState(updatedState);

      return {
        success: true,
        message: `Stored idea information: ${updatedIdea.title}`,
        idea_id: updatedIdea.idea_id,
      };
    } catch (error) {
      console.error("Error storing idea information:", error);
      return `Error storing idea information: ${error}`;
    }
  },
  parameters: z.object({
    title: z.string().optional().describe("The idea title/name"),
    one_liner: z.string().optional().describe("A concise one-line description"),
    description: z
      .string()
      .optional()
      .describe("Detailed description of the idea"),
    stage: z
      .enum(["concept", "pre-MVP", "MVP", "post-launch"])
      .optional()
      .describe("Current development stage"),
    founder_background: z
      .string()
      .optional()
      .describe("Founder's relevant background and expertise"),
    target_market: z
      .string()
      .optional()
      .describe("Description of target market/customers"),
    business_model: z
      .string()
      .optional()
      .describe("How the business plans to make money"),
  }),
});

/**
 * Store conversation insights and context that don't fit other categories
 */
export const storeConversationInsights = tool({
  description:
    "Store important insights, quotes, or context from the conversation",
  execute: async ({
    insight_type,
    content,
    factor_related,
    confidence_level,
  }: {
    insight_type:
      | "user_quote"
      | "market_insight"
      | "competitive_intel"
      | "user_behavior"
      | "pain_point"
      | "solution_feedback"
      | "other";
    content: string;
    factor_related?: ChecklistKey;
    confidence_level?: number;
  }) => {
    const { agent } = getCurrentAgent<AppAgent>();

    if (!agent) {
      return "Error: Could not get agent reference";
    }

    try {
      const currentState = agent.state as AppAgentState;

      if (!currentState.currentIdea) {
        return "Error: No idea being assessed. Store idea information first.";
      }

      const now = new Date().toISOString();
      const insight = {
        id: generateId(),
        type: insight_type,
        content,
        factor_related,
        confidence_level,
        timestamp: now,
      };

      // Store in conversation_insights array on the idea
      const updatedIdea = {
        ...currentState.currentIdea,
        conversation_insights: [
          ...(currentState.currentIdea.conversation_insights || []),
          insight,
        ],
        updated_at: now,
      };

      const updatedState: AppAgentState = {
        ...currentState,
        currentIdea: updatedIdea,
        ideas: currentState.ideas?.map((i) =>
          i.idea_id === updatedIdea.idea_id ? updatedIdea : i
        ) || [updatedIdea],
      };

      await agent.setState(updatedState);

      return {
        success: true,
        message: `Stored ${insight_type}: ${content.substring(0, 50)}...`,
        insight_id: insight.id,
      };
    } catch (error) {
      console.error("Error storing conversation insight:", error);
      return `Error storing conversation insight: ${error}`;
    }
  },
  parameters: z.object({
    insight_type: z
      .enum([
        "user_quote",
        "market_insight",
        "competitive_intel",
        "user_behavior",
        "pain_point",
        "solution_feedback",
        "other",
      ])
      .describe("Type of insight being stored"),
    content: z.string().describe("The insight content or quote"),
    factor_related: z
      .enum([
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
      ])
      .optional()
      .describe("Which assessment factor this relates to"),
    confidence_level: z
      .number()
      .min(0)
      .max(1)
      .optional()
      .describe("Confidence in this insight (0-1)"),
  }),
});

/**
 * Update a factor score and add evidence based on conversation
 */
export const updateFactorScore = tool({
  description:
    "Update a specific factor score and add supporting evidence based on conversation",
  execute: async (args) => {
    const {
      factor,
      score,
      reasoning,
      evidence_type,
      evidence_value,
      evidence_source,
      evidence_notes,
      confidence,
    } = args as {
      factor: ChecklistKey;
      score: number;
      reasoning: string;
      evidence_type:
        | "conversation"
        | "user_statement"
        | "market_research"
        | "competitive_analysis"
        | "demo_feedback"
        | "metrics"
        | "other";
      evidence_value: unknown;
      evidence_source?: string;
      evidence_notes?: string;
      confidence?: number;
    };
    const { agent } = getCurrentAgent<AppAgent>();

    if (!agent) {
      return "Error: Could not get agent reference";
    }

    try {
      const currentState = agent.state as AppAgentState;

      if (!currentState.currentIdea) {
        return "Error: No idea assessment in progress. Store idea information first.";
      }

      const idea = currentState.currentIdea;
      const now = new Date().toISOString();

      // Create new evidence entry
      const newEvidence: Evidence = {
        evidence_id: generateId(),
        type: evidence_type,
        source: evidence_source || "conversation",
        value: evidence_value,
        confidence,
        notes: evidence_notes,
        reasoning, // Add reasoning field
        timestamp: now,
        added_by: "agent",
      };

      // Update the factor
      const updatedChecklist = {
        ...idea.checklist,
        [factor]: {
          score: Math.max(0, Math.min(5, score)), // Ensure score is 0-5
          evidence_strength: calculateEvidenceStrength([
            ...idea.checklist[factor].evidence,
            newEvidence,
          ]),
          evidence: [...idea.checklist[factor].evidence, newEvidence],
          last_scored_at: now,
        },
      };

      // Recalculate derived scores
      const derivedScores = calculateDerivedScores(updatedChecklist);

      // Update idea
      const updatedIdea: Idea = {
        ...idea,
        checklist: updatedChecklist,
        derived: derivedScores,
        updated_at: now,
      };

      // Update progress
      const completedFactors = Object.keys(updatedChecklist).filter(
        (key) => updatedChecklist[key as ChecklistKey].score !== null
      ) as ChecklistKey[];

      const updatedProgress = {
        currentStep: completedFactors.length,
        totalSteps: 10,
        completedFactors,
        isAssessmentComplete: completedFactors.length === 10,
      };

      // Update agent state
      const updatedState: AppAgentState = {
        ...currentState,
        currentIdea: updatedIdea,
        ideas: currentState.ideas?.map((i) =>
          i.idea_id === idea.idea_id ? updatedIdea : i
        ) || [updatedIdea],
        assessmentProgress: updatedProgress,
      };

      await agent.setState(updatedState);

      return {
        success: true,
        message: `Updated ${factor} score to ${score}/5 - ${reasoning}`,
        factor,
        score,
        evidence_strength: updatedChecklist[factor].evidence_strength,
        derived_scores: derivedScores,
        progress: updatedProgress,
      };
    } catch (error) {
      console.error("Error updating factor score:", error);
      return `Error updating factor score: ${error}`;
    }
  },
  parameters: z.object({
    factor: z
      .enum([
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
      ])
      .describe("The factor to update"),
    score: z.number().min(0).max(5).describe("The score (0-5) for this factor"),
    reasoning: z.string().describe("Explanation of why this score was given"),
    evidence_type: z
      .enum([
        "conversation",
        "user_statement",
        "market_research",
        "competitive_analysis",
        "demo_feedback",
        "metrics",
        "other",
      ])
      .describe("Type of evidence supporting this score"),
    evidence_value: z
      .any()
      .describe("The evidence data/value from the conversation"),
    evidence_source: z.string().optional().describe("Source of the evidence"),
    evidence_notes: z
      .string()
      .optional()
      .describe("Additional notes about the evidence"),
    confidence: z
      .number()
      .min(0)
      .max(1)
      .optional()
      .describe("Confidence level in the evidence (0-1)"),
  }),
});

/**
 * Get current idea assessment state
 */
export const getAssessmentState = tool({
  description: "Get the current idea assessment progress and scores",
  execute: async () => {
    const { agent } = getCurrentAgent<AppAgent>();

    if (!agent) {
      return "Error: Could not get agent reference";
    }

    try {
      const currentState = agent.state as AppAgentState;

      if (!currentState.currentIdea) {
        return {
          hasAssessment: false,
          message:
            "No idea assessment in progress. Start by describing your startup idea.",
        };
      }

      const idea = currentState.currentIdea;

      return {
        hasAssessment: true,
        idea: {
          title: idea.title,
          one_liner: idea.one_liner,
          stage: idea.stage,
          derived: idea.derived,
          founder_background: idea.founder_background,
          target_market: idea.target_market,
          business_model: idea.business_model,
        },
        progress: currentState.assessmentProgress || {
          currentStep: 0,
          totalSteps: 10,
          completedFactors: [],
          isAssessmentComplete: false,
        },
        conversation_insights: idea.conversation_insights || [],
      };
    } catch (error) {
      console.error("Error getting assessment state:", error);
      return `Error getting assessment state: ${error}`;
    }
  },
  parameters: z.object({}),
});

/**
 * Calculate evidence strength based on evidence array
 */
function calculateEvidenceStrength(evidence: Evidence[]): 0 | 1 | 2 | 3 {
  if (evidence.length === 0) return 0;

  const hasHighConfidence = evidence.some(
    (e) => e.confidence && e.confidence >= 0.8
  );
  const hasMultipleSources = evidence.length >= 3;
  const hasQuantitativeData = evidence.some(
    (e) =>
      e.type === "metrics" ||
      (typeof e.value === "number" && e.confidence && e.confidence >= 0.7)
  );

  if (hasQuantitativeData && hasHighConfidence) return 3;
  if (hasHighConfidence || (hasMultipleSources && evidence.length >= 5))
    return 2;
  if (hasMultipleSources || evidence.length >= 2) return 1;
  return 1;
}

/**
 * Select which idea to focus the conversation on
 */
export const selectIdea = tool({
  description:
    "Select which idea to focus the conversation on, or start working on a new idea",
  parameters: z.object({
    ideaId: z
      .string()
      .describe("ID of the idea to select, or 'new' for starting a new idea"),
    reason: z.string().optional().describe("Why switching to this idea"),
  }),
  execute: async ({ ideaId, reason }) => {
    const { agent } = getCurrentAgent<AppAgent>();

    if (!agent) {
      return "Error: Could not get agent reference";
    }

    try {
      const currentState = agent.state as AppAgentState;

      if (ideaId === "new") {
        // Reset to empty state for new idea
        const newState: AppAgentState = {
          ...currentState,
          currentIdea: undefined,
          assessmentProgress: {
            currentStep: 0,
            totalSteps: 10,
            completedFactors: [],
            isAssessmentComplete: false,
          },
        };

        await agent.setState(newState);

        return "Ready to work on a new idea. Please describe your startup concept and I'll guide you through the assessment.";
      }

      const idea = currentState.ideas?.find((i) => i.idea_id === ideaId);
      if (!idea) {
        const availableIdeas =
          currentState.ideas
            ?.map((i) => `"${i.title}" (${i.idea_id})`)
            .join(", ") || "none";
        return `Idea not found. Available ideas: ${availableIdeas}`;
      }

      const newState: AppAgentState = {
        ...currentState,
        currentIdea: idea,
      };

      await agent.setState(newState);

      const progress = getIdeaProgress(idea);
      const reasonText = reason ? ` (${reason})` : "";

      return `Now focusing on "${idea.title}"${reasonText}. Current status: ${progress}. How would you like to continue working on this idea?`;
    } catch (error) {
      console.error("Error in selectIdea:", error);
      return `Error selecting idea: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  },
});
