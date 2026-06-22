'use client'
import { useMemo } from 'react'
import { useApp } from '../store/AppContext'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Area, AreaChart, Legend
} from 'recharts'

const STATUS_COLORS = {
  '感兴趣': '#60A5FA',
  '准备投递': '#FBBF24',
  '已投递': '#22D3EE',
  'OA / 笔试': '#FB923C',
  '一面中': '#9575DE',
  '二面中': '#A78BFA',
  '三面中': '#8B5CF6',
  '终面中': '#EC4899',
  'Offer': '#34D399',
  '已结束': '#F87171',
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null
  return (
    <div style={{
      background: 'var(--c-bg-card)', border: '1px solid var(--c-border)',
      borderRadius: '12px', padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      color: 'var(--c-text)'
    }}>
      {label && <p style={{ fontWeight: 700, marginBottom: 4 }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: 13, color: 'var(--c-text-secondary)' }}>
          <span style={{ color: p.color || '#9575DE', fontWeight: 600 }}>{p.name || p.dataKey}</span>
          ：{p.value}
        </p>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { jobs, tasks } = useApp()

  const stats = useMemo(() => {
    const activeJobs = jobs.filter((j) => !['已结束', 'Offer'].includes(j.status))
    const interviewJobs = jobs.filter((j) => (j.interviewRounds || []).length > 0 || ['一面中', '二面中', '三面中', '终面中'].includes(j.status))
    const offerJobs = jobs.filter((j) => j.status === 'Offer')
    const endedJobs = jobs.filter((j) => j.status === '已结束')

    const now = new Date()
    const todayStr = now.toISOString().slice(0, 10)

    // This week's applications
    const weekAgo = new Date(now)
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekJobs = jobs.filter((j) => j.appliedDate && new Date(j.appliedDate) >= weekAgo)

    // Last 30 days trend
    const last30Days = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const ds = d.toISOString().slice(0, 10)
      last30Days.push({ date: ds.slice(5), count: 0, interviews: 0, offers: 0 })
    }
    jobs.forEach((j) => {
      if (j.appliedDate) {
        const idx = last30Days.findIndex((d) => d.date === j.appliedDate.slice(5))
        if (idx >= 0) last30Days[idx].count++
      }
      if (j.status === 'Offer') {
        // Approximate offer date from timeline
        const offerEvent = (j.timeline || []).findLast((t) => t.action?.includes('Offer'))
        const offDate = offerEvent?.date || j.appliedDate
        if (offDate) {
          const idx = last30Days.findIndex((d) => d.date === offDate.slice(5))
          if (idx >= 0) last30Days[idx].offers++
        }
      }
    })

    // Weekly breakdown (last 7 days individually)
    const weekBreakdown = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const ds = d.toISOString().slice(0, 10)
      const dayNames = ['日', '一', '二', '三', '四', '五', '六']
      weekBreakdown.push({ day: dayNames[d.getDay()], date: ds, count: 0 })
    }
    jobs.forEach((j) => {
      if (j.appliedDate) {
        const idx = weekBreakdown.findIndex((d) => d.date === j.appliedDate)
        if (idx >= 0) weekBreakdown[idx].count++
      }
    })

    // Status distribution for pie chart
    const statusCount = {}
    jobs.forEach((j) => {
      statusCount[j.status] = (statusCount[j.status] || 0) + 1
    })
    const statusPie = Object.entries(statusCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    // Channel distribution
    const channelCount = {}
    jobs.forEach((j) => {
      const ch = j.channel || '其他'
      channelCount[ch] = (channelCount[ch] || 0) + 1
    })
    const channels = Object.entries(channelCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    // City top 5
    const cityCount = {}
    jobs.forEach((j) => {
      const city = j.city || '未知'
      cityCount[city] = (cityCount[city] || 0) + 1
    })
    const topCities = Object.entries(cityCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)

    // Response / interview / offer rates
    const applied = jobs.filter((j) => j.status !== '感兴趣' && j.status !== '准备投递')
    const replied = jobs.filter((j) =>
      ['一面中', '二面中', '三面中', '终面中', 'Offer', '已结束', 'OA / 笔试'].includes(j.status)
    )
    const repliedCount = replied.length - jobs.filter((j) => j.status === 'OA / 笔试' && !j.interviewRounds?.length).length

    // Recent events
    const timelineEvents = jobs
      .flatMap((j) => (j.timeline || []).map((t) => ({ ...t, company: j.companyName })))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)

    const upcomingTasks = tasks.filter((t) => !t.done).slice(0, 5)

    // Smoothed trend for area chart
    const smoothed = last30Days.map((d, i) => {
      const window = last30Days.slice(Math.max(0, i - 3), i + 4)
      const avg = Math.round(window.reduce((s, x) => s + x.count, 0) / window.length)
      return { ...d, smooth: avg }
    })

    return {
      activeCount: activeJobs.length,
      interviewCount: interviewJobs.length,
      offerCount: offerJobs.length,
      weekCount: weekJobs.length,
      endedCount: endedJobs.length,
      total: jobs.length,
      statusPie,
      channels,
      topCities,
      weekBreakdown,
      last30Days: smoothed,
      timelineEvents,
      upcomingTasks,
    }
  }, [jobs, tasks])

  const statCards = [
    { label: '进行中投递', value: stats.activeCount, icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'from-violet-500 to-purple-500', bg: 'bg-violet-500/10', border: 'border-violet-400/20' },
    { label: '待面试', value: stats.interviewCount, icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'from-amber-500 to-orange-500', bg: 'bg-amber-500/10', border: 'border-amber-400/20' },
    { label: 'Offer 数', value: stats.offerCount, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-500/10', border: 'border-emerald-400/20' },
    { label: '本周投递', value: stats.weekCount, icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/10', border: 'border-blue-400/20' },
  ]

  return (
    <div className="px-6 py-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-white">仪表盘</h1>
        <p className="text-sm text-gray-400 dark:text-white/45 mt-1">
          求职总览 · 共 {stats.total} 个岗位
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statCards.map((s, i) => (
          <div key={i} className="card-modern p-5 card-hover relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/[0.03] to-transparent rounded-bl-full transition-opacity group-hover:opacity-100" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <p className="text-gray-400 dark:text-white/45 text-sm font-medium">{s.label}</p>
                <div className={`w-9 h-9 rounded-xl ${s.bg} border ${s.border} flex items-center justify-center`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    style={{ color: s.color.split(' ')[0].replace('from-', '') }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={s.icon} />
                  </svg>
                </div>
              </div>
              <p className={`text-3xl font-bold bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>
                {s.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1: Status Pie + Week Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Status Distribution */}
        <div className="card-modern p-5 min-h-[380px]">
          <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-offer-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
            状态分布
          </h2>
          {stats.statusPie.length > 0 ? (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-[200px] h-[200px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats.statusPie} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                      paddingAngle={3} dataKey="value" stroke="transparent">
                      {stats.statusPie.map((entry, i) => (
                        <Cell key={i} fill={STATUS_COLORS[entry.name] || '#6B7280'} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-1.5">
                {stats.statusPie.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: STATUS_COLORS[s.name] || '#6B7280' }} />
                    <span className="text-gray-300 dark:text-white/65 truncate">{s.name}</span>
                    <span className="text-gray-500 dark:text-white/45 ml-auto">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-gray-500 text-sm">暂无数据</div>
          )}
        </div>

        {/* Weekly Breakdown */}
        <div className="card-modern p-5 min-h-[380px]">
          <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-offer-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            本周投递
          </h2>
          {stats.weekBreakdown.some(d => d.count > 0) ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.weekBreakdown} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fill: '#9CA3AF', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(168, 85, 247, 0.08)' }} />
                <Bar dataKey="count" name="投递数" radius={[8, 8, 0, 0]} maxBarSize={40}>
                  {stats.weekBreakdown.map((_, i) => (
                    <Cell key={i} fill={`url(#weekGrad)`} />
                  ))}
                </Bar>
                <defs>
                  <linearGradient id="weekGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A78BFA" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#7E57C2" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-gray-500 text-sm">暂无本周投递数据</div>
          )}
        </div>
      </div>

      {/* Charts Row 2: 30-day Trend + Channel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* 30-Day Trend */}
        <div className="card-modern p-5 min-h-[350px]">
          <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-offer-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            30天投递趋势
          </h2>
          {stats.last30Days.some(d => d.count > 0) ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={stats.last30Days} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A78BFA" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#A78BFA" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false}
                  interval="preserveStartEnd" />
                <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(168,85,247,0.2)', strokeWidth: 1 }} />
                <Area type="monotone" dataKey="count" name="投递数" stroke="#A78BFA" strokeWidth={2}
                  fill="url(#trendGrad)" dot={false} activeDot={{ r: 4, fill: '#A78BFA' }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-gray-500 text-sm">暂无趋势数据</div>
          )}
        </div>

        {/* Channel Distribution */}
        <div className="card-modern p-5 min-h-[350px]">
          <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-offer-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            渠道分布
          </h2>
          {stats.channels.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats.channels} layout="vertical" margin={{ top: 5, right: 40, left: 40, bottom: 5 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={false} strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#9CA3AF', fontSize: 12 }} axisLine={false} tickLine={false} width={60} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(168,85,247,0.08)' }} />
                <Bar dataKey="value" name="投递数" radius={[0, 6, 6, 0]} maxBarSize={32}>
                  {stats.channels.map((_, i) => (
                    <Cell key={i} fill={`hsl(${265 - i * 25}, 55%, ${60 - i * 4}%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-gray-500 text-sm">暂无渠道数据</div>
          )}
        </div>
      </div>

      {/* Bottom Row: Recent Activity + Upcoming Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Recent Activity */}
        <div className="card-modern p-5">
          <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-offer-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            最近动态
          </h2>
          <div className="space-y-3">
            {stats.timelineEvents.length > 0 ? stats.timelineEvents.map((e, i) => (
              <div key={i} className="flex items-start gap-3 pb-3 border-b border-white/10 last:border-0 group">
                <div className="relative mt-2">
                  <div className="w-2 h-2 rounded-full bg-offer-primary shrink-0 group-hover:scale-125 transition-transform" />
                  <div className="absolute top-2 left-1 w-px h-full bg-white/10 group-hover:bg-offer-primary/30 transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">
                    <span className="text-offer-accent font-medium">{e.company}</span>
                    <span className="text-gray-400 dark:text-white/55"> — {e.action}</span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-white/45 mt-0.5">{e.date}</p>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                <svg className="w-10 h-10 mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm">暂无动态，去投递岗位吧</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="card-modern p-5">
          <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-offer-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            待办事项
            <span className="ml-auto text-xs text-gray-500">{stats.upcomingTasks.length} 项</span>
          </h2>
          <div className="space-y-3">
            {stats.upcomingTasks.length > 0 ? stats.upcomingTasks.map((t) => (
              <div key={t.id} className="flex items-start gap-3 pb-3 border-b border-white/10 last:border-0 group hover:bg-white/[0.02] -mx-2 px-2 rounded-lg transition-colors">
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${t.type === '面试' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' :
                    t.type === 'OA / 笔试' || t.type === 'Deadline' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' :
                    t.type === 'Follow-up' ? 'bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.4)]' :
                    'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]'
                  }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{t.title}</p>
                  <p className="text-xs text-gray-500 dark:text-white/45 mt-0.5">{t.date} {t.startTime || ''}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${t.type === '面试' ? 'bg-green-500/10 text-green-400 border border-green-400/20' :
                    t.type === 'OA / 笔试' || t.type === 'Deadline' ? 'bg-amber-500/10 text-amber-400 border border-amber-400/20' :
                    t.type === 'Follow-up' ? 'bg-teal-500/10 text-teal-400 border border-teal-400/20' :
                    'bg-blue-500/10 text-blue-400 border border-blue-400/20'
                  }`}>{t.type || '其他'}</span>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                <svg className="w-10 h-10 mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm">暂无待办事项 🎉</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
