import type { DerivedScores } from "../../types/assessment";

interface ExportScoreDialProps {
  derived: DerivedScores;
  scoreType: "potential" | "actualization";
  size?: number;
}

export function ExportScoreDial({
  derived,
  scoreType,
  size = 200
}: ExportScoreDialProps) {
  const targetPercentage = 
    scoreType === "potential" 
      ? derived.potential_score 
      : derived.actualization_score;
  const bucket = 
    scoreType === "potential" 
      ? derived.potential_bucket 
      : derived.actualization_bucket;

  // Calculate circle properties with higher resolution scaling
  const strokeWidth = Math.max(12, size / 16);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (targetPercentage / 100) * circumference;

  // Color based on bucket
  const getColors = () => {
    switch (bucket) {
      case "green":
        return {
          stroke: "#10b981", // emerald-500
          bg: "#d1fae5", // emerald-100  
          text: "#047857" // emerald-700
        };
      case "yellow":
        return {
          stroke: "#f59e0b", // amber-500
          bg: "#fef3c7", // amber-100
          text: "#b45309" // amber-700
        };
      case "red":
        return {
          stroke: "#ef4444", // red-500
          bg: "#fee2e2", // red-100
          text: "#b91c1c" // red-700
        };
      default: // "unknown"
        return {
          stroke: "#6b7280", // gray-500
          bg: "#f3f4f6", // gray-100
          text: "#374151" // gray-700
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

  const fontSize = size / 8;
  const smallFontSize = size / 12;

  return (
    <div 
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: `${size / 20}px`
      }}
    >
      <div
        style={{
          position: "relative",
          width: `${size}px`,
          height: `${size}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        {/* Background circle */}
        <svg
          width={size}
          height={size}
          style={{
            position: "absolute",
            transform: "rotate(-90deg)"
          }}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="none"
          />
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
            style={{
              transition: "stroke-dashoffset 1s ease-in-out"
            }}
          />
        </svg>

        {/* Center content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center"
          }}
        >
          <div
            style={{
              fontSize: `${fontSize}px`,
              fontWeight: "bold",
              color: colors.text,
              lineHeight: "1",
              display: "flex"
            }}
          >
            {targetPercentage}%
          </div>
          <div
            style={{
              fontSize: `${smallFontSize}px`,
              color: colors.text,
              marginTop: `${size / 40}px`,
              opacity: 0.8,
              display: "flex"
            }}
          >
            {getReadinessLabel()}
          </div>
        </div>
      </div>

      {/* Label */}
      <div
        style={{
          fontSize: `${smallFontSize}px`,
          fontWeight: "600",
          color: "#374151",
          textAlign: "center",
          display: "flex"
        }}
      >
        {scoreType === "potential" ? "Potential" : "Actualization"}
      </div>
    </div>
  );
}