import { createOpenAI } from "@ai-sdk/openai";
import type { Message } from "@ai-sdk/ui-utils";
// import { createAnthropic } from "@ai-sdk/anthropic";
// import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { AgentContext, Connection, Schedule } from "agents";
import { AIChatAgent } from "agents/ai-chat-agent";
import {
  createDataStreamResponse,
  generateId,
  type StreamTextOnFinishCallback,
  streamText,
  type ToolSet,
} from "ai";
import { getUnifiedSystemPrompt } from "./prompts/index";
import { executions, tools } from "./tools/registry";
import type {
  AdminContact,
  Operator,
  TestReport,
  TestResult,
  ToolDocumentation,
  TransitionRecommendation,
  TypedRecord,
} from "./types/generic";
import {
  type DatabaseExportResult,
  exportAgentData,
  type ImportRequest,
  importAgentData,
} from "./utils/export-import-utils";
import { processToolCalls } from "./utils/tool-utils";

// AI @ Your Service Gateway configuration
const getOpenAI = (env: Env, apiKey?: string) => {
  if (!apiKey) {
    throw new Error("API key is required for AI requests");
  }
  return createOpenAI({
    apiKey: apiKey,
    baseURL: `${env.GATEWAY_BASE_URL}/v1/openai`,
  });
};

/*
// AI @ Your Service Gateway configuration for Anthropic
const getAnthropic = (env: Env, apiKey?: string) => {
  if (!apiKey) {
    throw new Error("API key is required for AI requests");
  }
  return createAnthropic({
    apiKey: apiKey,
    baseURL: `${env.GATEWAY_BASE_URL}/v1/anthropic`,
  });
};
*/

/*
// AI @ Your Service Gateway configuration for Gemini
const getGemini = (env: Env, apiKey?: string) => {
  if (!apiKey) {
    throw new Error("API key is required for AI requests");
  }
  return createGoogleGenerativeAI({
    apiKey: apiKey,
    baseURL: `${env.GATEWAY_BASE_URL}/v1/google-ai-studio`,
  });
};
*/

// Helper function to filter out empty messages for AI provider compatibility
const filterEmptyMessages = (messages: Message[]) => {
  return messages.filter((message, index) => {
    // Allow empty content only for the final assistant message
    const isLastMessage = index === messages.length - 1;
    const isAssistant = message.role === "assistant";
    const hasEmptyContent =
      !message.content ||
      (typeof message.content === "string" && message.content.trim() === "") ||
      (Array.isArray(message.content) && message.content.length === 0);

    // Keep the message if it has content, or if it's the final assistant message
    return !hasEmptyContent || (isLastMessage && isAssistant);
  });
};

// Function to get a detailed error message
export function getErrorMessage(error: unknown): string {
  if (error == null) {
    return "unknown error";
  }
  if (typeof error === "string") {
    return error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return JSON.stringify(error);
}

// Agent operating modes
export type AgentMode = "onboarding" | "integration" | "plan" | "act";

// IdeaPotential types for startup idea assessment
export type ChecklistKey =
  | "problem_clarity"
  | "market_pain_mentions"
  | "outcome_gap"
  | "competitive_moat"
  | "team_solution_fit"
  | "solution_evidence"
  | "team_market_fit"
  | "early_demand"
  | "traffic_authority"
  | "marketing_product_fit"
  | "other";

export interface Evidence {
  evidence_id: string;
  // Expanded to include conversational and analysis sources used by tools
  type:
    | "manual_input"
    | "auto_fetch"
    | "peer_proof"
    | "prospect_pulse"
    | "seo_metric"
    | "social_metric"
    | "survey_response"
    | "conversation"
    | "user_statement"
    | "market_research"
    | "competitive_analysis"
    | "demo_feedback"
    | "metrics"
    | "other";
  source?: string;
  value: unknown;
  confidence?: number;
  notes?: string;
  reasoning?: string;
  timestamp: string;
  added_by: "agent" | "system" | "user";
}

export interface ChecklistItem {
  score: number | null;
  evidence_strength: 0 | 1 | 2 | 3;
  evidence: Evidence[];
  last_scored_at?: string;
}

export interface DerivedScores {
  potential_score: number;
  actualization_score: number;
  potential_bucket: "unknown" | "red" | "yellow" | "green";
  actualization_bucket: "unknown" | "red" | "yellow" | "green";
}

export interface IdeaMetrics {
  waitlist_signups?: number;
  mrr?: number;
  lois?: number;
  pain_mentions?: { online: number; conversations: number };
}

export interface ConversationInsight {
  id: string;
  type:
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
  timestamp: string;
}

export interface Idea {
  idea_id: string;
  title: string;
  one_liner: string;
  description?: string;
  // Additional descriptive fields used by assessment tools and UI
  founder_background?: string;
  target_market?: string;
  business_model?: string;
  conversation_insights?: ConversationInsight[];
  stage: "concept" | "pre-MVP" | "MVP" | "post-launch";
  created_at: string;
  updated_at: string;
  metrics: IdeaMetrics;
  checklist: Record<ChecklistKey, ChecklistItem>;
  derived: DerivedScores;
  recommended_tweak?: string;
}

export interface FounderProfile {
  id: string;
  name?: string;
  email?: string;
  experience_years?: number;
  team_size?: number;
  passion_score?: number;
  unfair_advantage?: string;
  timezone?: string;
  created_at: string;
  updated_at: string;
}

// Define AppAgentState interface for proper typing
export interface AppAgentState {
  mode: AgentMode;
  settings?: {
    language: string; // Main language for the agent (e.g., "en", "es", "fr")
    operators: Operator[];
    adminContact: AdminContact;
    currentUser?: string; // ID of the current operator
  };

  // User authentication info (from OAuth)
  userInfo?: {
    id: string;
    email: string;
    credits: number;
    payment_method: string;
    api_key?: string; // User's AtYourService.ai API key
  };

  // Onboarding mode state
  onboardingStep?: string;
  isOnboardingComplete: boolean;

  // Integration mode state
  testResults?: TypedRecord<string, TestResult>;
  toolDocumentation?: TypedRecord<string, ToolDocumentation>;
  testReport?: TestReport;
  isIntegrationComplete?: boolean;
  transitionRecommendation?: TransitionRecommendation;

  // IdeaPotential assessment state
  founderProfile?: FounderProfile;
  currentIdea?: Idea;
  ideas?: Idea[];
  assessmentProgress?: {
    currentStep: number;
    totalSteps: number;
    completedFactors: ChecklistKey[];
    isAssessmentComplete: boolean;
  };

  // Optional metadata
  _lastModeChange?: string;
}

/**
 * Generic Agent implementation with multiple operational modes
 * Can operate as a planning assistant, action executor, or general purpose agent
 */
export class AppAgent extends AIChatAgent<Env> {
  // Define initial agent state including the current mode
  initialState: AppAgentState = {
    isIntegrationComplete: false,
    isOnboardingComplete: false,
    mode: "act" as AgentMode, // Default to act mode for MVP
    onboardingStep: "start",
    settings: {
      adminContact: {
        email: "",
        name: "",
      },
      language: "en",
      operators: [],
    },
    // Integration state
    testResults: {},
    toolDocumentation: {},
  };

  // Ensure the current state matches the latest schema, merging in any missing fields
  ensureStateSchema(inputState: AppAgentState | undefined): AppAgentState {
    // Create a local copy of the state to avoid parameter reassignment
    const state = inputState ? { ...inputState } : ({} as AppAgentState);

    // Always ensure a valid mode is set
    if (
      !state ||
      !state.mode ||
      !["onboarding", "integration", "plan", "act"].includes(state.mode)
    ) {
      console.log(
        "[AppAgent] No valid mode found in state, defaulting to act mode"
      );
      state.mode = "act"; // Default to act mode for MVP
    }

    // Ensure settings exists
    if (!state.settings) {
      state.settings = this.initialState.settings;
    } else {
      // Merge settings properties
      if (!state.settings.language)
        state.settings.language = this.initialState.settings?.language || "en";
      if (!state.settings.operators)
        state.settings.operators = this.initialState.settings?.operators || [];
      if (!state.settings.adminContact)
        state.settings.adminContact = this.initialState.settings
          ?.adminContact || { email: "", name: "" };
    }

    return state;
  }

  constructor(ctx: AgentContext, env: Env) {
    super(ctx, env);
    // Load initial state and ensure schema
    const state = this.state as AppAgentState;
    const updatedState = this.ensureStateSchema(state);
    this.setState(updatedState);

    // Initialize database tables and load user info
    this.initialize()
      .then(() => {
        // Only load user info after database is initialized
        return this.loadUserInfo();
      })
      .catch((error) => {
        console.error(
          "Failed to initialize database or load user info:",
          error
        );
      });
  }

  /**
   * Get AI provider using user-specific API key if available
   * Includes retry logic for token refresh on 403 errors
   */
  getAIProvider() {
    const state = this.state as AppAgentState;
    const userApiKey = state.userInfo?.api_key;

    if (userApiKey) {
      const redactedApiKey =
        userApiKey.length <= 4
          ? `[REDACTED] (${userApiKey.length} chars)`
          : `${userApiKey.substring(0, 2)}...${userApiKey.substring(-2)} (${userApiKey.length} chars)`;
      console.log(
        `[AppAgent] Using user-specific API key for user: ${state.userInfo?.id}`
      );
      console.log(
        `[AppAgent] API key being used for AI requests: ${redactedApiKey}`
      );
      return getOpenAI(this.env, userApiKey);
    }
    const errorMsg =
      "No user API key available. User must be authenticated to use AI features.";
    console.error(`[AppAgent] ${errorMsg}`);
    throw new Error(errorMsg);
  }

  /**
   * Refresh token from OAuth provider when 403 errors occur
   * This handles the case where the database token is stale
   */
  async refreshTokenOnError() {
    try {
      const state = this.state as AppAgentState;
      const currentApiKey = state.userInfo?.api_key;

      if (!currentApiKey) {
        console.log("[AppAgent] No current API key to refresh");
        return false;
      }

      console.log(
        "[AppAgent] Attempting to refresh user info due to API error"
      );

      // Try to fetch fresh user info with current token
      // This will detect if the token is invalid and handle accordingly
      await this.fetchUserInfoFromOAuth(currentApiKey);

      // Check if token was actually updated
      const newState = this.state as AppAgentState;
      const newApiKey = newState.userInfo?.api_key;

      if (newApiKey && newApiKey !== currentApiKey) {
        const redactedOld =
          currentApiKey.length <= 4
            ? "[REDACTED]"
            : `${currentApiKey.substring(0, 2)}...${currentApiKey.substring(-2)} (${currentApiKey.length} chars)`;
        const redactedNew =
          newApiKey.length <= 4
            ? "[REDACTED]"
            : `${newApiKey.substring(0, 2)}...${newApiKey.substring(-2)} (${newApiKey.length} chars)`;
        console.log(
          `[AppAgent] ✅ Token refreshed: ${redactedOld} → ${redactedNew}`
        );
        return true;
      }
      console.log("[AppAgent] Token refresh did not result in new token");
      return false;
    } catch (error) {
      console.error("[AppAgent] Error during token refresh:", error);
      return false;
    }
  }

  /**
   * Get system prompt for the agent
   */
  getSystemPrompt() {
    // Use the unified system prompt for all modes
    return getUnifiedSystemPrompt();
  }

  /**
   * Get the appropriate tools based on the current agent mode
   */
  async getToolsForMode() {
    const state = this.state as AppAgentState;
    const mode = state.mode;

    console.log(`[AppAgent] Getting tools for mode: ${mode}`);

    // Base tools available in all modes
    const baseTools = {
      // Browser tools
      browseWebPage: tools.browseWebPage,
      browseWithBrowserbase: tools.browseWithBrowserbase,
      cancelScheduledTask: tools.cancelScheduledTask,
      fetchWebPage: tools.fetchWebPage,

      // State tools
      getAgentState: tools.getAgentState,
      getLocalTime: tools.getLocalTime,
      getScheduledTasks: tools.getScheduledTasks,
      // Context tools
      getWeatherInformation: tools.getWeatherInformation,

      // Scheduling tools
      scheduleTask: tools.scheduleTask,
      setMode: tools.setMode,

      // Messaging tools (limited for MVP)
      // suggestActions: tools.suggestActions, // Disabled - not working well
    };

    // Mode-specific tools
    switch (mode) {
      case "onboarding":
        // Onboarding mode - enable configuration tools and assessment tools
        return {
          ...baseTools,
          checkExistingConfig: tools.checkExistingConfig,
          completeOnboarding: tools.completeOnboarding,
          getOnboardingStatus: tools.getOnboardingStatus,
          saveSettings: tools.saveSettings,
          // Assessment tools for idea validation (also available during onboarding)
          getAssessmentState: tools.getAssessmentState,
          storeIdeaInformation: tools.storeIdeaInformation,
          storeConversationInsights: tools.storeConversationInsights,
          updateFactorScore: tools.updateFactorScore,
          selectIdea: tools.selectIdea,
          deleteIdea: tools.deleteIdea,
        } as ToolSet;

      case "integration":
        // Integration mode - enable testing and documentation tools
        return {
          ...baseTools,
          completeIntegrationTesting: tools.completeIntegrationTesting,
          documentTool: tools.documentTool,
          generateTestReport: tools.generateTestReport,
          recordTestResult: tools.recordTestResult,
          testErrorTool: tools.testErrorTool,
        } as ToolSet;

      case "act":
        // Action mode - enable assessment tools for idea validation
        return {
          ...baseTools,
          // Assessment tools for idea validation
          getAssessmentState: tools.getAssessmentState,
          storeIdeaInformation: tools.storeIdeaInformation,
          storeConversationInsights: tools.storeConversationInsights,
          updateFactorScore: tools.updateFactorScore,
          selectIdea: tools.selectIdea,
          deleteIdea: tools.deleteIdea,
          testErrorTool: tools.testErrorTool,
        } as ToolSet;

      default:
        // Planning mode - basic tools for planning and analysis
        return {
          ...baseTools,
        } as ToolSet;
    }
  }

  /**
   * Handles incoming chat messages and manages the response stream
   * @param onFinish - Callback function executed when streaming completes
   * @param options - Optional parameters including abortSignal
   */
  async onChatMessage(
    onFinish: StreamTextOnFinishCallback<ToolSet>,
    _options?: { abortSignal?: AbortSignal }
  ) {
    // const mcpConnection = await this.mcp.connect(
    //   "https://path-to-mcp-server/sse"
    // );

    const dataStreamResponse = createDataStreamResponse({
      execute: async (dataStream) => {
        // Get the current mode's tools
        const modeTools = await this.getToolsForMode();
        const state = this.state as AppAgentState;
        const currentMode = state.mode;

        console.log(
          `[AppAgent] Processing chat message in ${currentMode} mode`
        );

        // We don't have MCP implementation yet, so just use mode tools
        // In the future, we can add MCP tools:
        // const allTools = {
        //   ...modeTools,
        //   ...this.mcp.unstable_getAITools(),
        // };
        const allTools = modeTools;

        // Process any pending tool calls from previous messages
        // This handles human-in-the-loop confirmations for tools
        const processedMessages = await processToolCalls({
          dataStream,
          executions,
          messages: this.messages,
          tools: allTools,
        });

        // Filter out empty messages for AI provider compatibility
        const filteredMessages = filterEmptyMessages(processedMessages);

        // Get system prompt based on current mode
        const systemPrompt = this.getSystemPrompt();

        // Retry logic for handling token refresh on 403 errors
        let retryCount = 0;
        const maxRetries = 1;
        let result: ReturnType<typeof streamText> | undefined;

        while (retryCount <= maxRetries) {
          try {
            const openai = this.getAIProvider();
            const model = openai("gpt-5-mini-2025-08-07");

            // Stream the AI response
            result = streamText({
              maxSteps: 10,
              messages: filteredMessages,
              model,
              temperature: 1,
              onError: async (error: unknown) => {
                console.error("Error while streaming:", error);

                // Handle tool validation errors specifically
                if (error && typeof error === "object" && "message" in error) {
                  const errorMessage = String(error.message);
                  if (
                    errorMessage.includes("Invalid arguments for tool") &&
                    errorMessage.includes("Type validation failed")
                  ) {
                    console.log(
                      "[AppAgent] Tool validation error detected, converting to non-fatal error"
                    );
                    // Don't throw - let the stream continue and handle this as a tool error
                    return;
                  }
                }

                if (
                  error &&
                  typeof error === "object" &&
                  "status" in error &&
                  error.status === 403 &&
                  retryCount < maxRetries
                ) {
                  console.log(
                    "[AppAgent] Got 403 error, attempting token refresh"
                  );
                  const refreshed = await this.refreshTokenOnError();
                  if (refreshed) {
                    console.log(
                      "[AppAgent] Token refreshed, will retry request"
                    );
                    return; // This will cause the outer loop to retry
                  }
                }
                throw error;
              },
              onFinish: async (args) => {
                // Log a message indicating the completion of the request
                console.log(
                  `[AppAgent] Completed processing message in ${currentMode} mode`
                );

                // Pass args directly to onFinish callback
                onFinish(
                  args as Parameters<StreamTextOnFinishCallback<ToolSet>>[0]
                );
              },
              system: systemPrompt,
              tools: allTools,
            });
            break; // Success, exit retry loop
          } catch (error: unknown) {
            console.error("[AppAgent] Error in onChatMessage:", error);

            // Handle tool validation errors specifically
            if (error && typeof error === "object" && "message" in error) {
              const errorMessage = String(error.message);
              if (
                errorMessage.includes("Invalid arguments for tool") &&
                errorMessage.includes("Type validation failed")
              ) {
                console.log(
                  "[AppAgent] Tool validation error caught in outer try-catch, treating as non-fatal"
                );
                // For now, just log and continue - in the future we could inject an error message
                break; // Exit retry loop without throwing
              }
            }

            // Handle 403 errors with token refresh retry
            if (
              error &&
              typeof error === "object" &&
              "status" in error &&
              error.status === 403 &&
              retryCount < maxRetries
            ) {
              console.log(
                "[AppAgent] Got 403 error in catch block, attempting token refresh"
              );
              const refreshed = await this.refreshTokenOnError();
              if (refreshed) {
                retryCount++;
                console.log(
                  `[AppAgent] Token refreshed, retrying (attempt ${retryCount}/${maxRetries})`
                );
                continue; // Retry the request
              }
            }

            // If not a 403 error or retry failed, throw error
            throw error;
          }
        }

        // Merge the AI response stream with tool execution outputs
        if (result) {
          result.mergeIntoDataStream(dataStream);
        }
      },
      onError: getErrorMessage,
    });

    return dataStreamResponse;
  }

  /**
   * Execute a scheduled task
   */
  async executeTask(description: string, _task: Schedule<string>) {
    await this.saveMessages([
      ...this.messages,
      {
        content: `Running scheduled task: ${description}`,
        createdAt: new Date(),
        id: generateId(),
        role: "user",
      },
    ]);
  }

  /**
   * Initialize custom database tables and other setup
   *
   * NOTE: These tables are EXAMPLE CODE to show how you can create custom tables
   * for your agent. The template itself doesn't actually use these tables -
   * it uses the agent's built-in state management and framework tables instead.
   *
   * If you want to store custom data in database tables, you can:
   * 1. Define your table schema here
   * 2. Use this.sql`INSERT/SELECT/UPDATE` operations in your tools
   * 3. See src/agent/storage/ for example helper functions
   */
  async initialize() {
    // EXAMPLE: Create custom tables for storing additional data
    // These are not used by the template but show how you could add your own tables
    try {
      // Example: Custom settings table (alternative to agent state)
      await this.sql`
        CREATE TABLE IF NOT EXISTS settings (
          id TEXT PRIMARY KEY,
          data TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT
        )
      `;

      // User authentication and billing info table
      await this.sql`
        CREATE TABLE IF NOT EXISTS user_info (
          user_id TEXT PRIMARY KEY,
          api_key TEXT NOT NULL,
          email TEXT NOT NULL,
          credits REAL NOT NULL,
          payment_method TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `;

      // Example: Custom tasks/work items table
      await this.sql`
        CREATE TABLE IF NOT EXISTS tasks (
          id TEXT PRIMARY KEY,
          data TEXT NOT NULL,
          status TEXT NOT NULL,
          last_updated TEXT NOT NULL
        )
      `;

      // Example: Custom interaction history table
      await this.sql`
        CREATE TABLE IF NOT EXISTS interaction_history (
          id TEXT PRIMARY KEY,
          task_id TEXT NOT NULL,
          timestamp TEXT NOT NULL,
          action TEXT NOT NULL,
          result TEXT NOT NULL,
          FOREIGN KEY(task_id) REFERENCES tasks(id)
        )
      `;

      console.log("Example database tables initialized successfully");
    } catch (error) {
      console.error("Error initializing example database tables:", error);
    }
  }

  /**
   * Handle direct HTTP requests to the agent
   * This is used for actions like setting the mode
   */
  async onRequest(request: Request): Promise<Response> {
    const url = new URL(request.url);

    console.log("Incoming agent request", {
      pathname: url.pathname,
      url: url.toString(),
    });

    // Extract OAuth token from request and ensure user info is loaded
    const token = url.searchParams.get("token");
    const currentState = this.state as AppAgentState;

    if (token && !currentState.userInfo) {
      console.log(
        "[AppAgent] No user info in state, attempting to load from database or OAuth"
      );
      await this.loadUserInfo(token);
    }

    // Handle internal user info storage request
    if (
      url.pathname.endsWith("/store-user-info") &&
      request.method === "POST"
    ) {
      try {
        const userInfo = (await request.json()) as {
          user_id: string;
          api_key: string;
          email: string;
          credits: number;
          payment_method: string;
        };

        console.log(
          `[AppAgent] Storing user info for user: ${userInfo.user_id}`
        );

        // Store user info in database for persistence
        await this.sql`
          INSERT OR REPLACE INTO user_info (
            user_id, api_key, email, credits, payment_method, updated_at
          ) VALUES (
            ${userInfo.user_id},
            ${userInfo.api_key},
            ${userInfo.email},
            ${userInfo.credits},
            ${userInfo.payment_method},
            ${new Date().toISOString()}
          )
        `;

        // Also update agent state for immediate use
        const updatedState: AppAgentState = {
          ...currentState,
          userInfo: {
            api_key: userInfo.api_key,
            credits: userInfo.credits,
            email: userInfo.email,
            id: userInfo.user_id,
            payment_method: userInfo.payment_method,
          },
        };

        this.setState(updatedState);

        console.log(
          `[AppAgent] Successfully stored user info in database for user: ${userInfo.user_id}`
        );
        return new Response("OK");
      } catch (error) {
        console.error("[AppAgent] Error storing user info:", error);
        return new Response("Error storing user info", { status: 500 });
      }
    }

    // Handle user info clearing request (for logout)
    if (
      url.pathname.endsWith("/clear-user-info") &&
      request.method === "POST"
    ) {
      try {
        console.log("[AppAgent] Clearing cached user info");

        // Clear user info from database
        await this.sql`DELETE FROM user_info`;

        // Clear user info from agent state
        const updatedState: AppAgentState = {
          ...currentState,
          userInfo: undefined,
        };

        this.setState(updatedState);

        console.log("[AppAgent] Successfully cleared cached user info");
        return new Response("OK");
      } catch (error) {
        console.error("[AppAgent] Error clearing user info:", error);
        return new Response("Error clearing user info", { status: 500 });
      }
    }

    // Handle mode change requests
    if (url.pathname.includes("/set-mode")) {
      console.log(`[AppAgent] Detected set-mode request: ${url.pathname}`);

      try {
        // Only accept POST requests for mode changes
        if (request.method !== "POST") {
          console.log(
            "[AppAgent] Method not allowed for set-mode:",
            request.method
          );
          return Response.json(
            {
              error: "Method not allowed, use POST",
              success: false,
            },
            { status: 405 }
          );
        }

        const body = await request.json();
        const {
          mode: newModeString,
          force: forceFlag,
          isAfterClearHistory: clearHistoryFlag,
        } = body as {
          mode?: string;
          force?: boolean;
          isAfterClearHistory?: boolean;
        };
        const newMode = newModeString as AgentMode;
        const force = forceFlag === true;
        const isAfterClearHistory = clearHistoryFlag === true;

        if (
          !newMode ||
          !["onboarding", "integration", "plan", "act"].includes(newMode)
        ) {
          return Response.json(
            {
              error: "Invalid mode specified",
              success: false,
            },
            { status: 400 }
          );
        }

        // Call the setMode method to change modes and inject transition messages
        console.log(
          `[AppAgent] Processing mode change request: mode=${newMode}, force=${force}, isAfterClearHistory=${isAfterClearHistory}`
        );
        const result = await this.setMode(newMode, force, isAfterClearHistory);

        return Response.json(result);
      } catch (error) {
        console.error("[AppAgent] Error processing mode change:", error);
        return Response.json(
          {
            error: error instanceof Error ? error.message : String(error),
            success: false,
          },
          { status: 500 }
        );
      }
    }

    // For API endpoints requesting messages - ALWAYS return an array to prevent .map() errors
    if (url.pathname.endsWith("/get-messages")) {
      console.log("[AppAgent] Handling /get-messages request");

      try {
        // Try to get messages normally
        const messages = (
          this.sql`select * from cf_ai_chat_agent_messages` || []
        ).map((row) => {
          return JSON.parse(row.message as string);
        });

        const messageCount = Array.isArray(messages) ? messages.length : 0;
        console.log(
          `[AppAgent] /get-messages returning ${messageCount} messages`
        );

        return Response.json(messages);
      } catch (error) {
        // If there's any error (auth, db, etc.), return empty array instead of error object
        console.error(
          "[AppAgent] Error in /get-messages, returning empty array:",
          error
        );
        return Response.json([]);
      }
    }

    // Export endpoint to export the entire Agent data
    if (url.pathname.endsWith("/export")) {
      console.log("[AppAgent] Data export requested");

      // Use the utility function to handle export
      const exportResult = await exportAgentData(this);

      // Return the full database export as pretty-formatted JSON
      return new Response(JSON.stringify(exportResult, null, 2), {
        headers: {
          "Content-Disposition": `attachment; filename="agent-export-${Date.now()}.json"`,
          "Content-Type": "application/json",
        },
      });
    }

    // Import endpoint to restore data from a previous export
    if (url.pathname.endsWith("/import")) {
      // Only accept POST requests for import
      if (request.method !== "POST") {
        return Response.json(
          {
            error: "Method not allowed, use POST",
            success: false,
          },
          { status: 405 }
        );
      }

      console.log("[AppAgent] Data import requested");

      // Check content type to determine how to handle the request
      const contentType = request.headers.get("Content-Type") || "";
      let importRequest: ImportRequest;

      if (contentType.includes("multipart/form-data")) {
        // Handle multipart/form-data with file upload
        console.log("[AppAgent] Processing multipart form data upload");

        const formData = await request.formData();
        const file = formData.get("file");

        if (!file || !(file instanceof File)) {
          return Response.json(
            {
              error:
                "No file provided in the request. Please upload a backup file.",
              success: false,
            },
            { status: 400 }
          );
        }

        // Read the file content
        const fileContent = await file.text();
        let importData: DatabaseExportResult;

        try {
          importData = JSON.parse(fileContent) as DatabaseExportResult;
        } catch (_parseError) {
          return Response.json(
            {
              error:
                "Invalid JSON file format. Could not parse the backup file.",
              success: false,
            },
            { status: 400 }
          );
        }

        // Validate the imported data
        if (!importData.metadata || !importData.tables) {
          return Response.json(
            {
              error:
                "Invalid backup file structure. Missing metadata or tables.",
              success: false,
            },
            { status: 400 }
          );
        }

        // Parse options from form data
        const preserveAgentId = formData.get("preserveAgentId") === "true";
        const includeMessages = formData.get("includeMessages") !== "false"; // Default to true
        const includeScheduledTasks =
          formData.get("includeScheduledTasks") !== "false"; // Default to true

        importRequest = {
          data: importData,
          options: {
            includeMessages,
            includeScheduledTasks,
            preserveAgentId,
          },
        };
      } else {
        console.log("[AppAgent] Processing JSON payload import");

        interface ImportRequestBody {
          options?: {
            preserveAgentId?: boolean;
            includeMessages?: boolean;
            includeScheduledTasks?: boolean;
          };
          data: {
            metadata: {
              exportedAt: string;
              agentId: string;
              state: AppAgentState;
            };
            tables: Record<string, Record<string, unknown>>;
          };
        }

        const body = (await request.json()) as ImportRequestBody;

        // Validate that the request has the required fields
        if (!body.data || !body.data.metadata || !body.data.tables) {
          return Response.json(
            {
              error:
                "Invalid import data format. Expected {options, data} structure.",
              success: false,
            },
            { status: 400 }
          );
        }

        importRequest = {
          data: body.data as unknown as DatabaseExportResult,
          options: body.options || {},
        };
      }

      // Process import
      const importResult = await importAgentData(this, importRequest);
      return Response.json(importResult);
    }

    // For all other cases, let the regular chat flow handle it
    return super.onRequest(request);
  }

  /**
   * Handle state updates and log the entire state for debugging
   */
  onStateUpdate(state: AppAgentState, source: "server" | Connection) {
    // Get message count to help with debugging
    const messageCount = this.messages?.length || 0;
    const lastMessageId =
      messageCount > 0 ? this.messages?.[messageCount - 1]?.id : "none";

    console.log("[AppAgent] State updated:", {
      lastMessageId,
      messageCount,
      mode: state?.mode,
      source: typeof source === "string" ? source : "client",
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Handle new client connections
   */
  async onConnect(connection: Connection) {
    console.log(`[AppAgent] New client connection: ${connection.id}`);

    console.log("[AppAgent] Connection established", {
      connectionId: connection.id,
      timestamp: new Date().toISOString(),
    });

    // SOLUTION: Load user info from database and rely on retry logic for token refresh
    try {
      console.log("[AppAgent] Loading user info from database...");
      await this.loadUserInfo();
      console.log("[AppAgent] ✅ User info loaded from database");
    } catch (error) {
      console.error("[AppAgent] Error loading user info:", error);
    }

    // Send a connection-ready event to signal that setup is complete
    // The client can listen for this to know when to check for messages
    connection.send(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        type: "connection-ready",
      })
    );
  }

  /**
   * Set the agent's operating mode
   *
   * @param mode The mode to set
   * @param force If true, will override validation checks
   * @param isAfterClearHistory If true, indicates this is after clearing history
   */
  async setMode(mode: AgentMode, force = false, _isAfterClearHistory = false) {
    const currentState = this.state as AppAgentState;
    const previousMode = currentState.mode;

    // Check if mode is actually changing
    if (previousMode !== mode || force) {
      console.log(`[AppAgent] Updating state: ${previousMode} → ${mode}`);

      // Simple state update, no message manipulation
      await this.setState({
        ...currentState,
        _lastModeChange: new Date().toISOString(),
        mode,
      });

      console.log(`[AppAgent] Mode changed to ${mode}`);
    }

    return {
      currentMode: mode,
      previousMode,
      success: true,
    };
  }

  /**
   * Get Browserbase API key safely for use in tools
   */
  getBrowserbaseApiKey() {
    return this.env.BROWSERBASE_API_KEY;
  }

  /**
   * Get Browser API key for the external browser rendering service
   */
  getBrowserApiKey() {
    const state = this.state as AppAgentState;
    const userApiKey = state.userInfo?.api_key;

    if (userApiKey) {
      return userApiKey;
    }

    throw new Error(
      "No user API key available for browser rendering service. User must be authenticated."
    );
  }

  /**
   * Get Browser API base URL for the external browser rendering service
   */
  getBrowserApiBaseUrl() {
    return this.env.GATEWAY_BASE_URL;
  }

  /**
   * Get table description for export/import
   * Get a description of a table based on its name
   * Used for the database export feature
   */
  getTableDescription(tableName: string): string {
    const descriptions: Record<string, string> = {
      interaction_history: "Stores history of interactions",
      settings: "Stores agent settings and configuration",
      tasks: "Stores task data",
    };
    return descriptions[tableName] || "Unknown table";
  }

  /**
   * Fetch user info from OAuth provider
   */
  async fetchUserInfoFromOAuth(token: string): Promise<void> {
    try {
      // Use the OAuth provider URL (website) for token verification
      const oauthProviderUrl =
        this.env.OAUTH_PROVIDER_BASE_URL || "https://atyourservice.ai";
      const verifyEndpoint = `${oauthProviderUrl}/oauth/verify`;

      console.log(
        `[AppAgent] Fetching user info from OAuth provider: ${verifyEndpoint}`
      );

      const response = await fetch(verifyEndpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `[AppAgent] OAuth verification failed: ${response.status} - ${errorText}`
        );
        return;
      }

      const userInfo = (await response.json()) as {
        id: string;
        email: string;
        credits: number;
        payment_method: string;
      };

      console.log(
        `[AppAgent] Fetched user info from OAuth for user: ${userInfo.id}`
      );

      // Store in database for future use
      // OAuth token IS the gateway API key
      await this.sql`
        INSERT OR REPLACE INTO user_info (
          user_id, api_key, email, credits, payment_method, updated_at
        ) VALUES (
          ${userInfo.id},
          ${token},
          ${userInfo.email},
          ${userInfo.credits},
          ${userInfo.payment_method},
          ${new Date().toISOString()}
        )
      `;

      // Update agent state
      const state = this.state as AppAgentState;
      const updatedState: AppAgentState = {
        ...state,
        userInfo: {
          api_key: token,
          credits: userInfo.credits,
          email: userInfo.email,
          id: userInfo.id,
          payment_method: userInfo.payment_method,
        },
      };

      this.setState(updatedState);
      console.log(
        `[AppAgent] Successfully fetched and stored user info for user: ${userInfo.id}`
      );
    } catch (error) {
      console.error("[AppAgent] Error fetching user info from OAuth:", error);
    }
  }

  /**
   * Load user info from database if available, or fetch from OAuth if needed
   */
  async loadUserInfo(oauthToken?: string) {
    try {
      const userInfoResults = await this.sql`
        SELECT * FROM user_info LIMIT 1
      `;

      if (userInfoResults && userInfoResults.length > 0) {
        const userInfo = userInfoResults[0] as {
          user_id: string;
          api_key: string;
          email: string;
          credits: number;
          payment_method: string;
        };

        // Check if the stored API key matches the current OAuth token
        if (oauthToken && userInfo.api_key !== oauthToken) {
          console.log(
            "[AppAgent] Stored API key doesn't match current token, fetching fresh user info from OAuth"
          );
          await this.fetchUserInfoFromOAuth(oauthToken);
          return;
        }

        const state = this.state as AppAgentState;
        const updatedState: AppAgentState = {
          ...state,
          userInfo: {
            api_key: userInfo.api_key,
            credits: userInfo.credits,
            email: userInfo.email,
            id: userInfo.user_id,
            payment_method: userInfo.payment_method,
          },
        };

        this.setState(updatedState);
        console.log(
          `[AppAgent] Loaded user info from database for user: ${userInfo.user_id}`
        );
      } else {
        console.log("[AppAgent] No user info found in database");

        if (oauthToken) {
          await this.fetchUserInfoFromOAuth(oauthToken);
        }
      }
    } catch (error) {
      console.error("[AppAgent] Error loading user info from database:", error);
    }
  }
}
