import type { AppAgentState } from "../agent/AppAgent";
import type { ShareExportOptions } from "./share-asset-generator";
import type {
  Idea,
  ChecklistKey,
  ChecklistItem,
  Evidence,
  IdeaMetrics,
  DerivedScores
} from "../types/assessment";
import { ExportScoreDial } from "../components/export/ExportScoreDial";
import { ExportFactorGrid } from "../components/export/ExportFactorGrid";

export interface ShareAssetTemplateProps {
  agentState: AppAgentState;
  options: ShareExportOptions;
  dimensions: { width: number; height: number };
}

/**
 * IdeaPotential Share Asset Template
 * Reuses actual presentation components for high-quality exports
 */
export function ShareAssetTemplate({
  agentState,
  options,
  dimensions
}: ShareAssetTemplateProps) {
  const { theme, format } = options;
  const isDark = theme === "dark";
  const isSquare = format === "square";

  console.log("[ShareAssetTemplate] Generating export with options:", options);
  console.log("[ShareAssetTemplate] Agent state structure:", {
    hasCurrentIdea: !!agentState?.currentIdea,
    hasIdeas: !!agentState?.ideas,
    ideasLength: agentState?.ideas?.length,
    hasUserInfo: !!agentState?.userInfo,
    currentIdeaKeys: agentState?.currentIdea
      ? Object.keys(agentState.currentIdea)
      : [],
    currentIdeaType: typeof agentState?.currentIdea,
    hasChecklist: !!(agentState?.currentIdea as any)?.checklist,
    hasDerived: !!(agentState?.currentIdea as any)?.derived
  });

  // Check if we have assessment data
  const hasAssessment = Boolean(agentState?.currentIdea);

  if (!hasAssessment) {
    console.log(
      "[ShareAssetTemplate] No assessment data found, using placeholder"
    );
  }

  // Create default empty assessment state for display
  const getEmptyIdea = (): Idea => {
    const emptyMetrics: IdeaMetrics = {};
    const emptyItem = (): ChecklistItem => ({
      score: null,
      evidence_strength: 0,
      evidence: [] as Evidence[]
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
      marketing_product_fit: emptyItem()
    };
    const derived: DerivedScores = {
      potential_score: 35,
      actualization_score: 15,
      potential_bucket: "yellow",
      actualization_bucket: "red"
    };
    return {
      idea_id: "empty",
      title: "Ready to validate your startup idea?",
      one_liner: "Get a brutally honest assessment in 15 minutes",
      stage: "concept",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metrics: emptyMetrics,
      checklist,
      derived,
      recommended_tweak: undefined
    };
  };

  const assessmentData: Idea = hasAssessment
    ? (agentState.currentIdea as unknown as Idea)
    : getEmptyIdea();

  const checklistForUi = assessmentData.checklist as Record<
    ChecklistKey,
    ChecklistItem
  >;

  // Color scheme
  const colors = {
    background: isDark ? "#0f172a" : "#ffffff",
    surface: isDark ? "#1e293b" : "#f8fafc",
    border: isDark ? "#334155" : "#e2e8f0",
    text: isDark ? "#f1f5f9" : "#0f172a",
    textSecondary: isDark ? "#94a3b8" : "#64748b",
    accent: "#F48120",
    accentSecondary: "#f97316"
  };

  // Scaling for high-resolution rendering
  const scale = isSquare ? 1 : 1; // Base scale, already 2x in dimensions

  const config = {
    fontSize: {
      title: isSquare ? 48 * scale : 52 * scale,
      subtitle: isSquare ? 28 * scale : 32 * scale,
      body: isSquare ? 24 * scale : 28 * scale,
      small: isSquare ? 20 * scale : 24 * scale,
      tiny: isSquare ? 16 * scale : 20 * scale
    },
    spacing: {
      large: isSquare ? 48 * scale : 60 * scale,
      medium: isSquare ? 32 * scale : 40 * scale,
      small: isSquare ? 24 * scale : 30 * scale,
      tiny: isSquare ? 16 * scale : 20 * scale
    },
    dialSize: isSquare ? 280 * scale : 320 * scale
  };

  if (isSquare) {
    // Square layout - idea overview, score dials, simplified factor indicators
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: dimensions.width,
          height: dimensions.height,
          backgroundColor: colors.background,
          padding: `${config.spacing.large}px`,
          fontFamily: "system-ui, -apple-system, sans-serif"
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            marginBottom: config.spacing.large
          }}
        >
          <div
            style={{
              backgroundColor: colors.accent,
              color: "white",
              padding: "12px 32px",
              borderRadius: "24px",
              fontSize: config.fontSize.small,
              fontWeight: "600",
              marginBottom: config.spacing.small
            }}
          >
            IDEAPOTENTIAL
          </div>

          <h1
            style={{
              fontSize: config.fontSize.title,
              fontWeight: "bold",
              color: colors.text,
              margin: "0 0 16px 0",
              lineHeight: "1.1",
              maxWidth: "90%"
            }}
          >
            {assessmentData.title}
          </h1>

          <p
            style={{
              fontSize: config.fontSize.subtitle,
              color: colors.textSecondary,
              margin: "0 0 16px 0",
              maxWidth: "80%"
            }}
          >
            {assessmentData.one_liner}
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "24px",
              fontSize: config.fontSize.small,
              color: colors.textSecondary
            }}
          >
            <span>Stage: {assessmentData.stage}</span>
            <span>•</span>
            <span>
              Updated:{" "}
              {new Date(assessmentData.updated_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Score Dials */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: `${config.spacing.large}px`,
            marginBottom: config.spacing.large
          }}
        >
          <ExportScoreDial
            derived={assessmentData.derived}
            scoreType="potential"
            size={config.dialSize}
          />
          <ExportScoreDial
            derived={assessmentData.derived}
            scoreType="actualization"
            size={config.dialSize}
          />
        </div>

        {/* Simplified Factor Grid */}
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start"
          }}
        >
          <ExportFactorGrid
            checklist={checklistForUi}
            derived={assessmentData.derived}
            variant="simple"
          />
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: config.spacing.medium,
            paddingTop: config.spacing.medium,
            borderTop: `2px solid ${colors.border}`
          }}
        >
          <span
            style={{
              fontSize: config.fontSize.small,
              color: colors.textSecondary,
              fontWeight: "500"
            }}
          >
            ideapotential.com • {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>
    );
  }

  // Mobile layout - full detailed presentation like the web version
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: dimensions.width,
        height: dimensions.height,
        backgroundColor: colors.background,
        padding: `${config.spacing.large}px`,
        fontFamily: "system-ui, -apple-system, sans-serif"
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          marginBottom: config.spacing.large
        }}
      >
        <div
          style={{
            backgroundColor: colors.accent,
            color: "white",
            padding: "16px 40px",
            borderRadius: "28px",
            fontSize: config.fontSize.body,
            fontWeight: "700",
            marginBottom: config.spacing.small,
            display: "flex"
          }}
        >
          IDEAPOTENTIAL ASSESSMENT
        </div>

        <div
          style={{
            fontSize: config.fontSize.title,
            fontWeight: "bold",
            color: colors.text,
            margin: "0 0 20px 0",
            lineHeight: "1.1",
            display: "flex"
          }}
        >
          {assessmentData.title}
        </div>

        <div
          style={{
            fontSize: config.fontSize.subtitle,
            color: colors.textSecondary,
            margin: "0 0 20px 0",
            lineHeight: "1.3",
            display: "flex"
          }}
        >
          {assessmentData.one_liner}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            fontSize: config.fontSize.small,
            color: colors.textSecondary
          }}
        >
          <div style={{ display: "flex" }}>Stage: {assessmentData.stage}</div>
          <div style={{ display: "flex" }}>•</div>
          <div style={{ display: "flex" }}>
            Updated: {new Date(assessmentData.updated_at).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Score Dials */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: `${config.spacing.large}px`,
          marginBottom: config.spacing.large,
          padding: `${config.spacing.medium}px`,
          backgroundColor: colors.surface,
          borderRadius: "24px"
        }}
      >
        <ExportScoreDial
          derived={assessmentData.derived}
          scoreType="potential"
          size={config.dialSize}
        />
        <ExportScoreDial
          derived={assessmentData.derived}
          scoreType="actualization"
          size={config.dialSize}
        />
      </div>

      {/* Recommended Tweak */}
      {hasAssessment && assessmentData.recommended_tweak && (
        <div
          style={{
            padding: `${config.spacing.small}px`,
            backgroundColor: isDark ? "#1e3a8a" : "#dbeafe",
            borderRadius: "16px",
            marginBottom: config.spacing.medium,
            border: `2px solid ${isDark ? "#3b82f6" : "#60a5fa"}`,
            display: "flex",
            flexDirection: "column"
          }}
        >
          <div
            style={{
              fontSize: config.fontSize.body,
              fontWeight: "700",
              color: isDark ? "#93c5fd" : "#1e40af",
              margin: "0 0 8px 0",
              display: "flex"
            }}
          >
            🚀 Recommended Next Step
          </div>
          <div
            style={{
              fontSize: config.fontSize.small,
              color: isDark ? "#bfdbfe" : "#1e40af",
              margin: "0",
              lineHeight: "1.4",
              display: "flex"
            }}
          >
            {assessmentData.recommended_tweak}
          </div>
        </div>
      )}

      {/* Full Factor Assessment */}
      <div
        style={{
          marginBottom: config.spacing.large,
          display: "flex",
          flexDirection: "column"
        }}
      >
        <ExportFactorGrid
          checklist={checklistForUi}
          derived={assessmentData.derived}
          variant="full"
        />
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: "auto",
          paddingTop: config.spacing.medium,
          borderTop: `2px solid ${colors.border}`
        }}
      >
        <div
          style={{
            fontSize: config.fontSize.small,
            color: colors.textSecondary,
            fontWeight: "600",
            display: "flex"
          }}
        >
          ideapotential.com • Assessment completed{" "}
          {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
