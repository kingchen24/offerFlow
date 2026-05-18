import { useState } from 'react'
import { useTheme } from '../store/ThemeContext'

export default function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const [searchQuery, setSearchQuery] = useState('')

  const handleAdd = () => {
    alert('新增记录（功能待实现）')
  }

  const handleNotification = () => {
    alert('通知中心（功能待实现）')
  }

  const handleAvatar = () => {
    alert('个人中心（功能待实现）')
  }

  return (
    <header className="h-16 bg-offer-card border-b border-theme-border flex items-center justify-between px-6 shrink-0">
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-offer-primary to-offer-accent flex items-center justify-center text-white font-bold text-sm">
          O
        </div>
        <span className="text-theme-text font-bold text-lg tracking-tight">OfferFlow</span>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-md mx-6">
        <div className="relative">
          <svg
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-theme-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="搜索岗位、公司、关键词..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="min-h-[40px] w-full rounded-xl border border-theme-border bg-theme-card py-2.5 !pl-12 pr-4 text-sm text-theme-text placeholder:text-theme-muted outline-none transition-all duration-200 focus:border-purple-400/70 focus:ring-2 focus:ring-purple-500/20"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="h-10 w-10 rounded-full flex items-center justify-center transition-all duration-200
            dark:border-white/25 dark:bg-white/[0.12] dark:text-white/80 dark:shadow-lg dark:shadow-black/20
            dark:hover:bg-white/[0.2] dark:hover:text-white dark:hover:scale-105
            border-slate-300 bg-white text-slate-600 shadow-sm
            hover:border-slate-400 hover:text-slate-800 hover:shadow-md
            active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60"
          aria-label={isDark ? '切换亮色模式' : '切换暗色模式'}
          title={isDark ? '切换亮色模式' : '切换暗色模式'}
        >
          {isDark ? (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        <button
          onClick={handleAdd}
          className="btn-gradient h-9 px-4 rounded-lg text-white text-sm font-medium flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新增
        </button>

        <button
          onClick={handleNotification}
          className="w-9 h-9 rounded-lg bg-theme-icon-btn border border-theme-border flex items-center justify-center text-theme-muted hover:text-theme-text hover:border-offer-primary transition-all relative"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
        </button>

        <button
          onClick={handleAvatar}
          className="w-9 h-9 rounded-full bg-gradient-to-br from-offer-primary to-offer-accent flex items-center justify-center text-white text-sm font-medium hover:shadow-lg hover:shadow-offer-primary/30 transition-all"
        >
          U
        </button>
      </div>
    </header>
  )
}
