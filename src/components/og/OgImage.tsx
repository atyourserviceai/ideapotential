interface OgImageProps {
  title?: string;
  description?: string;
  score?: number;
}

export default function OgImage({
  title = "Ideapotential",
  description = "Validate startup ideas with a 10-factor assessment",
  score,
}: OgImageProps) {
  return (
    <div
      style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        fontFamily: "Inter, system-ui, sans-serif",
        padding: "60px",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {/* Logo/Brand Area */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "40px",
        }}
      >
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "16px",
            background: "rgba(255, 255, 255, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: "20px",
            fontSize: "32px",
            fontWeight: "bold",
          }}
        >
          💡
        </div>
        <div>
          <div
            style={{
              fontSize: "24px",
              fontWeight: "600",
              opacity: 0.9,
            }}
          >
            Ideapotential
          </div>
          <div
            style={{
              fontSize: "14px",
              opacity: 0.7,
              marginTop: "4px",
            }}
          >
            Startup Validation
          </div>
        </div>
      </div>

      {/* Main Title */}
      <h1
        style={{
          fontSize: "64px",
          fontWeight: "bold",
          textAlign: "center",
          margin: "0 0 20px 0",
          lineHeight: "1.1",
          maxWidth: "1000px",
        }}
      >
        {title}
      </h1>

      {/* Description */}
      <p
        style={{
          fontSize: "28px",
          textAlign: "center",
          margin: "0 0 30px 0",
          opacity: 0.9,
          maxWidth: "900px",
          lineHeight: "1.4",
        }}
      >
        {description}
      </p>

      {/* Score Display (if provided) */}
      {score !== undefined && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginTop: "20px",
          }}
        >
          <div
            style={{
              fontSize: "48px",
              fontWeight: "bold",
              color:
                score >= 3.5 ? "#4ade80" : score >= 2.5 ? "#fbbf24" : "#f87171",
            }}
          >
            {score.toFixed(1)}/5.0
          </div>
          <div
            style={{
              fontSize: "18px",
              opacity: 0.8,
            }}
          >
            Potential Score
          </div>
        </div>
      )}

      {/* Bottom Accent */}
      <div
        style={{
          position: "absolute",
          bottom: "40px",
          left: "60px",
          right: "60px",
          height: "4px",
          background: "rgba(255, 255, 255, 0.3)",
          borderRadius: "2px",
        }}
      />

      {/* Corner Decoration */}
      <div
        style={{
          position: "absolute",
          top: "40px",
          right: "40px",
          width: "60px",
          height: "60px",
          border: "3px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "12px",
        }}
      />
    </div>
  );
}
