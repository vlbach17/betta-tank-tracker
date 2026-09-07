import React from "react";
export const RANGE_OPTIONS = [{ value: "30", label: "30 days" }, { value: "90", label: "90 days" }, { value: "all", label: "All time" }];
export function RangeToggle({ value = "30", onChange, options = RANGE_OPTIONS, style }) {
  return (
    <div role="tablist" style={{ display: "flex", gap: 6, padding: 4, borderRadius: "var(--radius-pill)", background: "var(--bg-control)", ...style }}>
      {options.map((o) => {
        const on = o.value === value;
        return <button key={o.value} role="tab" aria-selected={on} type="button" onClick={() => onChange && onChange(o.value)}
          style={{ flex: 1, height: 36, border: "none", borderRadius: "var(--radius-pill)", cursor: "pointer", font: "var(--text-label)", fontWeight: on ? 700 : 600,
            background: on ? "var(--bg-surface)" : "transparent", color: on ? "var(--text-primary)" : "var(--text-secondary)", boxShadow: on ? "var(--shadow-segment)" : "none", transition: "all var(--dur-base) var(--ease-out)" }}>{o.label}</button>;
      })}
    </div>
  );
}
