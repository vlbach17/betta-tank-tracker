import React from "react";
import { Icon } from "./Icon.jsx";
export function IconButton({ icon = "kebab", label, onClick, tone = "default", style }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} style={{ width: "var(--tap-min)", height: "var(--tap-min)", borderRadius: "50%", border: "none", cursor: "pointer",
      background: tone === "plain" ? "transparent" : "var(--bg-control)", color: tone === "danger" ? "var(--bad)" : "var(--text-primary)", display: "inline-flex", alignItems: "center", justifyContent: "center", ...style }}>
      <Icon name={icon} size={icon === "trash" ? 18 : 20} />
    </button>
  );
}
