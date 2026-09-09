## Wrapping and setup

Three of these components read React context and will render blank (or throw) if used outside it: `ParameterTile` calls `useTempUnit()`/`useHardnessUnit()`, which throw if there's no provider above them; `BackLink`, `NavChips`, and `ParameterTile` render `react-router-dom` `Link`/`NavLink`, which need a Router. Wrap any composition using these in:

```jsx
<MemoryRouter>
  <TempUnitProvider>
    <HardnessUnitProvider>
      {/* your composition */}
    </HardnessUnitProvider>
  </TempUnitProvider>
</MemoryRouter>
```

All three are exported on the bundle (`window.BettaTankTracker.MemoryRouter` / `TempUnitProvider` / `HardnessUnitProvider`) alongside the components themselves — no separate import needed.

## Styling idiom: Tailwind utility classes over CSS custom-property tokens

This system is plain Tailwind v4 utility classes (`bg-mist`, `rounded-full`, `text-heading`) — never inline styles or a CSS-in-JS prop API — generated from a small set of CSS custom-property tokens (`--color-*`, `--radius-*`, `--shadow-*`, `--text-*`) defined once and consumed as Tailwind's `bg-`/`text-`/`border-`/`rounded-`/`shadow-` utilities. Build new layout/spacing with ordinary Tailwind utilities (`flex`, `gap-2`, `p-4`, `rounded-full`) — those aren't tokenized, only the design-specific values below are.

**Color** (`bg-`, `text-`, `border-` + name): `ink` (primary text), `ink-muted` / `ink-3` (secondary text, two strengths), `mist` / `mist-2` (light neutral fills), `surface` (card background), `bg` (page background), `line` / `line-2` (borders), `accent` / `accent-strong` (brand teal/blue), `white`. Status color families, each with three steps — solid (`status-good`), background (`status-good-bg`), and foreground-on-that-background (`status-good-fg`) — repeated for `good`, `bad`, `watch`, `overdue`. Never invent a new color name; pick from this list or fall back to Tailwind's default palette.

**Radius** (`rounded-` + name): `tile` (20px, dashboard tiles), `card` (24px, larger cards/modals), `row` (16px, list rows), `input` (14px, form fields). Buttons and pills use plain `rounded-full`, not a token.

**Shadow** (`shadow-` + name): `tile` (default card elevation), `segment` (small raised control, e.g. an active segmented-toggle pill), `cta` (a primary button's resting glow — pair with the `Button` `primary` variant's own hover shadow, don't reapply `shadow-cta` standalone).

**Type scale** (`text-` + name — each bundles size/line-height/weight, don't override weight separately): `heading` (card/section titles), `body` / `body-sm` (paragraph text, two sizes), `label` / `label-sm` (buttons, pills, chips), `caption` (helper/error text under a field), `eyebrow` (small uppercase-style overline), `title` / `title-lg` (page headers), `num-xl` / `num-lg` / `num-md` / `num-sm` (large numeric readouts — always pair with `font-mono`), `meta` (timestamps, secondary metadata).

**Two font families** — `font-sans` (Plus Jakarta Sans, all UI text and labels) and `font-mono` (Fira Code, exclusively for numeric/data values: readings, ranges, dates in monospace contexts). Never mix them within a value — a number gets `font-mono`, its label gets `font-sans`.

## Where the truth lives

Read `_ds_bundle.css` (imported by `styles.css`, which also pulls in `fonts/fonts.css`) for the authoritative token values and generated utility classes before styling anything — token names above are a summary, not exhaustive. Read a component's own `<Name>.d.ts` and `<Name>.prompt.md` for its exact prop API before composing with it.

## Example composition

```jsx
<MemoryRouter>
  <TempUnitProvider>
    <HardnessUnitProvider>
      <div className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4 shadow-tile">
        <div className="flex items-center justify-between">
          <span className="text-heading font-sans text-ink">Log a reading</span>
          <StatusPill status="watch" />
        </div>
        <Input
          id="ph"
          label="pH"
          mono
          value="7.2"
          onChange={() => {}}
          placeholder="7.0–7.5"
        />
        <div className="flex justify-end gap-2">
          <Button variant="secondary">Cancel</Button>
          <Button variant="primary">Save reading</Button>
        </div>
      </div>
    </HardnessUnitProvider>
  </TempUnitProvider>
</MemoryRouter>
```
