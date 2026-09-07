import React from "react";
// Ideal-range field: two small mono inputs plus a two-thumb slider over the plausible bounds.
const CSS = `
.bb-rf-slider{position:relative;height:24px}
.bb-rf-slider input[type=range]{position:absolute;left:0;top:0;width:100%;height:24px;margin:0;background:none;pointer-events:none;-webkit-appearance:none;appearance:none}
.bb-rf-slider input[type=range]:focus{outline:none}
.bb-rf-slider input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;pointer-events:auto;width:20px;height:20px;border-radius:50%;background:var(--bg-surface);border:2px solid var(--royal);box-shadow:var(--shadow-segment);cursor:grab;transition:transform var(--dur-fast) var(--ease-out)}
.bb-rf-slider input[type=range]::-webkit-slider-thumb:active{transform:scale(1.1);cursor:grabbing}
.bb-rf-slider input[type=range]::-moz-range-thumb{pointer-events:auto;width:20px;height:20px;border-radius:50%;background:var(--bg-surface);border:2px solid var(--royal);box-shadow:var(--shadow-segment);cursor:grab}
.bb-rf-track{position:absolute;left:2px;right:2px;top:10px;height:4px;border-radius:var(--radius-pill);background:var(--bg-control)}
.bb-rf-fill{position:absolute;top:0;bottom:0;border-radius:var(--radius-pill);background:var(--royal)}
.bb-rf-num{height:var(--control-h);width:84px;box-sizing:border-box;border-radius:var(--radius-input);border:1px solid var(--border-default);background:var(--bg-surface);padding:0 12px;font:var(--text-num-sm);font-variant-numeric:tabular-nums;color:var(--text-primary);outline:none;text-align:center}
.bb-rf-num:focus{border-color:var(--royal)}
`;
export function RangeField({ label = "Ideal range", unit, min = 0, max = 100, step = 0.1, value = { min: 0, max: 0 }, onChange, hint, style }) {
  const lo = value.min == null ? min : Number(value.min);
  const hi = value.max == null ? max : Number(value.max);
  const pct = (v) => ((Math.min(Math.max(v, min), max) - min) / (max - min || 1)) * 100;
  const set = (next) => onChange && onChange({ min: next.min, max: next.max });
  const prec = (String(step).split(".")[1] || "").length;
  const round = (v) => Number((Math.round(v / step) * step).toFixed(prec));
  const clamp = (v) => round(Math.min(Math.max(v, min), max));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, ...style }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span style={{ font: "var(--text-heading)" }}>{label}{unit && <span style={{ marginLeft: 6, font: "var(--text-meta-md)", color: "var(--text-tertiary)" }}>{unit}</span>}</span>
        {hint && <span style={{ font: "var(--text-meta)", color: "var(--text-tertiary)" }}>{hint}</span>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <input className="bb-rf-num" inputMode="decimal" aria-label={label + " minimum"} value={value.min ?? ""} onChange={(e) => set({ min: e.target.value === "" ? null : Math.min(clamp(Number(e.target.value)), value.max == null ? max : Number(value.max)), max: value.max })} />
        <span style={{ font: "var(--text-meta-md)", color: "var(--text-tertiary)" }}>to</span>
        <input className="bb-rf-num" inputMode="decimal" aria-label={label + " maximum"} value={value.max ?? ""} onChange={(e) => set({ min: value.min, max: e.target.value === "" ? null : Math.max(clamp(Number(e.target.value)), value.min == null ? min : Number(value.min)) })} />
        <div className="bb-rf-slider" style={{ flex: 1, minWidth: 90 }}>
          <div className="bb-rf-track"><div className="bb-rf-fill" style={{ left: pct(lo) + "%", right: 100 - pct(hi) + "%" }} /></div>
          <input type="range" min={min} max={max} step={step} value={lo} onChange={(e) => set({ min: round(Math.min(Number(e.target.value), hi)), max: value.max })} />
          <input type="range" min={min} max={max} step={step} value={hi} onChange={(e) => set({ min: value.min, max: round(Math.max(Number(e.target.value), lo)) })} />
        </div>
      </div>
    </div>
  );
}
