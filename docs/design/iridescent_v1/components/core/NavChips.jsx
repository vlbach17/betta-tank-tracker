import React from "react";
export function NavChips({ items = [], value, onChange, style }) {
  return (
    <div style={{ display: "flex", gap: 8, ...style }}>
      {items.map((it) => {
        const on = it.value === value;
        return <button key={it.value} type="button" onClick={() => onChange && onChange(it.value)} style={{ height: 36, padding: "0 14px", borderRadius: "var(--radius-pill)", border: "none", cursor: "pointer",
          background: on ? "var(--ink)" : "var(--bg-control)", color: on ? "#fff" : "var(--text-secondary)", font: "var(--text-label)", fontWeight: on ? 700 : 500, textTransform: "capitalize" }}>{it.label}</button>;
      })}
    </div>
  );
}
