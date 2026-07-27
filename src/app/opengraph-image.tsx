import { ImageResponse } from "next/og";

export const alt = "LearningStack — Gamified Learning for Developers";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f172a",
        fontFamily: "monospace",
      }}
    >
      <svg viewBox="0 0 512 512" width="160" height="160">
        <g transform="translate(256,240)">
          <polygon
            points="-120,60 0,100 120,60 0,20"
            fill="#334155"
            stroke="#10b981"
            strokeWidth="6"
            strokeLinejoin="round"
          />
          <polygon
            points="-120,20 0,60 120,20 0,-20"
            fill="#1e293b"
            stroke="#10b981"
            strokeWidth="6"
            strokeLinejoin="round"
          />
          <polygon
            points="-120,-20 0,20 120,-20 0,-60"
            fill="#0f172a"
            stroke="#10b981"
            strokeWidth="6"
            strokeLinejoin="round"
          />
          <text
            x="0"
            y="-90"
            textAnchor="middle"
            fontFamily="monospace"
            fontWeight="bold"
            fontSize="72"
            fill="#10b981"
          >
            {">_"}
          </text>
        </g>
      </svg>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 4,
          marginTop: 32,
        }}
      >
        <span style={{ color: "#64748b", fontSize: 48 }}>&lt;</span>
        <span style={{ color: "#f8fafc", fontSize: 48, fontWeight: 700 }}>LearningStack</span>
        <span style={{ color: "#64748b", fontSize: 48 }}>/&gt;</span>
      </div>
      <span style={{ color: "#94a3b8", fontSize: 24, marginTop: 16 }}>
        Gamified Learning for Developers
      </span>
    </div>,
    { ...size },
  );
}
