import React from "react";
// Phone-width app shell: pearl background, 20px gutters, optional fixed bottom bar.
export function Shell({ children, bottom, style }) {
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: "var(--screen-max)", margin: "0 auto", minHeight: "100%", background: "var(--bg-app)", fontFamily: "var(--font-sans)", color: "var(--text-primary)", display: "flex", flexDirection: "column", ...style }}>
      <div style={{ flex: 1, padding: bottom ? "20px 20px 112px" : "20px 20px 32px", display: "flex", flexDirection: "column", gap: 18 }}>{children}</div>
      {bottom && <div style={{ position: "sticky", bottom: 0, padding: "12px 20px calc(env(safe-area-inset-bottom) + 16px)", background: "linear-gradient(180deg, rgba(251,251,254,0), var(--bg-app) 40%)" }}>{bottom}</div>}
    </div>
  );
}
export function ScreenTitle({ children, sub, name, titleStyle, nameStyle }) {
  return <div style={{ display: "flex", flexDirection: "column", gap: 4 }}><h1 style={{ margin: 0, font: "var(--text-page-title)", letterSpacing: 0, textTransform: "lowercase", ...titleStyle }}>{name && <span style={{ font: "var(--text-name)", letterSpacing: 0, marginRight: 6, ...nameStyle }}>{name}</span>}{children}</h1>{sub && <span style={{ font: "var(--text-caption)", color: "var(--text-tertiary)" }}>{sub}</span>}</div>;
}
export function Card({ children, hero, style }) {
  return <div style={{ borderRadius: hero ? "var(--radius-card)" : "var(--radius-tile)", padding: hero ? 20 : 16, background: hero ? "var(--bg-hero)" : "var(--bg-surface)", border: hero ? "none" : "1px solid var(--border-default)", boxShadow: hero ? "none" : "var(--shadow-tile)", display: "flex", flexDirection: "column", gap: 10, ...style }}>{children}</div>;
}
export function Row({ children, style }) {
  return <div style={{ borderRadius: "var(--radius-row)", padding: "14px 16px", background: "var(--bg-surface)", border: "1px solid var(--border-default)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, ...style }}>{children}</div>;
}
export function Notice({ tone = "bad", children }) {
  return <p style={{ margin: 0, padding: "12px 14px", borderRadius: "var(--radius-input)", background: tone === "good" ? "var(--status-good-fill)" : "var(--status-bad-fill)", color: tone === "good" ? "var(--status-good-fg)" : "#fff", font: "var(--text-body-sm)", fontWeight: 600 }}>{children}</p>;
}
