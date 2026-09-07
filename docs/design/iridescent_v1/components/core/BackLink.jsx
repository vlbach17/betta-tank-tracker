import React from "react";
import { Icon } from "./Icon.jsx";
export function BackLink({ label = "Dashboard", onClick, style }) {
  return (
    <button type="button" onClick={onClick} style={{ display: "inline-flex", alignItems: "center", gap: 10, border: "none", background: "transparent", padding: 0, cursor: "pointer", ...style }}>
      <span style={{ width: "var(--tap-min)", height: "var(--tap-min)", borderRadius: "50%", background: "var(--bg-control)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--text-primary)" }}><Icon name="chevronLeft" /></span>
      <span style={{ font: "var(--text-heading)", color: "var(--text-secondary)" }}>{label}</span>
    </button>
  );
}
