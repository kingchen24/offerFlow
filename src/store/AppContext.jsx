import { createContext, useContext, useState, useCallback } from 'react'
import { generateMockData, defaultSettings } from './mockData'
import { deleteReviewAttachmentsByReviewId } from '../utils/reviewAttachmentStore'
import Toast from '../components/Toast'

const AppContext = createContext(null)

const ROUND_ORDER = ['一面', '二面', '三面', '终面']
const STATUS_ROUND_MAP = { '一面中': '一面', '二面中': '二面', '三面中': '三面', '终面中': '终面' }

// ---- Centralized statistics helpers ----

export const APPLIED_STATUSES = ['已投递', 'OA / 笔试', '一面中', '二面中', '三面中', '终面中', 'Offer', '已结束']
export const REPLIED_STATUSES = ['OA / 笔试', '一面中', '二面中', '三面中', '终面中', 'Offer']
export const INTERVIEW_STATUSES = ['一面中', '二面中', '三面中', '终面中']

export function isAppliedJob(job) {
  return APPLIED_STATUSES.includes(job.status)
}

export function isRepliedJob(job) {
  if (REPLIED_STATUSES.includes(job.status)) return true
  if (job.status === '已结束') {
    if (!job.endReason) return true
    return ['被拒绝', '岗位关闭', '其他'].includes(job.endReason)
  }
  return false
}

export function hasInterviewExperience(job) {
  if (Array.isArray(job.interviewRounds) && job.interviewRounds.length > 0) return true
  return INTERVIEW_STATUSES.includes(job.status) || job.status === 'Offer'
}

export function getFallbackInterviewRounds(job) {
  if (Array.isArray(job.interviewRounds) && job.interviewRounds.length > 0) return job.interviewRounds
  if (job.status === '一面中') return [{ round: '一面', status: '进行中' }]
  if (job.status === '二面中') return [{ round: '一面', status: '已通过' }, { round: '二面', status: '进行中' }]
  if (job.status === '三面中') return [{ round: '一面', status: '已通过' }, { round: '二面', status: '已通过' }, { round: '三面', status: '进行中' }]
  if (job.status === '终面中') return [{ round: '一面', status: '已通过' }, { round: '二面', status: '已通过' }, { round: '三面', status: '已通过' }, { round: '终面', status: '进行中' }]
  if (job.status === 'Offer') return [{ round: '一面', status: '已通过' }]
  return []
}

export function getInterviewRoundCount(job) {
  return getFallbackInterviewRounds(job).length
}

export function isOfferJob(job) {
  return job.status === 'Offer'
}

export function getResumeStats(resumeId, jobs) {
  const linked = jobs.filter((j) => j.resumeId === resumeId)
  const sentCount = linked.filter(isAppliedJob).length
  const replyCount = linked.filter(isRepliedJob).length
  const interviewPeopleCount = linked.filter(hasInterviewExperience).length
  const interviewRoundCount = linked.reduce((sum, j) => sum + getInterviewRoundCount(j), 0)
  const offerCount = linked.filter(isOfferJob).length
  return {
    sentCount,
    replyCount,
    interviewPeopleCount,
    interviewRoundCount,
    offerCount,
    interviewRate: sentCount > 0 ? Math.round((interviewPeopleCount / sentCount) * 100) : 0,
    offerRate: sentCount > 0 ? Math.round((offerCount / sentCount) * 100) : 0,
  }
}

export function syncInterviewRounds(job) {
  const rounds = [...(job.interviewRounds || [])]
  const status = job.status
  const targetRound = STATUS_ROUND_MAP[status]

  // For interview statuses, ensure the current round record exists
  if (targetRound && !rounds.some(r => r.round === targetRound)) {
    rounds.push({
      id: crypto.randomUUID(),
      round: targetRound,
      status: '进行中',
      date: new Date().toISOString().slice(0, 10),
      result: '',
      notes: '',
    })
  }

  // For 二面中/三面中/终面中, auto-pass previous rounds
  if (targetRound && ['二面中', '三面中', '终面中'].includes(status)) {
    const currentIdx = ROUND_ORDER.indexOf(targetRound)
    for (let i = 0; i < currentIdx; i++) {
      const prev = rounds.find(r => r.round === ROUND_ORDER[i])
      if (prev && prev.status === '进行中') {
        prev.status = '已通过'
      }
    }
  }

  // For Offer, mark the highest in-progress round as passed
  if (status === 'Offer') {
    for (let i = ROUND_ORDER.length - 1; i >= 0; i--) {
      const found = rounds.find(r => r.round === ROUND_ORDER[i] && r.status === '进行中')
      if (found) { found.status = '已通过'; break }
    }
  }

  return { ...job, interviewRounds: rounds }
}

function migrateJobs(jobs) {
  return jobs.map((j) => {
    let updated = { ...j }
    // Convert old '面试中' to '一面中'
    if (updated.status === '面试中') {
      updated.status = '一面中'
    }
    // Sync interviewRounds with current status
    return syncInterviewRounds(updated)
  })
}

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return fallback
}

function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch { /* ignore */ }
}

export function AppProvider({ children }) {
  const [activePage, setActivePage] = useState('dashboard')

  // Toast system
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success') => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  // Initialize data from localStorage or mock data
  const mock = generateMockData()

  const [jobs, setJobsRaw] = useState(() => migrateJobs(loadFromStorage('offerFlow_jobs', mock.jobs)))
  const [resumes, setResumesRaw] = useState(() => loadFromStorage('offerFlow_resumes', mock.resumes))
  const [tasks, setTasksRaw] = useState(() => loadFromStorage('offerFlow_tasks', mock.tasks))
  const [reviews, setReviewsRaw] = useState(() => loadFromStorage('offerFlow_reviews', mock.reviews))
  const [settings, setSettingsRaw] = useState(() => loadFromStorage('offerFlow_settings', defaultSettings))

  // Auto-sync to localStorage on every change
  const setJobs = useCallback((value) => {
    setJobsRaw((prev) => {
      const next = typeof value === 'function' ? value(prev) : value
      saveToStorage('offerFlow_jobs', next)
      return next
    })
  }, [])

  const setResumes = useCallback((value) => {
    setResumesRaw((prev) => {
      const next = typeof value === 'function' ? value(prev) : value
      saveToStorage('offerFlow_resumes', next)
      return next
    })
  }, [])

  const setTasks = useCallback((value) => {
    setTasksRaw((prev) => {
      const next = typeof value === 'function' ? value(prev) : value
      saveToStorage('offerFlow_tasks', next)
      return next
    })
  }, [])

  const setReviews = useCallback((value) => {
    setReviewsRaw((prev) => {
      const next = typeof value === 'function' ? value(prev) : value
      saveToStorage('offerFlow_reviews', next)
      return next
    })
  }, [])

  const addReview = useCallback((review) => {
    setReviewsRaw((prev) => {
      const next = [...prev, {
        ...review,
        id: review.id || crypto.randomUUID(),
        attachments: Array.isArray(review.attachments) ? review.attachments : [],
      }]
      saveToStorage('offerFlow_reviews', next)
      return next
    })
  }, [])

  const updateReview = useCallback((id, patch) => {
    setReviewsRaw((prev) => {
      const next = prev.map((r) =>
        r.id === id
          ? {
              ...r,
              ...patch,
              attachments:
                Array.isArray(patch.attachments)
                  ? patch.attachments
                  : r.attachments || [],
            }
          : r
      )
      saveToStorage('offerFlow_reviews', next)
      return next
    })
  }, [])

  const deleteReview = useCallback(async (id) => {
    try {
      await deleteReviewAttachmentsByReviewId(id)
    } catch (e) {
      console.error('[review attachment cleanup failed]', e)
    }
    setReviewsRaw((prev) => {
      const next = prev.filter((r) => r.id !== id)
      saveToStorage('offerFlow_reviews', next)
      return next
    })
  }, [])

  const setSettings = useCallback((value) => {
    setSettingsRaw((prev) => {
      const next = typeof value === 'function' ? value(prev) : value
      saveToStorage('offerFlow_settings', next)
      return next
    })
  }, [])

  return (
    <AppContext.Provider value={{
      activePage, setActivePage,
      jobs, setJobs,
      resumes, setResumes,
      tasks, setTasks,
      reviews, setReviews, addReview, updateReview, deleteReview,
      settings, setSettings,
      toasts, addToast,
    }}>
      {children}
      <Toast />
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
