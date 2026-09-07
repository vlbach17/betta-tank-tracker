import React from "react";
const LABEL = { "in-range": "In range", watch: "Watch", "out-of-range": "Out of range", overdue: "Overdue", unknown: "No range set" };
const STYLE = {
  "in-range": { background: "var(--status-good-fill)", color: "var(--status-good-fg)" },
  watch: { background: "var(--status-watch)", color: "var(--status-watch-fg)" },
  "out-of-range": { background: "var(--status-bad-fill)", color: "#fff" },
  overdue: { background: "var(--status-overdue)", color: "var(--status-overdue-fg)" },
  unknown: { background: "var(--status-overdue)", color: "var(--status-overdue-fg)" },
};
export function StatusPill({ status = "in-range", size = "md", children, style }) {
  const small = size === "sm";
  return <span style={{ display: "inline-flex", alignItems: "center", padding: small ? "4px 8px" : "7px 12px", borderRadius: "var(--radius-pill)", font: small ? "var(--text-label-sm)" : "var(--text-label)", fontSize: small ? 11 : 13, fontWeight: 700, textTransform: "lowercase", letterSpacing: ".25px", whiteSpace: "nowrap", ...STYLE[status], ...style }}>{children || LABEL[status]}</span>;
}
