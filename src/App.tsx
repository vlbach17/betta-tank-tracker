import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { BottomNav } from './components/BottomNav'
import { Dashboard } from './components/Dashboard'
import { HardnessUnitProvider } from './components/HardnessUnitProvider'
import { LogTest } from './components/LogTest'
import { Settings } from './components/Settings'
import { TempUnitProvider } from './components/TempUnitProvider'

const ParameterHistory = lazy(() =>
  import('./components/ParameterHistory').then((m) => ({
    default: m.ParameterHistory,
  })),
)

const Overview = lazy(() =>
  import('./components/Overview').then((m) => ({
    default: m.Overview,
  })),
)

const chartRouteFallback = (
  <p className="p-4 text-sm text-ink-muted">Loading…</p>
)

function App() {
  return (
    <TempUnitProvider>
      <HardnessUnitProvider>
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
            path="/parameter/:parameterId"
            element={
              <Suspense fallback={chartRouteFallback}>
                <ParameterHistory />
              </Suspense>
            }
          />
        </Routes>
        <BottomNav />
      </HardnessUnitProvider>
    </TempUnitProvider>
  )
}

export default App
