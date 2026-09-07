import React from "react";
let uid = 0;
export function Sparkline({ points = [], idealMin, idealMax, width = 310, height = 120, statuses = [], showTicks = false, dotRadius = 5, gradient = true, style }) {
  const id = React.useMemo(() => "spk" + (uid++), []);
  if (!points.length) return <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center", font: "var(--text-body-sm)", color: "var(--text-tertiary)" }}>Not enough data in this range</div>;
  const vals = points.map((p) => p.value);
  let lo = Math.min(...vals, idealMin ?? Infinity), hi = Math.max(...vals, idealMax ?? -Infinity);
  if (lo === hi) { lo -= 1; hi += 1; }
  const pad = (hi - lo) * 0.12; lo -= pad; hi += pad;
  const padL = showTicks ? 30 : 8, padR = 8, padT = 8, padB = 8;
  const x = (i) => padL + (i / Math.max(points.length - 1, 1)) * (width - padL - padR);
  const y = (v) => padT + (1 - (v - lo) / (hi - lo)) * (height - padT - padB);
  const C = { "in-range": "var(--status-good)", watch: "var(--status-watch)", "out-of-range": "var(--status-bad)" };
  const ticks = showTicks ? [lo + pad, (lo + hi) / 2, hi - pad].map((v) => Math.round(v * 10) / 10) : [];
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} style={{ display: "block", overflow: "visible", ...style }}>
      <defs><linearGradient id={id} x1="0" x2="1"><stop offset="0" stopColor="#14b8c4" /><stop offset=".5" stopColor="#3b5bdb" /><stop offset="1" stopColor="#d63a8f" /></linearGradient></defs>
      {idealMin != null && idealMax != null && <rect x={padL} y={y(idealMax)} width={width - padL - padR} height={Math.max(y(idealMin) - y(idealMax), 3)} rx="8" fill="var(--chart-band)" opacity="var(--chart-band-opacity)" />}
      {ticks.map((t, i) => <text key={i} x={padL - 8} y={y(t) + 3} textAnchor="end" style={{ font: "var(--text-meta)", fill: "var(--text-tertiary)" }}>{t}</text>)}
      <polyline points={points.map((p, i) => `${x(i)},${y(p.value)}`).join(" ")} fill="none" stroke={gradient ? `url(#${id})` : "var(--royal)"} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => <circle key={i} cx={x(i)} cy={y(p.value)} r={i === points.length - 1 ? dotRadius + 1 : dotRadius} fill={C[statuses[i]] || "var(--royal)"} stroke="#fff" strokeWidth="2" />)}
    </svg>
  );
}
