import { useState } from "react";
import {
  CaretDown,
  CaretRight,
  Globe,
  User,
  Brain,
  Robot,
} from "@phosphor-icons/react";
import type {
  ChecklistKey,
  ChecklistItem,
  Evidence,
} from "../../types/assessment";

interface EvidenceAccordionProps {
  checklist: Record<ChecklistKey, ChecklistItem>;
}

// Factor display names (reuse from ChecklistGrid)
const FACTOR_NAMES: Record<ChecklistKey, string> = {
  problem_clarity: "Problem Clarity",
  market_pain_mentions: "Market Pain Mentions",
  outcome_gap: "Outcome Gap",
  competitive_moat: "Competitive Moat",
  team_solution_fit: "Team–Solution Fit",
  solution_evidence: "Solution Evidence & Value",
  team_market_fit: "Team–Market Fit",
  early_demand: "Early Demand",
  traffic_authority: "Traffic Authority",
  marketing_product_fit: "Marketing Fit",
};

function getEvidenceIcon(evidence: Evidence) {
  switch (evidence.added_by) {
    case "user":
      return <User size={14} className="text-blue-500" />;
    case "agent":
      return <Brain size={14} className="text-purple-500" />;
    case "system":
      return <Robot size={14} className="text-gray-500" />;
    default:
      return <Globe size={14} className="text-green-500" />;
  }
}

function getEvidenceTypeLabel(type: Evidence["type"]): string {
  switch (type) {
    case "manual_input":
      return "Manual Input";
    case "auto_fetch":
      return "Auto-fetched";
    case "peer_proof":
      return "Peer Proof";
    case "prospect_pulse":
      return "Prospect Survey";
    case "seo_metric":
      return "SEO Data";
    case "social_metric":
      return "Social Data";
    case "survey_response":
      return "Survey Response";
    case "conversation":
      return "Conversation";
    case "user_statement":
      return "User Statement";
    case "market_research":
      return "Market Research";
    case "competitive_analysis":
      return "Competitive Analysis";
    case "demo_feedback":
      return "Demo Feedback";
    case "metrics":
      return "Metrics";
    default:
      return "Other";
  }
}

function formatEvidenceValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return value.toString();
  if (typeof value === "object" && value !== null) {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}

export function EvidenceAccordion({ checklist }: EvidenceAccordionProps) {
  const [expandedFactor, setExpandedFactor] = useState<ChecklistKey | null>(
    null
  );
  const [expandedEvidence, setExpandedEvidence] = useState<string | null>(null);

  // Get factors that have evidence
  const factorsWithEvidence = Object.entries(checklist).filter(
    ([_, item]) => item.evidence && item.evidence.length > 0
  ) as [ChecklistKey, ChecklistItem][];

  if (factorsWithEvidence.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        <Globe size={32} className="mx-auto mb-2 opacity-50" />
        <p>No evidence collected yet</p>
        <p className="text-sm">
          Evidence will appear here as the assessment progresses
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold mb-3">Evidence Details</h3>

      {factorsWithEvidence.map(([factorKey, item]) => {
        const isExpanded = expandedFactor === factorKey;
        const evidenceCount = item.evidence.length;

        return (
          <div
            key={factorKey}
            className="border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <button
              type="button"
              className="w-full p-3 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
              onClick={() => setExpandedFactor(isExpanded ? null : factorKey)}
            >
              <div className="flex items-center gap-3">
                {isExpanded ? (
                  <CaretDown size={16} />
                ) : (
                  <CaretRight size={16} />
                )}
                <div>
                  <div className="font-medium">{FACTOR_NAMES[factorKey]}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {evidenceCount} evidence item
                    {evidenceCount !== 1 ? "s" : ""}
                    {item.score !== null && (
                      <span className="ml-2">• Score: {item.score}/5</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-500 dark:text-gray-400">
                Evidence Strength: {item.evidence_strength}/3
              </div>
            </button>

            {isExpanded && (
              <div className="px-3 pb-3 space-y-2">
                {item.evidence.map((evidence) => {
                  const isEvidenceExpanded =
                    expandedEvidence === evidence.evidence_id;

                  return (
                    <div
                      key={evidence.evidence_id}
                      className="border border-gray-100 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800"
                    >
                      <button
                        type="button"
                        className="w-full p-2 text-left flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        onClick={() =>
                          setExpandedEvidence(
                            isEvidenceExpanded ? null : evidence.evidence_id
                          )
                        }
                      >
                        <div className="flex items-center gap-2">
                          {getEvidenceIcon(evidence)}
                          <div>
                            <div className="text-sm font-medium">
                              {getEvidenceTypeLabel(evidence.type)}
                            </div>
                            {evidence.source && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {evidence.source}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {evidence.confidence && (
                            <div className="text-xs text-gray-500">
                              {Math.round(evidence.confidence * 100)}%
                            </div>
                          )}
                          {isEvidenceExpanded ? (
                            <CaretDown size={14} />
                          ) : (
                            <CaretRight size={14} />
                          )}
                        </div>
                      </button>

                      {isEvidenceExpanded && (
                        <div className="px-2 pb-2 space-y-2">
                          {evidence.notes && (
                            <div className="text-sm">
                              <div className="font-medium text-gray-700 dark:text-gray-300">
                                Notes:
                              </div>
                              <div className="text-gray-600 dark:text-gray-400">
                                {evidence.notes}
                              </div>
                            </div>
                          )}

                          <div className="text-sm">
                            <div className="font-medium text-gray-700 dark:text-gray-300">
                              Value:
                            </div>
                            <div className="text-gray-600 dark:text-gray-400 font-mono text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded max-h-32 overflow-auto">
                              {formatEvidenceValue(evidence.value)}
                            </div>
                          </div>

                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Added{" "}
                            {new Date(evidence.timestamp).toLocaleString()} by{" "}
                            {evidence.added_by}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
