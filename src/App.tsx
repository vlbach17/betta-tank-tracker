import { Suspense, lazy, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { BottomNav } from './components/BottomNav'
import { TempUnitProvider } from './components/TempUnitProvider'
import { Dashboard } from './screens/Dashboard'
import { LogTest } from './screens/LogTest'
import { Settings } from './screens/Settings'

const Overview = lazy(() =>
  import('./screens/Overview').then((m) => ({
    default: m.Overview,
  })),
)

const TankInfo = lazy(() =>
  import('./screens/TankInfo').then((m) => ({
    default: m.TankInfo,
  })),
)

const chartRouteFallback = (
  <p className="p-4 text-sm text-ink-muted">Loading…</p>
)

function App() {
  const [logOpen, setLogOpen] = useState(false)
  const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0)

  return (
    <TempUnitProvider>
      <Routes>
        <Route path="/" element={<Dashboard key={dashboardRefreshKey} />} />
        <Route path="/settings" element={<Settings />} />
        <Route
          path="/overview"
          element={
            <Suspense fallback={chartRouteFallback}>
              <Overview />
            </Suspense>
          }
        />
        <Route
          path="/tank-info"
          element={
            <Suspense fallback={chartRouteFallback}>
              <TankInfo />
            </Suspense>
          }
        />
      </Routes>
      <BottomNav logActive={logOpen} onOpenLog={() => setLogOpen(true)} />
      {logOpen && (
        <LogTest
          onClose={() => setLogOpen(false)}
          onSaved={() => setDashboardRefreshKey((k) => k + 1)}
        />
      )}
    </TempUnitProvider>
  )
}

export default App
