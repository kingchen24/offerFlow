'use client'
import { useState, useEffect, useCallback } from 'react'
import { useApp } from '../store/AppContext'
import ModalHeader from './ModalHeader'
import GlowCard from './GlowCard'

const STATUS_OPTIONS = ['感兴趣', '准备投递', '已投递', 'OA / 笔试', '一面中', '二面中', '三面中', '终面中', 'Offer', '已结束']
const WORK_MODE_OPTIONS = ['onsite', 'remote', 'hybrid']
const CHANNEL_OPTIONS = ['', '内推', '官网投递', '猎头', '招聘平台', '校园招聘', '其他']
const PRIORITY_OPTIONS = ['高', '中', '低']
const PLATFORM_OPTIONS = ['', 'BOSS直聘', '拉勾', '猎聘', '智联招聘', '前程无忧', '脉脉', 'LinkedIn', '官网', '其他']

const emptyForm = {
  companyName: '', jobTitle: '', status: '感兴趣', city: '', salaryRange: '',
  workMode: 'onsite', channel: '', priority: '中', appliedDate: '',
  jobLink: '', jdText: '', websites: [], resumeId: '', contactName: '', contactInfo: '',
  nextAction: '', notes: '',
}

// Stable helper components defined OUTSIDE JobModal to prevent remount on every render
function Input({ label, value, onChange, placeholder, type = 'text', large, ...rest }) {
  return (
    <div className={large ? 'col-span-2' : ''}>
      <label className="text-sm text-offer-muted block mb-1">{label}</label>
      {large && type === 'textarea' ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={4}
          className="min-h-[40px] w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none transition-all duration-200 focus:border-purple-400/70 focus:ring-2 focus:ring-purple-500/20 resize-none"
          {...rest}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="min-h-[40px] w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none transition-all duration-200 focus:border-purple-400/70 focus:ring-2 focus:ring-purple-500/20"
          {...rest}
        />
      )}
    </div>
  )
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="text-sm text-offer-muted block mb-1">{label}</label>
      <select
        value={value}
        onChange={onChange}
        className="min-h-[40px] rounded-xl border border-white/10 bg-gray-950 px-4 py-2.5 text-sm font-medium text-white outline-none transition-all duration-200 focus:border-purple-400/70 focus:ring-2 focus:ring-purple-500/20 appearance-none cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-gray-950 text-white">{opt || '请选择'}</option>
        ))}
      </select>
    </div>
  )
}

export default function JobModal({ open, job, onClose, initialStatus }) {
  const { resumes, addToast, addJob, updateJob } = useApp()
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (open) {
      const base = job ? { ...emptyForm, ...job } : { ...emptyForm }
      if (!job && initialStatus) base.status = initialStatus
      // Ensure websites is always an array
      if (!Array.isArray(base.websites)) base.websites = []
      setForm(base)
    }
  }, [open, job, initialStatus])

  const handleChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }, [])

  // ---- Websites management ----
  const addWebsite = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      websites: [...(prev.websites || []), { id: crypto.randomUUID(), platform: '', url: '' }],
    }))
  }, [])

  const removeWebsite = useCallback((id) => {
    setForm((prev) => ({
      ...prev,
      websites: (prev.websites || []).filter((w) => w.id !== id),
    }))
  }, [])

  const updateWebsite = useCallback((id, field, value) => {
    setForm((prev) => ({
      ...prev,
      websites: (prev.websites || []).map((w) =>
        w.id === id ? { ...w, [field]: value } : w
      ),
    }))
  }, [])

  // ESC close
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  const handleSave = async () => {
    if (!form.companyName.trim() || !form.jobTitle.trim()) {
      addToast('公司名称和岗位名称为必填项', 'error')
      return
    }

    // Filter out empty website entries
    const cleanWebsites = (form.websites || []).filter((w) => w.url.trim())

    const payload = { ...form, websites: cleanWebsites }

    if (job) {
      await updateJob(job.id, payload)
      addToast('岗位已更新', 'success')
    } else {
      await addJob({ ...payload, timeline: [] })
      addToast('岗位已新增', 'success')
    }
    onClose()
  }

  // ---- GlowCard: center glow on focused input ----
  const handleFocusIn = useCallback((e) => {
    const card = e.target.closest('.glow-card')
    if (!card) return
    const target = e.target
    const cardRect = card.getBoundingClientRect()
    const targetRect = target.getBoundingClientRect()
    card.style.setProperty('--mouse-x', `${targetRect.left + targetRect.width / 2 - cardRect.left}px`)
    card.style.setProperty('--mouse-y', `${targetRect.top + targetRect.height / 2 - cardRect.top}px`)
  }, [])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm modal-overlay" onClick={onClose}>
      <div className="modal-panel border w-full max-w-2xl mx-4 max-h-[90vh] min-h-0 flex flex-col shadow-2xl shadow-black/40" onClick={(e) => e.stopPropagation()}>
        <GlowCard style={{ background: 'transparent', border: 'none', boxShadow: 'none', padding: 0 }} className="rounded-[22px] w-full max-w-full min-w-0 flex flex-col flex-1">
        <div className="bg-white/90 backdrop-blur-xl dark:bg-transparent dark:backdrop-filter-none rounded-[22px] w-full max-w-full min-w-0 flex flex-col flex-1 min-h-0">
        {/* Header */}
        <ModalHeader title={job ? '编辑岗位' : '新增岗位'} onClose={onClose} />

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 pt-6 pb-7" onFocus={handleFocusIn}>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <Input label="公司名称 *" value={form.companyName} onChange={(e) => handleChange('companyName', e.target.value)} placeholder="例如：ByteDance" />
            <Input label="岗位名称 *" value={form.jobTitle} onChange={(e) => handleChange('jobTitle', e.target.value)} placeholder="例如：高级后端工程师" />

            <Select label="当前状态" value={form.status} onChange={(e) => handleChange('status', e.target.value)} options={STATUS_OPTIONS} />
            <Input label="城市" value={form.city} onChange={(e) => handleChange('city', e.target.value)} placeholder="例如：北京" />

            <Input label="薪资范围" value={form.salaryRange} onChange={(e) => handleChange('salaryRange', e.target.value)} placeholder="例如：30K-50K" />
            <Select label="工作模式" value={form.workMode} onChange={(e) => handleChange('workMode', e.target.value)} options={WORK_MODE_OPTIONS} />

            <Select label="投递渠道" value={form.channel} onChange={(e) => handleChange('channel', e.target.value)} options={CHANNEL_OPTIONS} />
            <Select label="优先级" value={form.priority} onChange={(e) => handleChange('priority', e.target.value)} options={PRIORITY_OPTIONS} />

            <Input label="投递日期" type="date" value={form.appliedDate} onChange={(e) => handleChange('appliedDate', e.target.value)} />

            {/* Resume selector */}
            <div>
              <label className="text-sm text-offer-muted block mb-1">关联简历</label>
              <select
                value={form.resumeId}
                onChange={(e) => handleChange('resumeId', e.target.value)}
                className="min-h-[40px] rounded-xl border border-white/10 bg-gray-950 px-4 py-2.5 text-sm font-medium text-white outline-none transition-all duration-200 focus:border-purple-400/70 focus:ring-2 focus:ring-purple-500/20 appearance-none cursor-pointer"
              >
                <option value="" className="bg-gray-950 text-offer-muted">不关联</option>
                {resumes.map((r) => (
                  <option key={r.id} value={r.id} className="bg-gray-950 text-white">
                    {r.name} ({r.version})
                  </option>
                ))}
              </select>
            </div>

            <Input label="联系人 / HR" value={form.contactName} onChange={(e) => handleChange('contactName', e.target.value)} placeholder="姓名" />

            <Input label="联系方式" value={form.contactInfo} onChange={(e) => handleChange('contactInfo', e.target.value)} placeholder="微信 / 电话" />
            <Input label="下一步行动" value={form.nextAction} onChange={(e) => handleChange('nextAction', e.target.value)} placeholder="例如：准备二面" />

            {/* ===== 求职链接区域 ===== */}
            <div className="col-span-2 bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 mt-1">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-white">🔗 求职链接</h3>
                  <p className="text-xs text-gray-400 dark:text-white/45 mt-0.5">添加各招聘平台的投递链接，支持一键跳转</p>
                </div>
                <button
                  type="button"
                  onClick={addWebsite}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-purple-500/15 border border-purple-400/25 px-3 py-1.5 text-xs font-medium text-purple-300 hover:bg-purple-500/25 transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  添加链接
                </button>
              </div>

              {/* Website links list */}
              <div className="space-y-2.5">
                {(form.websites || []).map((w) => (
                  <div key={w.id} className="flex items-center gap-2 bg-gray-950/50 rounded-lg px-3 py-2 border border-white/[0.06]">
                    <select
                      value={w.platform}
                      onChange={(e) => updateWebsite(w.id, 'platform', e.target.value)}
                      className="w-28 shrink-0 rounded-lg border border-white/10 bg-gray-900 px-2.5 py-2 text-xs text-white outline-none focus:border-purple-400/60 transition-all appearance-none cursor-pointer"
                    >
                      {PLATFORM_OPTIONS.map((p) => (
                        <option key={p} value={p}>{p || '选择平台'}</option>
                      ))}
                    </select>
                    <input
                      type="url"
                      value={w.url}
                      onChange={(e) => updateWebsite(w.id, 'url', e.target.value)}
                      placeholder="https://..."
                      className="flex-1 min-h-[36px] rounded-lg border border-white/10 bg-gray-900 px-3 py-2 text-xs text-white placeholder:text-gray-500 outline-none focus:border-purple-400/60 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => removeWebsite(w.id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0"
                      title="删除此链接"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}

                {(form.websites || []).length === 0 && (
                  <p className="text-xs text-gray-500 dark:text-white/30 py-3 text-center">暂无求职链接，点击上方按钮添加</p>
                )}
              </div>
            </div>

            <Input label="JD 原文" value={form.jdText} onChange={(e) => handleChange('jdText', e.target.value)} placeholder="粘贴 JD 内容..." large type="textarea" />
            <Input label="备注" value={form.notes} onChange={(e) => handleChange('notes', e.target.value)} placeholder="其他备注信息" large type="textarea" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-5 border-t border-slate-200 dark:border-white/10">
          <button
            onClick={onClose}
            className="btn-secondary px-4 py-2 rounded-xl text-sm font-medium"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="btn-gradient px-5 py-2 rounded-xl text-sm font-medium text-white"
          >
            {job ? '保存修改' : '新增岗位'}
          </button>
        </div>
        </div>
        </GlowCard>
      </div>
    </div>
  )
}
