import type {
  ChecklistKey,
  ChecklistItem,
  DerivedScores,
} from "../../types/assessment";

// Define which factors belong to which category
const POTENTIAL_FACTORS: ChecklistKey[] = [
  "problem_clarity",
  "market_pain_mentions",
  "outcome_gap",
  "competitive_moat",
  "team_solution_fit",
  "solution_evidence",
  "team_market_fit",
];

const ACTUALIZATION_FACTORS: ChecklistKey[] = [
  "early_demand",
  "traffic_authority",
  "marketing_product_fit",
];

/**
 * Calculate separate Potential and Actualization scores from checklist
 */
export function calculateDerivedScores(
  checklist: Record<ChecklistKey, ChecklistItem>
): DerivedScores {
  // Calculate Potential Score (7 factors, max 35 points)
  const potentialScores = POTENTIAL_FACTORS.map(
    (key) => checklist[key]?.score ?? 0
  );
  const potentialTotal = potentialScores.reduce((sum, score) => sum + score, 0);
  const potentialMaxScore = POTENTIAL_FACTORS.length * 5; // 7 * 5 = 35
  const potentialScore =
    potentialMaxScore > 0 ? (potentialTotal / potentialMaxScore) * 100 : 0;

  // Calculate Actualization Score (3 factors, max 15 points)
  const actualizationScores = ACTUALIZATION_FACTORS.map(
    (key) => checklist[key]?.score ?? 0
  );
  const actualizationTotal = actualizationScores.reduce(
    (sum, score) => sum + score,
    0
  );
  const actualizationMaxScore = ACTUALIZATION_FACTORS.length * 5; // 3 * 5 = 15
  const actualizationScore =
    actualizationMaxScore > 0
      ? (actualizationTotal / actualizationMaxScore) * 100
      : 0;

  // Determine bucket colors based on score and evidence quality
  const potentialBucket = getScoreBucket(
    potentialScore,
    POTENTIAL_FACTORS,
    checklist
  );
  const actualizationBucket = getScoreBucket(
    actualizationScore,
    ACTUALIZATION_FACTORS,
    checklist
  );

  return {
    potential_score: Math.round(potentialScore),
    actualization_score: Math.round(actualizationScore),
    potential_bucket: potentialBucket,
    actualization_bucket: actualizationBucket,
  };
}

/**
 * Determine score bucket (color) based on percentage and evidence quality
 */
function getScoreBucket(
  scorePercentage: number,
  factors: ChecklistKey[],
  checklist: Record<ChecklistKey, ChecklistItem>
): "unknown" | "red" | "yellow" | "green" {
  // Check if we have enough evidence to make a determination
  const factorsWithEvidence = factors.filter((key) => {
    const item = checklist[key];
    return (
      item &&
      (item.score !== null || (item.evidence && item.evidence.length > 0))
    );
  });

  // If less than half the factors have any evidence, it's unknown
  if (factorsWithEvidence.length < Math.ceil(factors.length / 2)) {
    return "unknown";
  }

  // Standard color buckets based on percentage
  if (scorePercentage >= 70) return "green";
  if (scorePercentage >= 40) return "yellow";
  return "red";
}

/**
 * Get a summary of what needs improvement most
 */
export function getTopImprovementOpportunity(
  checklist: Record<ChecklistKey, ChecklistItem>
): {
  factor: ChecklistKey;
  score: number;
  category: "potential" | "actualization";
} | null {
  const allFactors = [...POTENTIAL_FACTORS, ...ACTUALIZATION_FACTORS];

  let lowestScore = 6; // Higher than max possible score
  let lowestFactor: ChecklistKey | null = null;
  let lowestCategory: "potential" | "actualization" | null = null;

  for (const factor of allFactors) {
    const item = checklist[factor];
    const score = item?.score ?? 0;

    if (score < lowestScore) {
      lowestScore = score;
      lowestFactor = factor;
      lowestCategory = POTENTIAL_FACTORS.includes(factor)
        ? "potential"
        : "actualization";
    }
  }

  if (lowestFactor && lowestCategory) {
    return {
      factor: lowestFactor,
      score: lowestScore,
      category: lowestCategory,
    };
  }

  return null;
}
