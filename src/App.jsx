import { useState } from 'react'
import { AppProvider, useApp } from './store/AppContext'
import { ThemeProvider, useTheme } from './store/ThemeContext'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import BottomNav from './components/BottomNav'
import SplashScreen from './components/SplashScreen'
import Dashboard from './pages/Dashboard'
import Board from './pages/Board'
import Positions from './pages/Positions'
import Resumes from './pages/Resumes'
import Schedule from './pages/Schedule'
import Interview from './pages/Interview'
import Insights from './pages/Insights'
import Settings from './pages/Settings'

const pages = {
  dashboard: Dashboard,
  board: Board,
  positions: Positions,
  resumes: Resumes,
  schedule: Schedule,
  interview: Interview,
  insights: Insights,
  settings: Settings,
}

function AppInner() {
  const { activePage } = useApp()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const PageComponent = pages[activePage]

  return (
    <div className="h-screen w-screen flex flex-col bg-offer-dark transition-colors duration-500 light-ambient-container">
      {/* Ambient glow for dark mode */}
      <div className="app-glow-tl" />
      <div className="app-glow-br" />
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className={`flex-1 overflow-y-auto p-4 md:p-6 pb-20 lg:pb-6 transition-colors duration-500 page-content ${isDark ? '' : 'bg-theme-bg'}`}>
          <PageComponent />
        </main>
      </div>
      <BottomNav />
    </div>
  )
}

export default function App() {
  const [entered, setEntered] = useState(false)

  return (
    <ThemeProvider>
      <AppProvider>
        <div className="relative min-h-screen overflow-hidden bg-offer-dark transition-colors duration-500">
          <SplashScreen entered={entered} onEnter={() => setEntered(true)} />
          {/* Dark Mode transition marker: sits between splash and content so it's revealed as splash slides up */}
          <div
            className="pointer-events-none fixed inset-0 z-40 transition-opacity duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] dark:bg-[radial-gradient(ellipse_at_50%_0%,rgba(139,92,246,0.18),rgba(59,130,246,0.06),transparent_55%)]"
            style={{ opacity: entered ? 0 : 1 }}
          />
          <div
            className={`
              relative min-h-screen transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] dark:duration-[1400ms] dark:ease-[cubic-bezier(0.16,1,0.3,1)]
              ${entered ? 'translate-y-0 opacity-100 dark:scale-100' : 'translate-y-10 opacity-0 dark:translate-y-[40vh] dark:scale-[1.02]'}
            `}
          >
            <AppInner />
          </div>
        </div>
      </AppProvider>
    </ThemeProvider>
  )
}
