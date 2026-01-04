import type {
  ChecklistKey,
  ChecklistItem,
  DerivedScores
} from "../../types/assessment";

interface ExportFactorGridProps {
  checklist: Record<ChecklistKey, ChecklistItem>;
  derived: DerivedScores;
  variant: "full" | "simple"; // full for mobile, simple for square
}

// Factor display names and block sets
const FACTOR_INFO: Record<
  ChecklistKey,
  { name: string; shortName: string; blockSet: "Potential" | "Actualization" }
> = {
  problem_clarity: {
    name: "Problem Clarity",
    shortName: "Problem",
    blockSet: "Potential"
  },
  market_pain_mentions: {
    name: "Market-Pain Mentions",
    shortName: "Market Pain",
    blockSet: "Potential"
  },
  outcome_gap: {
    name: "Outcome Satisfaction Gap",
    shortName: "Outcome Gap",
    blockSet: "Potential"
  },
  competitive_moat: {
    name: "Competitive Moat",
    shortName: "Moat",
    blockSet: "Potential"
  },
  team_solution_fit: {
    name: "Team–Solution Fit",
    shortName: "Team-Solution",
    blockSet: "Potential"
  },
  solution_evidence: {
    name: "Solution Evidence & Value",
    shortName: "Solution",
    blockSet: "Potential"
  },
  team_market_fit: {
    name: "Team–Market Fit",
    shortName: "Team-Market",
    blockSet: "Potential"
  },
  early_demand: {
    name: "Early Demand (+Social)",
    shortName: "Demand",
    blockSet: "Actualization"
  },
  traffic_authority: {
    name: "Traffic Authority (SEO / RAO)",
    shortName: "Traffic",
    blockSet: "Actualization"
  },
  marketing_product_fit: {
    name: "Marketing-Product Fit",
    shortName: "Marketing",
    blockSet: "Actualization"
  }
};

function getScoreColor(score: number | null): string {
  if (score === null) return "#9ca3af"; // gray-400
  if (score <= 1) return "#ef4444"; // red-500
  if (score <= 2) return "#f87171"; // red-400
  if (score <= 3) return "#eab308"; // yellow-500
  if (score <= 4) return "#facc15"; // yellow-400
  return "#10b981"; // emerald-500
}

function getScoreIcon(score: number | null): string {
  if (score === null) return "○";
  if (score <= 2) return "●"; // solid red/orange
  if (score <= 3) return "●"; // solid yellow
  return "●"; // solid green
}

export function ExportFactorGrid({
  checklist,
  variant
}: ExportFactorGridProps) {
  const potentialFactors = Object.entries(FACTOR_INFO)
    .filter(([, info]) => info.blockSet === "Potential")
    .map(([key]) => key as ChecklistKey);

  const actualizationFactors = Object.entries(FACTOR_INFO)
    .filter(([, info]) => info.blockSet === "Actualization")
    .map(([key]) => key as ChecklistKey);

  if (variant === "simple") {
    // Simple grid for square format - just icons
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Potential Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div
            style={{
              fontSize: "20px",
              fontWeight: "700",
              color: "#374151",
              margin: "0",
              display: "flex"
            }}
          >
            Potential (7 factors)
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              alignItems: "center"
            }}
          >
            {potentialFactors.map((key) => {
              const item = checklist[key];
              const score = item?.score;
              return (
                <div
                  key={key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "16px"
                  }}
                >
                  <div
                    style={{
                      color: getScoreColor(score),
                      fontSize: "20px",
                      display: "flex"
                    }}
                  >
                    {getScoreIcon(score)}
                  </div>
                  <div
                    style={{
                      color: "#6b7280",
                      fontSize: "14px",
                      display: "flex"
                    }}
                  >
                    {FACTOR_INFO[key].shortName}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actualization Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div
            style={{
              fontSize: "20px",
              fontWeight: "700",
              color: "#374151",
              margin: "0",
              display: "flex"
            }}
          >
            Actualization (3 factors)
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              alignItems: "center"
            }}
          >
            {actualizationFactors.map((key) => {
              const item = checklist[key];
              const score = item?.score;
              return (
                <div
                  key={key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "16px"
                  }}
                >
                  <div
                    style={{
                      color: getScoreColor(score),
                      fontSize: "20px",
                      display: "flex"
                    }}
                  >
                    {getScoreIcon(score)}
                  </div>
                  <div
                    style={{
                      color: "#6b7280",
                      fontSize: "14px",
                      display: "flex"
                    }}
                  >
                    {FACTOR_INFO[key].shortName}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Full grid for mobile format
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Potential Section */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            fontSize: "24px",
            fontWeight: "700",
            color: "#374151",
            marginBottom: "16px",
            display: "flex"
          }}
        >
          Potential Assessment (7 factors)
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px"
          }}
        >
          {potentialFactors.map((key) => {
            const item = checklist[key];
            const score = item?.score;
            const evidenceCount = item?.evidence?.length || 0;
            return (
              <div
                key={key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 16px",
                  backgroundColor: "#f9fafb",
                  borderRadius: "8px",
                  gap: "12px"
                }}
              >
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    backgroundColor: getScoreColor(score),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    color: "white",
                    fontWeight: "bold",
                    flexShrink: 0
                  }}
                >
                  {score || "?"}
                </div>
                <div
                  style={{ flex: 1, display: "flex", flexDirection: "column" }}
                >
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#374151",
                      display: "flex"
                    }}
                  >
                    {FACTOR_INFO[key].name}
                  </div>
                  {evidenceCount > 0 && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#6b7280",
                        marginTop: "2px",
                        display: "flex"
                      }}
                    >
                      {evidenceCount} evidence item
                      {evidenceCount !== 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actualization Section */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            fontSize: "24px",
            fontWeight: "700",
            color: "#374151",
            marginBottom: "16px",
            display: "flex"
          }}
        >
          Actualization Assessment (3 factors)
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px"
          }}
        >
          {actualizationFactors.map((key) => {
            const item = checklist[key];
            const score = item?.score;
            const evidenceCount = item?.evidence?.length || 0;
            return (
              <div
                key={key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 16px",
                  backgroundColor: "#f9fafb",
                  borderRadius: "8px",
                  gap: "12px"
                }}
              >
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    backgroundColor: getScoreColor(score),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    color: "white",
                    fontWeight: "bold",
                    flexShrink: 0
                  }}
                >
                  {score || "?"}
                </div>
                <div
                  style={{ flex: 1, display: "flex", flexDirection: "column" }}
                >
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#374151",
                      display: "flex"
                    }}
                  >
                    {FACTOR_INFO[key].name}
                  </div>
                  {evidenceCount > 0 && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#6b7280",
                        marginTop: "2px",
                        display: "flex"
                      }}
                    >
                      {evidenceCount} evidence item
                      {evidenceCount !== 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
