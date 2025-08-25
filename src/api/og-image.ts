export async function handleOgImage(
  request: Request,
  _env: Env
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const title = url.searchParams.get("title") || "Ideapotential";
    const description =
      url.searchParams.get("description") ||
      "Validate startup ideas with a 10-factor assessment";
    const scoreParam = url.searchParams.get("score");
    const score = scoreParam ? Number.parseFloat(scoreParam) : undefined;

    // For now, return a simple SVG-based OG image
    // This works in all environments without requiring browser rendering
    const scoreColor =
      score !== undefined
        ? score >= 3.5
          ? "#4ade80"
          : score >= 2.5
            ? "#fbbf24"
            : "#f87171"
        : "white";

    const scoreText = score !== undefined ? `${score.toFixed(1)}/5.0` : "";

    const svg = `
      <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="1200" height="630" fill="url(#grad)"/>

        <!-- Logo/Brand Area -->
        <g transform="translate(60, 60)">
          <rect x="0" y="0" width="80" height="80" rx="16" fill="rgba(255,255,255,0.2)"/>
          <text x="40" y="50" text-anchor="middle" fill="white" font-family="Inter, system-ui, sans-serif" font-size="32" font-weight="bold">💡</text>
          <text x="110" y="35" fill="white" font-family="Inter, system-ui, sans-serif" font-size="24" font-weight="600" opacity="0.9">Ideapotential</text>
          <text x="110" y="55" fill="white" font-family="Inter, system-ui, sans-serif" font-size="14" opacity="0.7">Startup Validation</text>
        </g>

        <!-- Main Title -->
        <text x="600" y="280" text-anchor="middle" fill="white" font-family="Inter, system-ui, sans-serif" font-size="64" font-weight="bold">${title}</text>

        <!-- Description -->
        <text x="600" y="340" text-anchor="middle" fill="white" font-family="Inter, system-ui, sans-serif" font-size="28" opacity="0.9">${description}</text>

        <!-- Score Display (if provided) -->
        ${
          score !== undefined
            ? `
        <g transform="translate(600, 400)">
          <text x="0" y="0" text-anchor="middle" fill="${scoreColor}" font-family="Inter, system-ui, sans-serif" font-size="48" font-weight="bold">${scoreText}</text>
          <text x="0" y="30" text-anchor="middle" fill="white" font-family="Inter, system-ui, sans-serif" font-size="18" opacity="0.8">Potential Score</text>
        </g>
        `
            : ""
        }

        <!-- Bottom Accent -->
        <rect x="60" y="590" width="1080" height="4" fill="rgba(255,255,255,0.3)" rx="2"/>

        <!-- Corner Decoration -->
        <rect x="1100" y="40" width="60" height="60" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="3" rx="12"/>
      </svg>
    `;

    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("Error generating OG image:", error);

    // Return a fallback image or error response
    return new Response("Error generating image", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
