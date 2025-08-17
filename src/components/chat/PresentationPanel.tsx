import { ClipboardText } from "@phosphor-icons/react";
import { useState, useId } from "react";
import { Card } from "@/components/card/Card";
import { MemoizedMarkdown } from "@/components/memoized-markdown";
import { ChecklistGrid } from "@/components/assessment/ChecklistGrid";
import { ScoreDial } from "@/components/assessment/ScoreDial";
import { EvidenceAccordion } from "@/components/assessment/EvidenceAccordion";
import type {
  Idea,
  ChecklistKey,
  ChecklistItem,
  Evidence,
  IdeaMetrics,
  DerivedScores,
} from "../../types/assessment";
import type { AgentMode, AppAgentState } from "../../agent/AppAgent";

interface PresentationPanelProps {
  agentState: AppAgentState;
  agentMode: AgentMode;
  showDebug: boolean;
}

declare global {
  interface Window {
    setChatInput: (input: string) => void;
  }
}

export function PresentationPanel({
  agentState,
  showDebug,
}: PresentationPanelProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const agentSettingsId = useId();

  // Function to copy text to clipboard
  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    });
  };

  // Function to set chat input (dispatch event consumed at App level)
  const setChatInput = (input: string) => {
    window.dispatchEvent(
      new CustomEvent("set-chat-input", { detail: { text: input } })
    );
  };

  // Check if we have any meaningful content to display
  const hasSettings =
    agentState?.settings &&
    (agentState.settings.language ||
      (agentState.settings.operators &&
        agentState.settings.operators.length > 0) ||
      agentState.settings.adminContact?.name);

  const hasAssessment = Boolean(agentState?.currentIdea);

  // Create default empty assessment state for display
  const getEmptyIdea = (): Idea => {
    const emptyMetrics: IdeaMetrics = {};
    const emptyItem = (): ChecklistItem => ({
      score: null,
      evidence_strength: 0,
      evidence: [] as Evidence[],
    });
    const checklist: Record<ChecklistKey, ChecklistItem> = {
      problem_clarity: emptyItem(),
      market_pain_mentions: emptyItem(),
      outcome_gap: emptyItem(),
      competitive_moat: emptyItem(),
      team_solution_fit: emptyItem(),
      solution_evidence: emptyItem(),
      team_market_fit: emptyItem(),
      early_demand: emptyItem(),
      traffic_authority: emptyItem(),
      marketing_product_fit: emptyItem(),
    };
    const derived: DerivedScores = {
      potential_score: 0,
      actualization_score: 0,
      potential_bucket: "unknown",
      actualization_bucket: "unknown",
    };
    return {
      idea_id: "empty",
      title: "Your Startup Idea",
      one_liner: "Describe your startup idea to begin assessment",
      stage: "concept",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metrics: emptyMetrics,
      checklist,
      derived,
      recommended_tweak: undefined,
    };
  };

  const assessmentData: Idea = hasAssessment
    ? (agentState.currentIdea as unknown as Idea)
    : getEmptyIdea();
  const checklistForUi = assessmentData.checklist as Record<
    ChecklistKey,
    ChecklistItem
  >;

  const formatSettings = () => {
    if (!hasSettings) return "";

    let settingsInfo = "";
    const settings = agentState.settings!;

    if (settings.language) {
      settingsInfo += `## Language\n**${settings.language}**\n\n`;
    }

    if (settings.operators && settings.operators.length > 0) {
      settingsInfo += "## Operators\n";
      settings.operators.forEach((operator, index) => {
        settingsInfo += `### ${index + 1}. ${operator.name}\n`;
        settingsInfo += `**Role:** ${operator.role}\n`;
        if (operator.email) settingsInfo += `**Email:** ${operator.email}\n`;
        settingsInfo += "\n";
      });
    }

    if (settings.adminContact?.name) {
      settingsInfo += "## Admin Contact\n";
      settingsInfo += `### ${settings.adminContact.name}\n`;
      if (settings.adminContact.email) {
        settingsInfo += `**Email:** ${settings.adminContact.email}\n`;
      }
    }

    return settingsInfo;
  };

  return (
    // Behave as full-background friendly panel (fills parent)
    <div className="h-full w-full bg-white dark:bg-neutral-900 p-3 md:p-4 overflow-auto">
      <div className="flex items-center gap-2 mb-3">
        <ClipboardText size={18} className="text-neutral-500 md:w-5 md:h-5" />
        <h2 className="text-sm md:text-lg font-medium">Idea Assessment</h2>
      </div>

      <div className="space-y-4">
        {/* IdeaPotential Assessment - Always Show */}
        <div>
          {/* Idea Overview */}
          <Card className="p-4 bg-neutral-100 dark:bg-neutral-900">
            <div className="mb-4">
              <h3 className="font-medium text-base md:text-lg">
                {assessmentData.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {assessmentData.one_liner}
              </p>
              {hasAssessment && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-xs text-gray-500">
                  <span>Stage: {assessmentData.stage}</span>
                  <span>
                    Updated:{" "}
                    {new Date(assessmentData.updated_at).toLocaleDateString()}
                  </span>
                </div>
              )}
              {(() => {
                return !hasAssessment ? (
                  <div className="mt-3">
                    <button
                      type="button"
                      className="px-4 py-2 bg-[#F48120] text-white rounded-md hover:bg-[#F48120]/90 transition-colors text-sm"
                      onClick={() => {
                        setChatInput("I want to assess my startup idea");
                      }}
                    >
                      Start Assessment
                    </button>
                  </div>
                ) : null;
              })()}
            </div>

            {/* Score Dials */}
            <div className="flex justify-center gap-8 mb-4">
              <ScoreDial
                derived={assessmentData.derived}
                scoreType="potential"
              />
              <ScoreDial
                derived={assessmentData.derived}
                scoreType="actualization"
              />
            </div>

            {/* Recommended Tweak */}
            {hasAssessment && assessmentData.recommended_tweak && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium text-sm text-blue-800 dark:text-blue-200 mb-1">
                  Recommended Next Step
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {assessmentData.recommended_tweak}
                </p>
              </div>
            )}

            {!hasAssessment && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Start by describing your startup idea to begin the assessment
                  process. The AI will guide you through evaluating 10 critical
                  factors.
                </p>
              </div>
            )}
          </Card>

          {/* Checklist Grid */}
          <Card className="p-4 bg-neutral-100 dark:bg-neutral-900">
            <ChecklistGrid
              checklist={checklistForUi}
              derived={assessmentData.derived}
            />
          </Card>

          {/* Evidence Accordion - Only show if there's actual assessment */}
          {hasAssessment && (
            <Card className="p-4 bg-neutral-100 dark:bg-neutral-900">
              <EvidenceAccordion checklist={checklistForUi} />
            </Card>
          )}
        </div>

        {/* Agent Settings - Show at bottom if they exist */}
        {hasSettings && (
          <Card className="p-4 bg-neutral-100 dark:bg-neutral-900">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Agent Settings</h3>
              <button
                type="button"
                className="text-xs px-2 py-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800"
                onClick={() => copyToClipboard(formatSettings(), "settings")}
              >
                {copiedSection === "settings" ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className="markdown-content text-sm max-h-[300px] overflow-auto">
              <MemoizedMarkdown
                id={agentSettingsId}
                content={formatSettings()}
              />
            </div>
          </Card>
        )}

        {/* Raw State (Debug Mode Only) */}
        {showDebug && (
          <Card className="p-4 bg-neutral-100 dark:bg-neutral-900">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Raw Agent State</h3>
              <button
                type="button"
                className="text-xs px-2 py-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800"
                onClick={() =>
                  copyToClipboard(
                    JSON.stringify(agentState, null, 2),
                    "raw-state"
                  )
                }
              >
                {copiedSection === "raw-state" ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className="text-sm">
              <pre className="bg-neutral-200 dark:bg-neutral-800 p-2 rounded overflow-auto text-xs max-h-[500px]">
                {JSON.stringify(agentState, null, 2)}
              </pre>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
