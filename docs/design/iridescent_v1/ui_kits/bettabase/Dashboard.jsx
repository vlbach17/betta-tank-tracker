import React from "react";
import { Button, IconButton, Input, StatusPill, StatusDot, RangeToggle, NavChips, BackLink, Avatar, Sparkline, ParameterTile } from "../../components/core/index.js";
import { Shell, ScreenTitle, Card, Row, Notice } from "./Shell.jsx";
export function Dashboard({ go }) {
  const D = window.BettabaseData;
  const active = D.parameters.filter((p) => p.active);
  const items = active.map((p) => {
    const last = p.readings[p.readings.length - 1] || null;
    const od = last && D.overdue(p.name, last.tested_at);
    const st = !last ? 'unknown' : od ? 'overdue' : D.status(last.value, p.ideal_min, p.ideal_max);
    return { p, last, st };
  });
  const rank = { 'out-of-range': 0, watch: 1, overdue: 2, 'in-range': 3, unknown: 4 };
  const hero = [...items].sort((a, b) => rank[a.st] - rank[b.st])[0];
  const rest = items.filter((i) => i !== hero);
  const good = items.filter((i) => i.st === 'in-range').length;
  return (
    <Shell bottom={<Button variant="primary" size="lg" style={{ width: "100%" }} onClick={() => go('/log')}>Log a test</Button>}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar src="../../assets/spunk.png" />
          <ScreenTitle name="Spunk's" nameStyle={{ textTransform: "capitalize", fontWeight: 700 }} titleStyle={{ font: "var(--text-title)", letterSpacing: "-0.05em", textTransform: "lowercase", fontStyle: "normal", fontWeight: 800, lineHeight: "26px" }} sub={good + " of " + items.length + " in range"}>Betta<i><span style={{ fontStyle: "normal" }}>base</span></i></ScreenTitle>
        </div>
        <IconButton icon="kebab" label="Menu" onClick={() => go('/settings')} />
      </div>
      <NavChips items={[{ value: '/', label: 'Now' }, { value: '/overview', label: 'Overview' }, { value: '/settings', label: 'Settings' }]} value="/" onChange={go} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {hero && hero.st !== 'in-range' && <ParameterTile hero name={hero.p.name} unit={hero.p.unit} value={hero.last ? D.fmt(hero.last.value) : null} rangeText={D.rangeText(hero.p.ideal_min, hero.p.ideal_max)} ago={hero.last ? D.ago(hero.last.tested_at) : 'No readings yet'} status={hero.st} onClick={() => go('/parameter/' + hero.p.id)} />}
        {(hero && hero.st !== 'in-range' ? rest : items).map(({ p, last, st }) => (
          <ParameterTile key={p.id} name={p.name === 'Temperature' ? 'Temp' : p.name} unit={p.unit} value={last ? D.fmt(last.value) + (p.unit === '°F' ? '°' : '') : null}
            rangeText={D.rangeText(p.ideal_min, p.ideal_max)} ago={last ? D.ago(last.tested_at, true) : 'No readings yet'} status={st} onClick={() => go('/parameter/' + p.id)} />
        ))}
      </div>
    </Shell>
  );
}
