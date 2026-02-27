export type BadgeStyle = "mystical" | "flat" | "plastic" | "glass";

interface BadgeOptions {
  username: string;
  score: number;
  grade: string;
  style?: BadgeStyle;
  label?: string;
  showIcon?: boolean;
}

const SCORE_COLORS = {
  S: { from: "#FF00FF", to: "#00FFFF" }, // Super/A++
  A: { from: "#00FFFF", to: "#008B8B" },
  B: { from: "#00CC99", to: "#006666" },
  C: { from: "#FFCC00", to: "#996600" },
  D: { from: "#FF6600", to: "#993300" },
  F: { from: "#FF0000", to: "#660000" },
};

export function generateBadgeSvg({
  score,
  grade,
  style = "mystical",
  label = "GitScore",
  showIcon = true,
}: BadgeOptions): string {
  const baseGrade = grade.charAt(0);
  const colors = SCORE_COLORS[baseGrade as keyof typeof SCORE_COLORS] || SCORE_COLORS.F;

  const width = label.length * 7 + 70 + (showIcon ? 20 : 0);
  const height = 28;
  const radius = style === "mystical" ? 8 : style === "flat" ? 0 : 4;

  const iconSvg = showIcon ? `
    <g transform="translate(8, 6) scale(0.65)">
      <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="url(#grad)" />
      <path d="M2 17L12 22L22 17" stroke="url(#grad)" stroke-width="2" fill="none" />
      <path d="M2 12L12 17L22 12" stroke="url(#grad)" stroke-width="2" fill="none" />
    </g>
  ` : '';

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.from};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colors.to};stop-opacity:1" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Background */}
      <rect width="${width}" height="${height}" rx="${radius}" fill="#0A0F14" />
      <rect width="${width}" height="${height}" rx="${radius}" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" />

      {/* Label Area */}
      <text x="${showIcon ? 30 : 10}" y="18" font-family="Arial, sans-serif" font-weight="bold" font-size="11" fill="rgba(255,255,255,0.6)">
        ${label}
      </text>

      {/* Score Area */}
      <rect x="${width - 45}" y="4" width="38" height="20" rx="4" fill="url(#grad)" opacity="0.1" />
      <text x="${width - 26}" y="19" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="14" fill="url(#grad)" filter="${style === 'mystical' ? 'url(#glow)' : 'none'}">
        ${score}
      </text>

      ${iconSvg}

      {/* Glossy Overlay (Plastic Style) */}
      ${style === "plastic" ? `
        <rect width="${width}" height="${height / 2}" rx="${radius}" fill="rgba(255,255,255,0.1)" />
      ` : ''}
    </svg>
  `.replace(/{|}/g, '').trim(); // Basic clean for template tags if present
}
