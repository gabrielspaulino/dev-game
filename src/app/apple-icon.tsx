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
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f172a",
        borderRadius: 38,
        gap: 0,
      }}
    >
      <span
        style={{
          fontFamily: "monospace",
          fontWeight: 700,
          fontSize: 48,
          color: "#10b981",
          marginBottom: 8,
        }}
      >
        {">_"}
      </span>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
        }}
      >
        <div
          style={{
            width: 80,
            height: 14,
            background: "#0f172a",
            border: "2px solid #10b981",
            borderRadius: 3,
          }}
        />
        <div
          style={{
            width: 100,
            height: 14,
            background: "#1e293b",
            border: "2px solid #10b981",
            borderRadius: 3,
          }}
        />
        <div
          style={{
            width: 120,
            height: 14,
            background: "#334155",
            border: "2px solid #10b981",
            borderRadius: 3,
          }}
        />
      </div>
    </div>,
    { ...size },
  );
}
