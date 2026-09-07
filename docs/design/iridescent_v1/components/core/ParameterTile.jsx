import React, { useState } from "react";
import { StatusDot } from "./StatusDot.jsx";
import { StatusPill } from "./StatusPill.jsx";
export function ParameterTile({ name, unit, value, rangeText, ago, status = "in-range", hero = false, onClick, style }) {
  const [pressed, setPressed] = useState(false);
  const overdue = status === "overdue";
  const num = value == null ? "–" : value;
  const base = { borderRadius: "var(--radius-tile)", padding: hero ? 18 : 16, background: overdue ? "var(--bg-surface-muted)" : "var(--bg-surface)", border: overdue ? "1px dashed var(--border-dashed)" : "1px solid var(--border-default)",
    boxShadow: overdue ? "none" : "var(--shadow-tile)", cursor: onClick ? "pointer" : "default", textAlign: "left", transition: "transform var(--dur-fast) var(--ease-out)", transform: pressed ? "scale(.98)" : "none", color: "var(--text-primary)", boxSizing: "border-box", width: "100%" };
  const press = { onPointerDown: () => setPressed(true), onPointerUp: () => setPressed(false), onPointerLeave: () => setPressed(false) };
  const meta = <span style={{ font: "var(--text-meta)", color: overdue ? "var(--text-secondary)" : "var(--text-tertiary)" }}>{[rangeText, unit && !hero ? unit : null, ago].filter(Boolean).join(" · ")}</span>;
  if (hero) return (
    <button type="button" onClick={onClick} {...press} style={{ ...base, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, gridColumn: "1 / -1", ...style }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
        <span style={{ font: "var(--text-heading)" }}>{name}{unit && <span style={{ marginLeft: 6, font: "var(--text-meta-md)", color: "var(--text-tertiary)" }}>{unit}</span>}</span>
        {meta}
        <StatusPill status={status} size="sm" style={{ marginTop: 4, fontSize: 11, padding: "6px 10px" }} />
      </div>
      <span style={{ font: "var(--text-num-xl)", fontVariantNumeric: "tabular-nums", color: status === "out-of-range" ? "var(--status-bad)" : "var(--text-primary)" }}>{num}</span>
    </button>
  );
  return (
    <button type="button" onClick={onClick} {...press} style={{ ...base, display: "flex", flexDirection: "column", gap: 10, ...style }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
        <span style={{ font: "var(--text-heading)", color: overdue ? "var(--text-secondary)" : "var(--text-primary)" }}>{name}</span>
        {overdue ? <StatusPill status="overdue" size="sm" /> : <StatusDot status={status} />}
      </div>
      <span style={{ font: "var(--text-num-lg)", fontVariantNumeric: "tabular-nums", color: overdue ? "var(--text-tertiary)" : "var(--text-primary)" }}>{num}</span>
      {meta}
    </button>
  );
}
