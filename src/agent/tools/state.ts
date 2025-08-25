import { getCurrentAgent } from "agents";
import { tool } from "ai";
import { z } from "zod";
import type { AgentMode, AppAgent, AppAgentState } from "../AppAgent";

/**
 * Gets the current agent state relevant to the active mode
 */
export const getAgentState = tool({
  description:
    "Get the current agent state including mode, settings, and current idea context",
  execute: async () => {
    const { agent } = getCurrentAgent<AppAgent>();

    if (!agent) {
      return "Error: Could not get agent reference";
    }

    try {
      // Get current state
      const currentState = agent.state as AppAgentState;

      // Helper function to get idea progress
      const getIdeaProgress = (idea: {
        checklist?: Record<string, { score?: number | null }>;
      }): string => {
        if (!idea || !idea.checklist) return "not started";
        const factors = Object.values(idea.checklist);
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
      };

      // Build idea context
      const currentIdea = currentState.currentIdea;
      const totalIdeas = currentState.ideas?.length || 0;

      // Return enhanced state with idea context
      return {
        isIntegrationComplete: currentState.isIntegrationComplete || false,
        isOnboardingComplete: currentState.isOnboardingComplete || false,
        mode: currentState.mode,
        onboardingStep: currentState.onboardingStep || "start",
        settings: currentState.settings || {},

        // Enhanced idea context
        ideaContext: {
          currentIdea: currentIdea
            ? {
                id: currentIdea.idea_id,
                title: currentIdea.title || "Untitled Idea",
                stage: currentIdea.stage || "concept",
                progressSummary: getIdeaProgress(currentIdea),
                oneLiner: currentIdea.one_liner || "No description yet",
              }
            : null,
          totalIdeas,
          availableIdeas:
            currentState.ideas?.map((i) => ({
              id: i.idea_id,
              title: i.title || "Untitled Idea",
              stage: i.stage || "concept",
              progress: getIdeaProgress(i),
            })) || [],
          hasMultipleIdeas: totalIdeas > 1,
          needsIdeaSelection: totalIdeas > 0 && !currentIdea,
        },

        // Assessment progress if there's a current idea
        assessmentProgress: currentState.assessmentProgress || null,
        founderProfile: currentState.founderProfile || null,
      };
    } catch (error) {
      console.error("Error getting agent state:", error);
      return `Error getting agent state: ${error}`;
    }
  },
  parameters: z.object({}),
});

/**
 * Gets the agent configuration and settings
 */
export const getAgentConfig = tool({
  description:
    "Get the agent configuration data including settings and preferences",
  execute: async () => {
    const { agent } = getCurrentAgent<AppAgent>();

    if (!agent) {
      return "Error: Could not get agent reference";
    }

    try {
      // Get current state
      const currentState = agent.state as AppAgentState;

      // Return only the configuration
      return {
        isOnboardingComplete: currentState.isOnboardingComplete || false,
        onboardingStep: currentState.onboardingStep || "start",
        settings: currentState.settings || {},
      };
    } catch (error) {
      console.error("Error getting agent configuration:", error);
      return `Error getting agent configuration: ${error}`;
    }
  },
  parameters: z.object({}),
});

/**
 * Gets the testing results and tool documentation for the integration mode
 */
export const getIntegrationState = tool({
  description:
    "Get the integration progress, results, and tool documentation for integration mode",
  execute: async () => {
    const { agent } = getCurrentAgent<AppAgent>();

    if (!agent) {
      return "Error: Could not get agent reference";
    }

    try {
      // Get current state
      const currentState = agent.state as AppAgentState;

      // Calculate testing progress statistics
      const testResults = currentState.testResults || {};
      const toolDocumentation = currentState.toolDocumentation || {};

      const totalTests = Object.keys(testResults).length;
      const successCount = Object.values(testResults).filter(
        (result) =>
          result &&
          typeof result === "object" &&
          "success" in result &&
          result.success
      ).length;
      const failedTests = totalTests - successCount;
      const documentedTools = Object.keys(toolDocumentation).length;

      // Return testing state with progress summary
      return {
        progress: {
          completionPercentage:
            totalTests > 0
              ? Math.round(
                  (successCount / totalTests) * 50 +
                    (documentedTools / Math.max(totalTests, 1)) * 50
                )
              : 0,
          documentedTools,
          failedTests,
          isComplete:
            (totalTests > 0 && currentState.isIntegrationComplete) || false,
          successCount,
          totalTests,
        },
        testReport: currentState.testReport || null,
        testResults,
        toolDocumentation,
        transitionRecommendation: currentState.transitionRecommendation || null,
      };
    } catch (error) {
      console.error("Error getting integration state:", error);
      return `Error getting integration state: ${error}`;
    }
  },
  parameters: z.object({}),
});

/**
 * Gets the current mode and available transitions
 */
export const getModeInfo = tool({
  description:
    "Get information about the current mode and available mode transitions",
  execute: async () => {
    const { agent } = getCurrentAgent<AppAgent>();

    if (!agent) {
      return "Error: Could not get agent reference";
    }

    try {
      // Get current state
      const currentState = agent.state as AppAgentState;
      const currentMode = currentState.mode;

      // Define mode progression and available transitions
      const modeInfo = {
        availableTransitions: [] as string[],
        currentMode,
        modeDescriptions: {
          act: "Execute tasks and take concrete actions",
          integration: "Test tools and integrations before deployment",
          onboarding: "Configure agent settings and initial setup",
          plan: "Analyze tasks and create strategic plans",
        },
      };

      // Determine available transitions based on current mode
      // Allow flexible transitions between all modes for better UX
      switch (currentMode) {
        case "onboarding":
          modeInfo.availableTransitions.push("integration", "plan", "act");
          break;
        case "integration":
          modeInfo.availableTransitions.push("onboarding", "plan", "act");
          break;
        case "plan":
          modeInfo.availableTransitions.push(
            "onboarding",
            "integration",
            "act"
          );
          break;
        case "act":
          modeInfo.availableTransitions.push(
            "onboarding",
            "integration",
            "plan"
          );
          break;
      }

      return modeInfo;
    } catch (error) {
      console.error("Error getting mode info:", error);
      return `Error getting mode info: ${error}`;
    }
  },
  parameters: z.object({}),
});

/**
 * Sets the agent's operating mode
 */
export const setMode = tool({
  description:
    "Set the agent's operating mode (onboarding, integration, plan, act)",
  execute: async ({
    mode,
    force = false,
  }: {
    mode: AgentMode;
    force?: boolean;
  }) => {
    const { agent } = getCurrentAgent<AppAgent>();

    if (!agent) {
      return "Error: Could not get agent reference";
    }

    try {
      const result = await agent.setMode(mode, force);
      return {
        currentMode: result.currentMode,
        message: `Successfully switched to ${mode} mode`,
        previousMode: result.previousMode,
        success: true,
      };
    } catch (error) {
      console.error("Error setting mode:", error);
      return `Error setting mode: ${error}`;
    }
  },
  parameters: z.object({
    force: z
      .boolean()
      .optional()
      .describe("Force the mode change even if conditions aren't met"),
    mode: z
      .enum(["onboarding", "integration", "plan", "act"])
      .describe("The mode to switch to"),
  }),
});
