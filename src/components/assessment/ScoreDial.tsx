import { useEffect, useState } from "react";
import type { DerivedScores } from "../../types/assessment";

interface ScoreDialProps {
  derived: DerivedScores;
  className?: string;
  scoreType: "potential" | "actualization";
}

export function ScoreDial({
  derived,
  className = "",
  scoreType,
}: ScoreDialProps) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const targetPercentage =
    scoreType === "potential"
      ? derived.potential_score
      : derived.actualization_score;
  const bucket =
    scoreType === "potential"
      ? derived.potential_bucket
      : derived.actualization_bucket;

  // Animate the dial on mount or when percentage changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercentage(targetPercentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [targetPercentage]);

  // Calculate circle properties
  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset =
    circumference - (animatedPercentage / 100) * circumference;

  // Color based on bucket
  const getColors = () => {
    switch (bucket) {
      case "green":
        return {
          stroke: "#10b981", // emerald-500
          bg: "#d1fae5", // emerald-100
          text: "text-emerald-700",
        };
      case "yellow":
        return {
          stroke: "#f59e0b", // amber-500
          bg: "#fef3c7", // amber-100
          text: "text-amber-700",
        };
      case "red":
        return {
          stroke: "#ef4444", // red-500
          bg: "#fee2e2", // red-100
          text: "text-red-700",
        };
      default: // "unknown"
        return {
          stroke: "#6b7280", // gray-500
          bg: "#f3f4f6", // gray-100
          text: "text-gray-700",
        };
    }
  };

  const colors = getColors();

  const getReadinessLabel = () => {
    if (bucket === "unknown") return "Unknown";
    if (targetPercentage >= 70) return "Strong";
    if (targetPercentage >= 40) return "Promising";
    return "High Risk";
  };

  const getScoreDescription = () => {
    if (bucket === "unknown") return "Not enough data to assess";
    if (scoreType === "potential") {
      if (bucket === "green") return "Strong fundamentals, solid foundation";
      if (bucket === "yellow") return "Good basics but needs improvement";
      return "Weak fundamentals, major gaps";
    }
    if (bucket === "green") return "Strong market traction";
    if (bucket === "yellow") return "Some progress, needs more";
    return "No market validation yet";
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative">
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
          role="img"
          aria-label="Idea Readiness Score Dial"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb" // gray-200
            strokeWidth={strokeWidth}
            fill="none"
            className="dark:stroke-gray-600"
          />

          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.stroke}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`text-2xl font-bold ${colors.text}`}>
            {bucket === "unknown" ? "—" : `${Math.round(animatedPercentage)}%`}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {scoreType === "potential" ? "Potential" : "Actualization"}
          </div>
        </div>
      </div>

      {/* Label below dial */}
      <div className="mt-3 text-center">
        <div className={`text-sm font-medium ${colors.text}`}>
          {getReadinessLabel()}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {getScoreDescription()}
        </div>
      </div>
    </div>
  );
}
