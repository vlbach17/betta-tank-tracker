import React, { useState } from "react";
import { Button, IconButton, Input, RangeField, StatusPill, StatusDot, RangeToggle, NavChips, BackLink, Avatar, Sparkline, ParameterTile } from "../../components/core/index.js";
import { Shell, ScreenTitle, Card, Row, Notice } from "./Shell.jsx";
// Plausible slider bounds per parameter [min, max, step] — the span a hobbyist test kit reports, not the ideal range.
const BOUNDS = { pH: [5, 9, 0.1], Ammonia: [0, 8, 0.25], Nitrite: [0, 5, 0.25], Nitrate: [0, 80, 1], KH: [0, 20, 1], GH: [0, 20, 1], Temperature: [65, 90, 1], Phosphate: [0, 5, 0.25] };
export function Settings({ go }) {
  const D = window.BettabaseData;
  const [params, setParams] = useState(D.parameters.map((p) => ({ ...p })));
  const [nw, setNw] = useState({ name: '', unit: '', min: '', max: '' });
  const [msg, setMsg] = useState(null);
  const toggle = (id) => setParams(params.map((p) => (p.id === id ? { ...p, active: !p.active } : p)));
  const add = () => { if (!nw.name.trim()) return; setParams([...params, { id: 'p' + Date.now(), name: nw.name.trim(), unit: nw.unit.trim(), ideal_min: nw.min === '' ? null : Number(nw.min), ideal_max: nw.max === '' ? null : Number(nw.max), active: true, readings: [] }]); setNw({ name: '', unit: '', min: '', max: '' }); };
  const section = (t) => <span style={{ font: "var(--text-eyebrow)", letterSpacing: "var(--tracking-eyebrow)", textTransform: "uppercase", color: "var(--text-tertiary)" }}>{t}</span>;
  return (
    <Shell>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}><Avatar src="../../assets/spunk.png" /><ScreenTitle sub="Ranges, parameters, backup">Settings</ScreenTitle></div>
      <NavChips items={[{ value: '/', label: 'Now' }, { value: '/overview', label: 'Overview' }, { value: '/settings', label: 'Settings' }]} value="/settings" onChange={go} />
      {section('Parameters')}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {params.map((p) => (
          <Card key={p.id} style={{ background: p.active ? "var(--bg-surface)" : "var(--bg-surface-muted)", border: p.active ? "1px solid var(--border-default)" : "1px dashed var(--border-dashed)", boxShadow: p.active ? "var(--shadow-tile)" : "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ font: "var(--text-heading)", color: p.active ? "var(--text-primary)" : "var(--text-secondary)" }}>{p.name}{p.unit && <span style={{ marginLeft: 6, font: "var(--text-meta-md)", color: p.active ? "var(--text-tertiary)" : "var(--text-secondary)" }}>{p.unit}</span>}</span>
              <button type="button" onClick={() => toggle(p.id)} style={{ height: 32, padding: "0 12px", borderRadius: "var(--radius-pill)", border: "none", cursor: "pointer", font: "var(--text-label-sm)", background: p.active ? "var(--status-good-fill)" : "var(--status-overdue)", color: p.active ? "var(--status-good-fg)" : "var(--status-overdue-fg)" }}>{p.active ? 'Active' : 'Inactive'}</button>
            </div>
            <RangeField label="Ideal range" min={BOUNDS[p.name] ? BOUNDS[p.name][0] : 0} max={BOUNDS[p.name] ? BOUNDS[p.name][1] : 100} step={BOUNDS[p.name] ? BOUNDS[p.name][2] : 1}
              hint={BOUNDS[p.name] ? 'range ' + BOUNDS[p.name][0] + '–' + BOUNDS[p.name][1] : null}
              value={{ min: p.ideal_min, max: p.ideal_max }} onChange={(v) => setParams(params.map((x) => x.id === p.id ? { ...x, ideal_min: v.min, ideal_max: v.max } : x))} />
          </Card>
        ))}
      </div>
      {section('Add a custom parameter')}
      <Card>
        <Input label="Name" placeholder="Phosphate" value={nw.name} onChange={(v) => setNw({ ...nw, name: v })} />
        <Input label="Unit" hint="optional" placeholder="ppm" mono value={nw.unit} onChange={(v) => setNw({ ...nw, unit: v })} />
        <RangeField label="Ideal range" hint="optional" unit={nw.unit} min={0} max={100} step={1} value={{ min: nw.min === '' ? null : Number(nw.min), max: nw.max === '' ? null : Number(nw.max) }} onChange={(v) => setNw({ ...nw, min: v.min ?? '', max: v.max ?? '' })} />
        <Button variant="ink" size="md" disabled={!nw.name.trim()} onClick={add} style={{ width: "100%" }}>Add parameter</Button>
      </Card>
      {section('Backup')}
      <Card>
        <Button variant="outline" size="md" onClick={() => setMsg('Exported 41 readings.')} style={{ width: "100%" }}>Export all readings to CSV</Button>
        <Button variant="outline" size="md" onClick={() => setMsg('Imported 12 readings, skipped 1 row.')} style={{ width: "100%" }}>Import readings from CSV</Button>
        <span style={{ font: "var(--text-body-sm)", color: "var(--text-tertiary)" }}>Expects the same columns as the export: parameter, value, unit, tested_at, note.</span>
        {msg && <Notice tone="good">{msg}</Notice>}
      </Card>
    </Shell>
  );
}
