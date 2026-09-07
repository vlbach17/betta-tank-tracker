import React from "react";
export function Avatar({ src, alt = "Spunk", size = 48, ring = true, square = false, style }) {
  const r = square ? 14 : "50%";
  return (
    <div style={{ width: size, height: size, borderRadius: r, padding: ring ? "var(--avatar-ring)" : 0, background: ring ? "var(--gradient-spunk-diag)" : "transparent", flexShrink: 0, ...style }}>
      {src ? <img src={src} alt={alt} style={{ width: "100%", height: "100%", borderRadius: r, objectFit: "cover", objectPosition: "35% 40%", border: ring ? "2px solid var(--pearl)" : "none", boxSizing: "border-box", display: "block" }} />
        : <div style={{ width: "100%", height: "100%", borderRadius: r, background: "var(--mist)", border: ring ? "2px solid var(--pearl)" : "none", boxSizing: "border-box" }} />}
    </div>
  );
}
