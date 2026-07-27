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
      <span
        style={{
          fontWeight: 700,
          fontSize: 72,
          color: "#10b981",
          marginBottom: 12,
        }}
      >
        {">_"}
      </span>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
        }}
      >
        <div
          style={{
            width: 120,
            height: 20,
            background: "#0f172a",
            border: "3px solid #10b981",
            borderRadius: 4,
          }}
        />
        <div
          style={{
            width: 160,
            height: 20,
            background: "#1e293b",
            border: "3px solid #10b981",
            borderRadius: 4,
          }}
        />
        <div
          style={{
            width: 200,
            height: 20,
            background: "#334155",
            border: "3px solid #10b981",
            borderRadius: 4,
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 4,
          marginTop: 40,
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
