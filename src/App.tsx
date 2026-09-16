import { Suspense, lazy } from 'react'
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
  return (
    <TempUnitProvider>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/log" element={<LogTest />} />
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
      <BottomNav />
    </TempUnitProvider>
  )
}

export default App
