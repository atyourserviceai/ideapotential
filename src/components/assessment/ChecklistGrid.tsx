import { CheckCircle, Clock, Warning } from "@phosphor-icons/react";
import type {
  ChecklistKey,
  ChecklistItem,
  DerivedScores,
} from "../../types/assessment";

interface ChecklistGridProps {
  checklist: Record<ChecklistKey, ChecklistItem>;
  derived: DerivedScores;
}

// Factor display names, descriptions, and block sets
const FACTOR_INFO: Record<
  ChecklistKey,
  { name: string; description: string; blockSet: "Potential" | "Actualization" }
> = {
  problem_clarity: {
    name: "Problem Clarity",
    description: "One-sentence JTBD anyone could repeat",
    blockSet: "Potential",
  },
  market_pain_mentions: {
    name: "Market-Pain Mentions",
    description: "50+ public posts or ≥5 direct convos confirming pain",
    blockSet: "Potential",
  },
  outcome_gap: {
    name: "Outcome Satisfaction Gap",
    description: "Users rate pain 'importance 5 / satisfaction ≤2'",
    blockSet: "Potential",
  },
  competitive_moat: {
    name: "Competitive Moat",
    description: "≥1 power rated ≥4 (Hamilton's 7 Powers)",
    blockSet: "Potential",
  },
  team_solution_fit: {
    name: "Team–Solution Fit",
    description: "Deep domain edge & high personal passion",
    blockSet: "Potential",
  },
  solution_evidence: {
    name: "Solution Evidence & Value",
    description: "Working demo + viable unit economics",
    blockSet: "Potential",
  },
  team_market_fit: {
    name: "Team–Market Fit",
    description: "Market size can support the necessary team size",
    blockSet: "Potential",
  },
  early_demand: {
    name: "Early Demand (+Social)",
    description: "Paid pre-orders or 100+ wait-list with engaged followers",
    blockSet: "Actualization",
  },
  traffic_authority: {
    name: "Traffic Authority (SEO / RAO)",
    description: "DR > 50 or 10k/mo organic or surfaced in top-3 RAG answers",
    blockSet: "Actualization",
  },
  marketing_product_fit: {
    name: "Marketing-Product Fit",
    description: "Proven CAC < LTV / 3 on real spend",
    blockSet: "Actualization",
  },
};

function getScoreColor(score: number | null): string {
  if (score === null) return "bg-gray-200 dark:bg-gray-700";
  if (score <= 1) return "bg-red-500";
  if (score <= 2) return "bg-red-400";
  if (score <= 3) return "bg-yellow-500";
  if (score <= 4) return "bg-yellow-400";
  return "bg-green-500";
}

function getEvidenceIcon(evidenceStrength: number, evidenceCount: number) {
  if (evidenceCount === 0) {
    return <Clock size={16} className="text-gray-400" />;
  }
  if (evidenceStrength >= 2) {
    return <CheckCircle size={16} className="text-green-500" />;
  }
  return <Warning size={16} className="text-yellow-500" />;
}

export function ChecklistGrid({ checklist, derived }: ChecklistGridProps) {
  const factors = Object.keys(FACTOR_INFO) as ChecklistKey[];
  const potentialFactors = factors.filter(
    (key) => FACTOR_INFO[key].blockSet === "Potential"
  );
  const actualizationFactors = factors.filter(
    (key) => FACTOR_INFO[key].blockSet === "Actualization"
  );

  const renderFactorSection = (
    sectionFactors: ChecklistKey[],
    title: string,
    score: number,
    bucket: string
  ) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-md font-semibold">{title}</h4>
        <div
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            bucket === "green"
              ? "bg-green-100 text-green-800"
              : bucket === "yellow"
                ? "bg-yellow-100 text-yellow-800"
                : bucket === "red"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
          }`}
        >
          {bucket === "unknown" ? "—" : `${Math.round(score)}%`}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {sectionFactors.map((key) => {
          const item = checklist[key];
          const info = FACTOR_INFO[key];
          const score = item?.score ?? null;
          const evidenceCount = item?.evidence?.length ?? 0;
          const evidenceStrength = item?.evidence_strength ?? 0;

          return (
            <div
              key={key}
              className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h5 className="font-medium text-sm">{info.name}</h5>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {info.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  {getEvidenceIcon(evidenceStrength, evidenceCount)}
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-md flex items-center justify-center text-white text-xs font-bold ${getScoreColor(score)}`}
                    >
                      {score !== null ? score : "—"}
                    </div>
                  </div>
                </div>
              </div>

              {evidenceCount > 0 && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {evidenceCount} evidence item{evidenceCount !== 1 ? "s" : ""}
                  {evidenceStrength > 0 && (
                    <span className="ml-1">
                      (strength: {evidenceStrength}/3)
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">10-Factor Assessment</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Two separate scores show whether to focus on validation or
          fundamentals
        </p>
      </div>

      {renderFactorSection(
        potentialFactors,
        "Potential (7 factors)",
        derived.potential_score,
        derived.potential_bucket
      )}

      {renderFactorSection(
        actualizationFactors,
        "Actualization (3 factors)",
        derived.actualization_score,
        derived.actualization_bucket
      )}

      <div className="text-xs text-gray-500 dark:text-gray-400 mt-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>Pending evidence</span>
          </div>
          <div className="flex items-center gap-1">
            <Warning size={12} />
            <span>Weak evidence</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle size={12} />
            <span>Strong evidence</span>
          </div>
        </div>
      </div>
    </div>
  );
}
