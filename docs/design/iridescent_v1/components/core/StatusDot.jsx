import React from "react";
const C = { "in-range": "var(--status-good-fill)", watch: "var(--status-watch)", "out-of-range": "var(--status-bad)", overdue: "var(--line-2)", unknown: "var(--line-2)" };
export function StatusDot({ status = "in-range", size = 10, style }) {
  return <span aria-label={status} style={{ width: size, height: size, borderRadius: "50%", background: C[status], display: "inline-block", flexShrink: 0, ...style }} />;
}
