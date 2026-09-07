Dashboard tile (2-col grid); the single most urgent parameter uses hero to span the row with a 44px number and a pill.
```jsx
<ParameterTile hero name="Nitrite" unit="ppm" value="0.25" rangeText="ideal 0" ago="2h ago" status="out-of-range" />
<ParameterTile name="pH" value="7.2" rangeText="6.5–7.5" ago="2h" status="in-range" />
```
Overdue tiles turn mist with a dashed border.