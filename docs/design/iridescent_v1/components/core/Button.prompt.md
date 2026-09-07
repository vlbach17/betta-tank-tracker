Pill-shaped button; use primary exactly once per screen for the main action, secondary/outline for the rest. Primary shows teal→royal and slides to violet→magenta on hover (one 4-stop track panned by background-position, 420ms).
```jsx
<Button variant="primary" size="lg" style={{ width: "100%" }}>Log a test</Button>
<Button variant="outline" size="md">Export all readings to CSV</Button>
<Button variant="danger" size="sm">Delete</Button>
```
Disabled = 40% opacity. Press = scale .98.