import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f172a",
        borderRadius: 38,
      }}
    >
      <svg viewBox="0 0 512 512" width="140" height="140">
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
    </div>,
    { ...size },
  );
}
