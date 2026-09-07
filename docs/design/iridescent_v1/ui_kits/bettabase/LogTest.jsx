import React, { useState } from "react";
import { Button, IconButton, Input, StatusPill, StatusDot, RangeToggle, NavChips, BackLink, Avatar, Sparkline, ParameterTile } from "../../components/core/index.js";
import { Shell, ScreenTitle, Card, Row, Notice } from "./Shell.jsx";
export function LogTest({ go }) {
  const D = window.BettabaseData;
  const active = D.parameters.filter((p) => p.active);
  const [values, setValues] = useState({});
  const [note, setNote] = useState('');
  const [when, setWhen] = useState(new Date().toISOString().slice(0, 16));
  const any = Object.values(values).some((v) => v.trim() !== '');
  return (
    <Shell bottom={<Button variant="primary" size="lg" disabled={!any} style={{ width: "100%" }} onClick={() => go('/')}>Save readings</Button>}>
      <BackLink label="Dashboard" onClick={() => go('/')} />
      <ScreenTitle sub="Fill in whatever you tested. Blanks are skipped.">Log a test</ScreenTitle>
      <Input label="Tested at" type="datetime-local" value={when} onChange={setWhen} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {active.map((p) => (
          <div key={p.id} style={{ borderRadius: "var(--radius-tile)", padding: 14, background: "var(--bg-surface)", border: "1px solid var(--border-default)", boxShadow: "var(--shadow-tile)" }}>
            <Input label={p.name} hint={p.unit} mono inputMode="decimal" placeholder={D.rangeText(p.ideal_min, p.ideal_max) || ''} value={values[p.id] || ''} onChange={(v) => setValues({ ...values, [p.id]: v })} />
          </div>
        ))}
      </div>
      <Input label="Note" hint="optional" placeholder="day after water change" value={note} onChange={setNote} />
    </Shell>
  );
}
