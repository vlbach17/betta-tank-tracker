import React, { useState } from "react";
import { Button, IconButton, Input, StatusPill, StatusDot, RangeToggle, NavChips, BackLink, Avatar, Sparkline, ParameterTile } from "../../components/core/index.js";
import { Shell, ScreenTitle, Card, Row, Notice } from "./Shell.jsx";
export function ParameterHistory({ id, go }) {
  const D = window.BettabaseData;
  const p = D.parameters.find((x) => x.id === id) || D.parameters[3];
  const [range, setRange] = useState('30');
  const [confirm, setConfirm] = useState(null);
  const [removed, setRemoved] = useState([]);
  const all = p.readings.filter((r) => !removed.includes(r.tested_at) && D.inRange(r.tested_at, range));
  const desc = [...all].reverse();
  const last = p.readings[p.readings.length - 1];
  const st = last ? D.status(last.value, p.ideal_min, p.ideal_max) : 'unknown';
  const statuses = all.map((r) => D.status(r.value, p.ideal_min, p.ideal_max));
  const swing = p.name === 'Temperature' && all.length > 1 ? Math.max(...all.map((r) => r.value)) - Math.min(...all.map((r) => r.value)) : null;
  return (
    <Shell>
      <BackLink label="Dashboard" onClick={() => go('/')} />
      <Card hero>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ font: "var(--text-page-title)", textTransform: "lowercase" }}>{p.name}</span>
          <StatusPill status={st} />
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ font: "var(--text-display-xl)", letterSpacing: "var(--tracking-tighter)", fontVariantNumeric: "tabular-nums" }}>{last ? D.fmt(last.value) : '–'}</span>
          <span style={{ font: "var(--text-meta-md)", fontSize: 14, color: "var(--text-secondary)" }}>{[p.unit, D.rangeText(p.ideal_min, p.ideal_max) && 'ideal ' + D.rangeText(p.ideal_min, p.ideal_max).replace('ideal ', '')].filter(Boolean).join(' · ')}</span>
        </div>
        <Sparkline points={all} idealMin={p.ideal_min} idealMax={p.ideal_max} statuses={statuses} height={120} />
        {all.length > 0 && <div style={{ display: "flex", justifyContent: "space-between", font: "var(--text-meta)", color: "var(--text-tertiary)" }}><span>{D.shortDate(all[0].tested_at)}</span><span>{D.shortDate(all[all.length - 1].tested_at)}</span></div>}
        {swing != null && <span style={{ font: "var(--text-meta-md)", color: "var(--text-secondary)" }}>Largest swing in this range: <b style={{ color: "var(--text-primary)", fontWeight: 600 }}>{D.fmt(swing)}{p.unit}</b></span>}
      </Card>
      <RangeToggle value={range} onChange={setRange} />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {desc.length === 0 && <span style={{ font: "var(--text-body-sm)", color: "var(--text-tertiary)", padding: 8 }}>No readings in this range.</span>}
        {desc.map((r) => (
          <Row key={r.tested_at}>
            {confirm === r.tested_at ? (
              <>
                <span style={{ font: "var(--text-body-sm)", fontWeight: 600 }}>Delete this reading?</span>
                <div style={{ display: "flex", gap: 8 }}><Button variant="outline" size="sm" onClick={() => setConfirm(null)}>Cancel</Button><Button variant="danger" size="sm" onClick={() => { setRemoved([...removed, r.tested_at]); setConfirm(null); }}>Delete</Button></div>
              </>
            ) : (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ font: "var(--text-heading)" }}>{D.fullDate(r.tested_at)}</span>
                  {r.note && <span style={{ font: "var(--text-body-sm)", color: "var(--text-tertiary)" }}>{r.note}</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ font: "var(--text-num-md)", fontVariantNumeric: "tabular-nums" }}>{D.fmt(r.value)}</span>
                  <StatusDot status={D.status(r.value, p.ideal_min, p.ideal_max)} />
                  <IconButton icon="trash" label="Delete reading" tone="danger" onClick={() => setConfirm(r.tested_at)} style={{ background: "transparent", marginRight: -12 }} />
                </div>
              </>
            )}
          </Row>
        ))}
      </div>
    </Shell>
  );
}
