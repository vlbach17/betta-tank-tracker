import React, { useState } from "react";
import { Button, IconButton, Input, StatusPill, StatusDot, RangeToggle, NavChips, BackLink, Avatar, Sparkline, ParameterTile } from "../../components/core/index.js";
import { Shell, ScreenTitle, Card, Row, Notice } from "./Shell.jsx";
export function Overview({ go }) {
  const D = window.BettabaseData;
  const [range, setRange] = useState('30');
  const active = D.parameters.filter((p) => p.active);
  return (
    <Shell>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}><Avatar src="../../assets/spunk.png" /><ScreenTitle sub={"Trends · last " + (range === 'all' ? 'all time' : range + ' days')}>Overview</ScreenTitle></div>
      </div>
      <NavChips items={[{ value: '/', label: 'Now' }, { value: '/overview', label: 'Overview' }, { value: '/settings', label: 'Settings' }]} value="/overview" onChange={go} />
      <RangeToggle value={range} onChange={setRange} />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {active.map((p) => {
          const pts = p.readings.filter((r) => D.inRange(r.tested_at, range));
          const last = p.readings[p.readings.length - 1];
          const od = last && D.overdue(p.name, last.tested_at);
          const st = !last ? 'unknown' : od ? 'overdue' : D.status(last.value, p.ideal_min, p.ideal_max);
          return (
            <Card key={p.id} style={{ cursor: "pointer" }} >
              <div onClick={() => go('/parameter/' + p.id)} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ font: "var(--text-heading)" }}>{p.name}{p.unit && <span style={{ marginLeft: 6, font: "var(--text-meta-md)", color: "var(--text-tertiary)" }}>{p.unit}</span>}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ font: "var(--text-num-md)", fontVariantNumeric: "tabular-nums", color: od ? "var(--text-tertiary)" : "var(--text-primary)" }}>{last ? D.fmt(last.value) : '–'}</span><StatusPill status={st} size="sm" /></div>
                </div>
                <Sparkline points={pts} idealMin={p.ideal_min} idealMax={p.ideal_max} statuses={pts.map((r) => D.status(r.value, p.ideal_min, p.ideal_max))} height={64} dotRadius={3.5} gradient={false} />
                <span style={{ font: "var(--text-meta)", color: od ? "var(--text-secondary)" : "var(--text-tertiary)" }}>{[D.rangeText(p.ideal_min, p.ideal_max) && 'ideal ' + D.rangeText(p.ideal_min, p.ideal_max).replace('ideal ', ''), last && D.ago(last.tested_at), od && 'Test overdue'].filter(Boolean).join(' · ')}</span>
              </div>
            </Card>
          );
        })}
      </div>
    </Shell>
  );
}
