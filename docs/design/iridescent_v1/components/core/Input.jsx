import React from "react";
export function Input({ label, hint, mono, value, onChange, placeholder, type = "text", inputMode, style, id }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0, flex: style?.flex, width: style?.width }}>
      {label && <span style={{ font: "var(--text-heading)", color: "var(--text-primary)" }}>{label}{hint && <span style={{ marginLeft: 6, font: "var(--text-meta)", color: "var(--text-tertiary)" }}>{hint}</span>}</span>}
      <input id={id} type={type} inputMode={inputMode} value={value} placeholder={placeholder} onChange={(e) => onChange && onChange(e.target.value)}
        style={{ height: "var(--control-h)", borderRadius: "var(--radius-input)", border: "1px solid var(--border-default)", background: "var(--bg-surface)", padding: "0 14px", width: "100%", minWidth: 0, boxSizing: "border-box",
          font: mono ? "var(--text-num-sm)" : "var(--text-body)", fontWeight: mono ? 500 : 500, color: "var(--text-primary)", outline: "none" }} />
    </label>
  );
}
