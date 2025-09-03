import React from "react";
import type { AppAgentState } from "../agent/AppAgent";
import type { ShareExportOptions } from "./share-asset-generator";
import type {
  Idea,
  ChecklistKey,
  ChecklistItem,
  DerivedScores
} from "../types/assessment";

export interface ShareAssetTemplateProps {
  agentState: AppAgentState;
  options: ShareExportOptions;
  dimensions: { width: number; height: number };
}

/**
 * IdeaPotential Share Asset Template
 * Customized for startup idea assessment export
 */
export function ShareAssetTemplate({
  agentState,
  options,
  dimensions
}: ShareAssetTemplateProps) {
  const { theme, format } = options;
  const isDark = theme === "dark";
  const isSquare = format === "square";
  const isMobile = format === "mobile";

  // Check if there's actual assessment data available
  const hasCurrentIdea = Boolean(agentState?.currentIdea);
  const hasIdeasArray = Boolean(
    agentState?.ideas &&
      Array.isArray(agentState.ideas) &&
      agentState.ideas.length > 0
  );
  const isAssessmentComplete = Boolean(
    agentState?.assessmentProgress?.isAssessmentComplete
  );

  console.log("[ShareAssetTemplate] Assessment status:", {
    hasCurrentIdea,
    hasIdeasArray,
    isAssessmentComplete,
    currentIdea: agentState?.currentIdea,
    ideasCount: agentState?.ideas?.length || 0,
    fullAgentState: agentState
  });

  // If no assessment data is available, return an error message export instead of crashing
  if (!hasCurrentIdea && !hasIdeasArray && !isAssessmentComplete) {
    console.log(
      "[ShareAssetTemplate] No assessment data found, creating placeholder export"
    );

    // Create a simple "no assessment" export instead of throwing an error
    const assessmentData = {
      title: "No Assessment Available",
      one_liner: "Complete an idea assessment to generate an export",
      stage: "none",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      derived: {
        potential_score: 0,
        actualization_score: 0,
        potential_bucket: "unknown",
        actualization_bucket: "unknown"
      },
      checklist: {},
      recommended_tweak:
        "Start by assessing a startup idea to see results here."
    } as unknown as Idea;

    // Continue with the placeholder data
  } else {
    // Try to get real assessment data
    let assessmentData: Idea | null = null;

    if (agentState?.currentIdea) {
      assessmentData = agentState.currentIdea as unknown as Idea;
    } else if (
      agentState?.ideas &&
      Array.isArray(agentState.ideas) &&
      agentState.ideas.length > 0
    ) {
      assessmentData = agentState.ideas[
        agentState.ideas.length - 1
      ] as unknown as Idea;
    }

    if (!assessmentData) {
      throw new Error(
        `Expected assessment data but none found. Check export button visibility logic.`
      );
    }
  }

  // Use the determined assessment data (either real or placeholder)
  const assessmentData: Idea = hasCurrentIdea
    ? (agentState.currentIdea as unknown as Idea)
    : hasIdeasArray
      ? (agentState.ideas[agentState.ideas.length - 1] as unknown as Idea)
      : ({
          title: "No Assessment Available",
          one_liner: "Complete an idea assessment to generate an export",
          stage: "none",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          derived: {
            potential_score: 0,
            actualization_score: 0,
            potential_bucket: "unknown",
            actualization_bucket: "unknown"
          },
          checklist: {},
          recommended_tweak:
            "Start by assessing a startup idea to see results here."
        } as unknown as Idea);

  // Colors based on theme
  const colors = isDark
    ? {
        bg: "#171717",
        cardBg: "#262626",
        text: "#ffffff",
        textSecondary: "#a3a3a3",
        accent: "#F48120",
        border: "#404040",
        blue: {
          bg: "#1e3a8a20",
          border: "#1e40af",
          text: "#93c5fd",
          textSecondary: "#bfdbfe"
        }
      }
    : {
        bg: "#ffffff",
        cardBg: "#f5f5f5",
        text: "#171717",
        textSecondary: "#525252",
        accent: "#F48120",
        border: "#e5e5e5",
        blue: {
          bg: "#dbeafe",
          border: "#3b82f6",
          text: "#1e40af",
          textSecondary: "#1e40af"
        }
      };

  // Format-specific sizing
  const config = isSquare
    ? {
        headerPadding: "40px",
        fontSize: {
          title: "28px",
          subtitle: "14px",
          description: "16px",
          small: "12px"
        },
        spacing: { gap: "20px", marginBottom: "25px" },
        maxWidth: "90%"
      }
    : {
        headerPadding: "30px",
        fontSize: {
          title: "26px",
          subtitle: "13px",
          description: "15px",
          small: "11px"
        },
        spacing: { gap: "18px", marginBottom: "22px" },
        maxWidth: "85%"
      };

  // Score dial component (simplified for static export)
  const ScoreDial = ({
    scoreType,
    score,
    bucket
  }: {
    scoreType: "potential" | "actualization";
    score: number;
    bucket: string;
  }) => {
    const size = isSquare ? 80 : 70;
    const strokeWidth = 6;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    const getColors = () => {
      switch (bucket) {
        case "green":
          return { stroke: "#10b981", text: "#059669" };
        case "yellow":
          return { stroke: "#f59e0b", text: "#d97706" };
        case "red":
          return { stroke: "#ef4444", text: "#dc2626" };
        default:
          return { stroke: "#6b7280", text: "#6b7280" };
      }
    };

    const dialColors = getColors();

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        <div style={{ display: "flex", position: "relative" }}>
          <svg
            width={size}
            height={size}
            style={{ transform: "rotate(-90deg)" }}
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={isDark ? "#404040" : "#e5e7eb"}
              strokeWidth={strokeWidth}
              fill="none"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={dialColors.stroke}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div
            style={{
              position: "absolute",
              inset: "0",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: isSquare ? "16px" : "14px",
                fontWeight: "bold",
                color: dialColors.text
              }}
            >
              {bucket === "unknown" ? "—" : `${Math.round(score)}%`}
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: "8px",
            textAlign: "center",
            fontSize: config.fontSize.small,
            color: colors.textSecondary
          }}
        >
          {scoreType === "potential" ? "Potential" : "Actualization"}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        backgroundColor: colors.bg,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: config.headerPadding
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          maxWidth: config.maxWidth,
          marginBottom: config.spacing.marginBottom
        }}
      >
        {/* IdeaPotential Brand */}
        <div
          style={{
            display: "flex",
            backgroundColor: colors.accent,
            color: "white",
            padding: "8px 16px",
            borderRadius: "20px",
            fontSize: config.fontSize.small,
            fontWeight: "600",
            marginBottom: "20px"
          }}
        >
          IDEAPOTENTIAL
        </div>

        {/* Idea Title & One-liner */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            width: "100%"
          }}
        >
          <h1
            style={{
              fontSize: config.fontSize.title,
              fontWeight: "bold",
              color: colors.text,
              marginBottom: "8px",
              lineHeight: "1.2"
            }}
          >
            {assessmentData.title}
          </h1>
          <p
            style={{
              fontSize: config.fontSize.subtitle,
              color: colors.textSecondary,
              marginBottom: "16px"
            }}
          >
            {assessmentData.one_liner}
          </p>

          <div
            style={{
              display: "flex",
              fontSize: config.fontSize.small,
              color: colors.textSecondary,
              marginBottom: "20px"
            }}
          >
            Stage: {assessmentData.stage} • Updated:{" "}
            {new Date(assessmentData.updated_at).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Score Dials */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: isSquare ? "40px" : "30px",
          marginBottom: config.spacing.marginBottom,
          width: "100%"
        }}
      >
        <ScoreDial
          scoreType="potential"
          score={assessmentData.derived.potential_score}
          bucket={assessmentData.derived.potential_bucket}
        />
        <ScoreDial
          scoreType="actualization"
          score={assessmentData.derived.actualization_score}
          bucket={assessmentData.derived.actualization_bucket}
        />
      </div>

      {/* Key Assessment Factors (simplified) */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          maxWidth: config.maxWidth,
          backgroundColor: colors.cardBg,
          border: `1px solid ${colors.border}`,
          borderRadius: "12px",
          padding: "20px",
          marginBottom: config.spacing.marginBottom
        }}
      >
        <h3
          style={{
            fontSize: config.fontSize.subtitle,
            fontWeight: "600",
            color: colors.text,
            marginBottom: "16px",
            textAlign: "center"
          }}
        >
          Assessment Highlights
        </h3>
        <div
          style={{
            display: "flex",
            flexDirection: isSquare ? "row" : "column",
            gap: "12px",
            justifyContent: "space-between"
          }}
        >
          {/* Show top few factors with scores */}
          {Object.entries(assessmentData.checklist || {}).length > 0 ? (
            Object.entries(assessmentData.checklist || {})
              .slice(0, isSquare ? 4 : 6)
              .map(([key, item]) => {
                const getFactorLabel = (key: string) => {
                  const labels: Record<string, string> = {
                    problem_clarity: "Problem Clarity",
                    market_pain_mentions: "Market Pain",
                    competitive_moat: "Competitive Moat",
                    team_solution_fit: "Team-Solution Fit",
                    solution_evidence: "Solution Evidence",
                    early_demand: "Early Demand"
                  };
                  return (
                    labels[key] ||
                    key
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())
                  );
                };

                const score = item?.score;
                const hasScore = score !== null && score !== undefined;

                return (
                  <div
                    key={key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: config.fontSize.small,
                      color: colors.text
                    }}
                  >
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: hasScore
                          ? score >= 7
                            ? "#10b981"
                            : score >= 4
                              ? "#f59e0b"
                              : "#ef4444"
                          : colors.border
                      }}
                    />
                    <span>{getFactorLabel(key)}</span>
                    {hasScore && (
                      <span style={{ color: colors.textSecondary }}>
                        {score}/10
                      </span>
                    )}
                  </div>
                );
              })
          ) : (
            <div
              style={{
                display: "flex",
                fontSize: config.fontSize.small,
                color: colors.textSecondary,
                textAlign: "center",
                fontStyle: "italic"
              }}
            >
              Assessment factors will appear here after completing an idea
              evaluation
            </div>
          )}
        </div>
      </div>

      {/* Recommended Next Step */}
      {assessmentData.recommended_tweak && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            maxWidth: config.maxWidth,
            backgroundColor: colors.blue.bg,
            border: `1px solid ${colors.blue.border}`,
            borderRadius: "12px",
            padding: "20px",
            marginBottom: config.spacing.marginBottom
          }}
        >
          <h4
            style={{
              fontSize: config.fontSize.subtitle,
              fontWeight: "600",
              color: colors.blue.text,
              marginBottom: "8px"
            }}
          >
            Recommended Next Step
          </h4>
          <p
            style={{
              fontSize: config.fontSize.description,
              color: colors.blue.textSecondary,
              lineHeight: "1.4"
            }}
          >
            {assessmentData.recommended_tweak}
          </p>
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          display: "flex",
          fontSize: config.fontSize.small,
          color: colors.textSecondary,
          marginTop: "auto",
          paddingTop: "20px"
        }}
      >
        ideapotential.com • {new Date().toLocaleDateString()}
      </div>
    </div>
  );
}
