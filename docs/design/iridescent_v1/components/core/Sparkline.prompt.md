Trend line with ideal band and status-colored dots; replaces Recharts in mocks.
```jsx
<Sparkline points={readings} idealMin={0} idealMax={20} statuses={readings.map(s)} showTicks />
```