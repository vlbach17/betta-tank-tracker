Collect an ideal min/max in one control: two 84px mono inputs and a two-thumb slider with a royal-blue filled span. Use this instead of two separate Inputs anywhere a range is edited.
```jsx
<RangeField label="Ideal range" unit="ppm" min={0} max={40} step={1}
  value={{ min: 0, max: 20 }} onChange={setRange} hint="typical 0–40" />
```
Thumbs never cross; typing in an input clamps to the bounds. Leave a side empty for "no bound".