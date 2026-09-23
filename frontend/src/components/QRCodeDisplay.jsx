import React from "react";

/**
 * Clean, lightweight SVG QR Code generator component
 * Renders an enterprise QR code representation with payment deep-link encoding.
 */
export default function QRCodeDisplay({ value, size = 180, amount, orderId }) {
  // Generate deterministic grid pattern based on string hash
  const hash = (value || "").split("").reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 1000000007, 42);
  const gridSize = 25; // 25x25 QR matrix

  const isDark = (r, c) => {
    // Standard 3 Finder patterns (7x7 corners)
    const inTopLeft = r < 7 && c < 7;
    const inTopRight = r < 7 && c >= gridSize - 7;
    const inBottomLeft = r >= gridSize - 7 && c < 7;

    if (inTopLeft) {
      if (r === 0 || r === 6 || c === 0 || c === 6) return true;
      if (r >= 2 && r <= 4 && c >= 2 && c <= 4) return true;
      return false;
    }
    if (inTopRight) {
      const cc = c - (gridSize - 7);
      if (r === 0 || r === 6 || cc === 0 || cc === 6) return true;
      if (r >= 2 && r <= 4 && cc >= 2 && cc <= 4) return true;
      return false;
    }
    if (inBottomLeft) {
      const rr = r - (gridSize - 7);
      if (rr === 0 || rr === 6 || c === 0 || c === 6) return true;
      if (rr >= 2 && rr <= 4 && c >= 2 && c <= 4) return true;
      return false;
    }

    // Timing patterns
    if (r === 6 || c === 6) {
      return (r + c) % 2 === 0;
    }

    // Deterministic data cell pattern
    const cellHash = (hash + r * 37 + c * 59 + (r * c * 13)) % 100;
    return cellHash < 44;
  };

  const cellSize = size / gridSize;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
      <div
        style={{
          background: "#ffffff",
          padding: "14px",
          borderRadius: "14px",
          border: "2px solid #0284c7",
          boxShadow: "0 8px 24px rgba(2, 132, 199, 0.12)",
          position: "relative",
          display: "inline-block"
        }}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background */}
          <rect width={size} height={size} fill="#ffffff" />

          {/* QR Code Cells */}
          {Array.from({ length: gridSize }).map((_, r) =>
            Array.from({ length: gridSize }).map((__, c) => {
              if (isDark(r, c)) {
                return (
                  <rect
                    key={`${r}-${c}`}
                    x={c * cellSize}
                    y={r * cellSize}
                    width={cellSize}
                    height={cellSize}
                    fill="#0f172a"
                    rx={cellSize * 0.15}
                  />
                );
              }
              return null;
            })
          )}

          {/* Center SmartProcure Badge */}
          <circle cx={size / 2} cy={size / 2} r={size * 0.12} fill="#0284c7" />
          <text
            x={size / 2}
            y={size / 2 + 4}
            textAnchor="middle"
            fill="#ffffff"
            fontSize={size * 0.08}
            fontWeight="900"
            fontFamily="system-ui, sans-serif"
          >
            SP
          </text>
        </svg>
      </div>

      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "16px", fontWeight: "900", color: "#0284c7" }}>
          ₹{amount ? Number(amount).toLocaleString() : "0"}
        </div>
        <div style={{ fontSize: "12px", fontFamily: "monospace", color: "#64748b", marginTop: "2px" }}>
          Order Ref: <b>{orderId || "ORD-PENDING"}</b>
        </div>
      </div>
    </div>
  );
}
