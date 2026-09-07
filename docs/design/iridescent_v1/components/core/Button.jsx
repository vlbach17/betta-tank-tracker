import React, { useState } from "react";
export function Button({ variant = "primary", size = "lg", disabled, children, onClick, style, type = "button" }) {
  const [pressed, setPressed] = useState(false);
  const [hover, setHover] = useState(false);
  const h = size === "lg" ? "var(--button-h)" : size === "md" ? "var(--control-h)" : "36px";
  const base = {
    height: h, padding: size === "lg" ? "0 24px" : "0 18px", borderRadius: "var(--radius-pill)", border: "none",
    font: size === "sm" ? "var(--text-label-sm)" : "var(--text-label)", fontSize: size === "lg" ? 16 : undefined, // lg steps up one notch for the pinned CTA
    cursor: disabled ? "default" : "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, whiteSpace: "nowrap",
    transition: "transform var(--dur-fast) var(--ease-out), opacity var(--dur-fast), background-position 420ms var(--ease-out), box-shadow var(--dur-base) var(--ease-out)", transform: pressed && !disabled ? "scale(.98)" : "none",
    opacity: disabled ? 0.4 : pressed ? 0.9 : 1, width: style?.width, fontFamily: "var(--font-sans)",
  };
  const variants = {
    primary: {
      backgroundImage: "var(--gradient-cta-track)", backgroundSize: "200% 100%",
      backgroundPosition: hover && !disabled ? "100% 0" : "0 0",
      color: "var(--text-on-accent)",
      boxShadow: disabled ? "none" : hover ? "0 8px 24px rgba(184, 37, 111, .28)" : "var(--shadow-cta)",
    },
    ink: { background: "var(--ink)", color: "#fff" },
    secondary: { background: "var(--bg-control)", color: "var(--text-primary)" },
    outline: { background: "var(--bg-surface)", color: "var(--text-primary)", border: "1px solid var(--border-default)" },
    danger: { background: "var(--status-bad-fill)", color: "#fff" },
  };
  return (
    <button type={type} disabled={disabled} onClick={onClick} style={{ ...base, ...variants[variant], ...style }}
      onPointerEnter={() => setHover(true)} onPointerDown={() => setPressed(true)} onPointerUp={() => setPressed(false)}
      onPointerLeave={() => { setPressed(false); setHover(false); }}>
      {children}
    </button>
  );
}
