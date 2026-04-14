import { useState } from 'react'
import { STATUS_CONFIG, STATUSES, TYPE_CONFIG, TYPES } from '../data'

// ── Chip option data ──────────────────────────────────────────────────────────

const STATUS_OPTS = STATUSES.map(s => ({
  value: s,
  label: STATUS_CONFIG[s].label,
  bg:    STATUS_CONFIG[s].bg,
  color: STATUS_CONFIG[s].text,
}))

const SIZE_LEVELS = ['XS', 'S', 'M', 'L', 'XL']
const PRIORITY_LEVELS = ['L', 'M', 'H', 'VH']
const PRIORITY_LABELS = { L: 'Low', M: 'Medium', H: 'High', VH: 'Very High' }
const PRIORITY_COLORS = { L: '#16a34a', M: '#ca8a04', H: '#ea580c', VH: '#dc2626' }

const TYPE_OPTS = TYPES.map(t => ({
  value: t,
  label: t,
  bg:    TYPE_CONFIG[t]?.bg    ?? '#f1f5f9',
  color: TYPE_CONFIG[t]?.color ?? '#475569',
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtTs = (ts) => {
  const d = new Date(ts)
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' })
}

const fmtDate = (d) => {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const FIELD_LABELS = {
  startDate:       'Start Date',
  endDate:         'End Date',
  trackId:         'Track',
  status:          'Status',
  priority:        'Priority',
  magnitude:       'Size',
  percentComplete: 'Progress',
  name:            'Name',
}

const HIST_TYPE = {
  drag:    { label: 'Drag',    bg: '#dbeafe', color: '#1d4ed8' },
  edit:    { label: 'Edit',    bg: '#ffedd5', color: '#c2410c' },
  created: { label: 'Created', bg: '#dcfce7', color: '#15803d' },
}

// ── PriorityStarsSelector ─────────────────────────────────────────────────────
// Interactive 4-star cartouche — L=1★  M=2★  H=3★  VH=4★

function PriorityStarsSelector({ value, onChange }) {
  const [hover, setHover] = useState(0)
  const currentCount = PRIORITY_LEVELS.indexOf(value) + 1  // 1–4
  const activeCount  = hover > 0 ? hover : currentCount

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} onMouseLeave={() => setHover(0)}>
      <div style={{
        display: 'flex', gap: 2, alignItems: 'center',
        background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.10)',
        borderRadius: 12, padding: '5px 10px', cursor: 'pointer',
      }}>
        {[1, 2, 3, 4].map(i => (
          <span
            key={i}
            onClick={() => onChange(PRIORITY_LEVELS[i - 1])}
            onMouseEnter={() => setHover(i)}
            style={{
              fontSize: 20, lineHeight: 1, cursor: 'pointer',
              color: i <= activeCount ? '#d97706' : '#dde3ec',
              transition: 'color 0.1s',
            }}
          >★</span>
        ))}
      </div>
      <span style={{ fontSize: 14, fontWeight: 700, color: '#475569', minWidth: 60 }}>
        {PRIORITY_LABELS[PRIORITY_LEVELS[activeCount - 1]] ?? value}
      </span>
    </div>
  )
}

// ── SizeBarsSelector ──────────────────────────────────────────────────────────
// Interactive charcoal bars — XS=1 bar … XL=5 bars

function SizeBarsSelector({ value, onChange }) {
  const [hover, setHover] = useState(null)
  const currentIdx = SIZE_LEVELS.indexOf(value)   // 0–4
  const activeIdx  = hover !== null ? hover : currentIdx

  // Bars rendered top→bottom: [4,3,2,1,0] → XL at top, XS at bottom
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} onMouseLeave={() => setHover(null)}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, cursor: 'pointer' }}>
        {[4, 3, 2, 1, 0].map((barIdx) => (
          <div
            key={barIdx}
            onClick={() => onChange(SIZE_LEVELS[barIdx])}
            onMouseEnter={() => setHover(barIdx)}
            style={{
              width: 44, height: 7, borderRadius: 2,
              background: barIdx <= activeIdx ? '#64748b' : '#dde3ec',
              transition: 'background 0.1s', cursor: 'pointer',
            }}
          />
        ))}
      </div>
      <span style={{ fontSize: 14, fontWeight: 700, color: '#64748b', minWidth: 28 }}>
        {SIZE_LEVELS[activeIdx] ?? value}
      </span>
    </div>
  )
}

// ── ChipSelect ────────────────────────────────────────────────────────────────

function ChipSelect({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
      {options.map(opt => {
        const active = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              padding: '4px 11px',
              borderRadius: 20,
              border: active ? `1.5px solid ${opt.color}` : '1.5px solid transparent',
              background: active ? opt.bg : '#f1f5f9',
              color: active ? opt.color : '#94a3b8',
              fontSize: 11,
              fontWeight: active ? 700 : 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
              letterSpacing: '0.2px',
              transition: 'all 0.12s',
              whiteSpace: 'nowrap',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────

export default function TaskModal({ task, tracks, teams, isNew, onSave, onDelete, onClose }) {
  const [form, setForm] = useState({
    ...task,
    comments: Array.isArray(task.comments) ? task.comments : [],
    history:  Array.isArray(task.history)  ? task.history  : [],
    labels:   Array.isArray(task.labels)   ? task.labels.join(', ') : (task.labels || ''),
  })
  const [newComment, setNewComment] = useState('')
  const [activeTab,  setActiveTab]  = useState('details')

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const addComment = () => {
    const text = newComment.trim()
    if (!text) return
    const entry = { id: Date.now().toString(), text, ts: new Date().toISOString() }
    setForm(f => ({ ...f, comments: [...(f.comments || []), entry] }))
    setNewComment('')
  }

  const handleSave = () => {
    onSave({
      ...form,
      labels:          form.labels.split(',').map(l => l.trim()).filter(Boolean),
      percentComplete: Number(form.percentComplete),
      estimate:        form.estimate ? Number(form.estimate) : null,
    })
  }

  // Auto-save on backdrop click or × — skip if new task has no name yet
  const handleAutoSave = () => {
    if (isNew && !form.name.trim()) { onClose(); return }
    handleSave()
  }

  const sc           = STATUS_CONFIG[form.status] || STATUS_CONFIG.notstarted
  const tracksByTeam = teams.map(team => ({ team, tracks: tracks.filter(t => t.teamId === team.id) }))
  const trackMap     = Object.fromEntries(tracks.map(t => [t.id, t.name]))
  const labelArr     = form.labels.split(',').map(l => l.trim()).filter(Boolean)

  const fmtHistVal = (field, value) => {
    if (value === null || value === undefined) return '—'
    if (field === 'startDate' || field === 'endDate') return fmtDate(value)
    if (field === 'trackId')         return trackMap[value] || value
    if (field === 'status')          return STATUS_CONFIG[value]?.label || value
    if (field === 'percentComplete') return `${value}%`
    if (Array.isArray(value))        return value.join(', ') || '—'
    return String(value)
  }

  const reversedHistory = [...form.history].reverse()
  const commentCount    = form.comments.length
  const historyCount    = form.history.length

  const TABS = [
    { id: 'details',  label: 'Details' },
    { id: 'comments', label: commentCount > 0 ? `Comments (${commentCount})` : 'Comments' },
    { id: 'history',  label: historyCount > 0 ? `History (${historyCount})`  : 'History'  },
  ]

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(15,23,42,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 100, backdropFilter: 'blur(2px)',
      }}
      onClick={e => e.target === e.currentTarget && handleAutoSave()}
    >
      <div style={{
        background: 'white', borderRadius: 14,
        width: 580, maxWidth: '96vw',
        height: 680, maxHeight: '92vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
      }}>

        {/* ── Status accent bar ── */}
        <div style={{ height: 4, background: sc.border, borderRadius: '14px 14px 0 0', flexShrink: 0 }} />

        {/* ── Fixed header + tab bar ── */}
        <div style={{ padding: '22px 28px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', marginBottom: 6, letterSpacing: '0.8px' }}>
                {isNew ? 'NEW TASK' : `TASK ${form.id}`}
              </div>
              <input
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="Task name…"
                style={{
                  fontSize: 20, fontWeight: 700, color: '#0f172a',
                  border: 'none', outline: 'none', width: '100%',
                  background: 'transparent', padding: 0, fontFamily: 'inherit',
                }}
              />
            </div>
            <button
              onClick={handleAutoSave}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#94a3b8', padding: '0 0 0 16px', lineHeight: 1 }}
            >×</button>
          </div>

          {/* Tab bar */}
          <div style={{ display: 'flex', marginLeft: -28, marginRight: -28, paddingLeft: 28, borderBottom: '2px solid #f1f5f9' }}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '8px 16px', fontSize: 13, fontFamily: 'inherit',
                  fontWeight: activeTab === tab.id ? 600 : 400,
                  color:      activeTab === tab.id ? '#2563eb' : '#64748b',
                  borderBottom: activeTab === tab.id ? '2px solid #2563eb' : '2px solid transparent',
                  marginBottom: -2, whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Scrollable tab content ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>

          {/* ══ DETAILS ══════════════════════════════════════ */}
          {activeTab === 'details' && (<>

            {/* Status — full width */}
            <Field label="Status" style={{ marginBottom: 14 }}>
              <ChipSelect options={STATUS_OPTS} value={form.status} onChange={v => set('status', v)} />
            </Field>

            {/* Priority + Size — side by side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 14 }}>
              <Field label="Priority">
                <PriorityStarsSelector value={form.priority} onChange={v => set('priority', v)} />
              </Field>
              <Field label="Size">
                <SizeBarsSelector value={form.magnitude || 'M'} onChange={v => set('magnitude', v)} />
              </Field>
            </div>

            {/* Type — full width */}
            <Field label="Type" style={{ marginBottom: 18 }}>
              <ChipSelect options={TYPE_OPTS} value={form.type} onChange={v => set('type', v)} />
            </Field>

            {/* Divider */}
            <div style={{ borderTop: '1px solid #f1f5f9', marginBottom: 18 }} />

            {/* Dates */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <Field label="Start Date">
                <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} style={inp} />
              </Field>
              <Field label="End Date">
                <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} style={inp} />
              </Field>
            </div>

            {/* Track */}
            <Field label="Track" style={{ marginBottom: 14 }}>
              <select value={form.trackId} onChange={e => set('trackId', e.target.value)} style={sel}>
                {tracksByTeam.map(({ team, tracks: tt }) => (
                  <optgroup key={team.id} label={team.name}>
                    {tt.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </optgroup>
                ))}
              </select>
            </Field>

            {/* Progress */}
            <Field label={`Progress — ${form.percentComplete}%`} style={{ marginBottom: 14 }}>
              <input
                type="range" min={0} max={100} step={5}
                value={form.percentComplete}
                onChange={e => set('percentComplete', e.target.value)}
                style={{ width: '100%', accentColor: sc.border }}
              />
            </Field>

            {/* Labels */}
            <Field label="Labels (comma-separated)" style={{ marginBottom: 14 }}>
              <input
                value={form.labels}
                onChange={e => set('labels', e.target.value)}
                placeholder="tokyogov, codex, urgent…"
                style={inp}
              />
              {labelArr.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {labelArr.map(l => (
                    <span key={l} style={{
                      fontSize: 11, padding: '2px 8px', borderRadius: 12,
                      background: '#f1f5f9', color: '#475569', fontWeight: 500,
                    }}>
                      {l}
                    </span>
                  ))}
                </div>
              )}
            </Field>

            {/* GitHub + Estimate */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
              <Field label="GitHub Ref">
                <input
                  value={form.githubRef || ''}
                  onChange={e => set('githubRef', e.target.value)}
                  placeholder="#123 or 'multiple'"
                  style={inp}
                />
              </Field>
              <Field label="Estimate (days)">
                <input
                  type="number" min={0}
                  value={form.estimate || ''}
                  onChange={e => set('estimate', e.target.value)}
                  placeholder="—"
                  style={inp}
                />
              </Field>
            </div>

          </>)}

          {/* ══ COMMENTS ══════════════════════════════════════ */}
          {activeTab === 'comments' && (
            <div>
              {form.comments.length > 0 ? (
                <div style={{ border: '1px solid #e2e8f0', borderRadius: 7, overflow: 'hidden', marginBottom: 12 }}>
                  {form.comments.map((c, i) => (
                    <div key={c.id} style={{
                      padding: '10px 14px',
                      borderBottom: i < form.comments.length - 1 ? '1px solid #f1f5f9' : 'none',
                      background: i % 2 === 0 ? '#fff' : '#fafafa',
                    }}>
                      <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4 }}>{fmtTs(c.ts)}</div>
                      <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.5 }}>{c.text}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '24px 0 16px' }}>
                  No comments yet
                </div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <textarea
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) addComment() }}
                  placeholder="Add a note… (⌘↵ to post)"
                  rows={3}
                  style={{ ...inp, flex: 1, resize: 'none', fontFamily: 'inherit' }}
                />
                <button
                  onClick={addComment}
                  disabled={!newComment.trim()}
                  style={{ ...btnPrimary, padding: '0 14px', opacity: newComment.trim() ? 1 : 0.4, alignSelf: 'stretch', fontSize: 12 }}
                >
                  Post
                </button>
              </div>
            </div>
          )}

          {/* ══ HISTORY ═══════════════════════════════════════ */}
          {activeTab === 'history' && (
            <div>
              {reversedHistory.length === 0 ? (
                <div style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '40px 0' }}>
                  No history yet — changes will be recorded here automatically.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {reversedHistory.map(entry => {
                    const tc = HIST_TYPE[entry.type] || HIST_TYPE.edit
                    return (
                      <div key={entry.id} style={{
                        border: '1px solid #f1f5f9', borderRadius: 8,
                        padding: '10px 14px', background: '#fafafa',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: entry.type === 'created' ? 0 : 7 }}>
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
                            background: tc.bg, color: tc.color,
                            textTransform: 'uppercase', letterSpacing: '0.5px',
                          }}>
                            {tc.label}
                          </span>
                          <span style={{ fontSize: 11, color: '#94a3b8' }}>{fmtTs(entry.ts)}</span>
                        </div>
                        {entry.type === 'created' && (
                          <div style={{ fontSize: 13, color: '#475569' }}>Task created</div>
                        )}
                        {(entry.changes || []).map((change, ci) => (
                          <div key={ci} style={{ fontSize: 12, color: '#475569', display: 'flex', gap: 6, alignItems: 'baseline', marginTop: 4 }}>
                            <span style={{ fontWeight: 600, color: '#64748b', minWidth: 96, flexShrink: 0 }}>
                              {FIELD_LABELS[change.field] || change.field}
                            </span>
                            <span style={{ color: '#dc2626', textDecoration: 'line-through', wordBreak: 'break-all' }}>
                              {fmtHistVal(change.field, change.from)}
                            </span>
                            <span style={{ color: '#94a3b8' }}>→</span>
                            <span style={{ color: '#16a34a', wordBreak: 'break-all' }}>
                              {fmtHistVal(change.field, change.to)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

        </div>

        {/* ── Actions (always visible) ── */}
        <div style={{
          padding: '14px 28px 20px', borderTop: '1px solid #f1f5f9',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexShrink: 0,
        }}>
          {!isNew
            ? <button onClick={() => onDelete(form.id)} style={btnDanger}>Delete task</button>
            : <div />
          }
          <button onClick={onClose} style={btnSecondary}>
            Discard
          </button>
        </div>

      </div>
    </div>
  )
}

// ── Field wrapper ─────────────────────────────────────────────────────────────

function Field({ label, children, style }) {
  return (
    <div style={style}>
      <label style={{
        display: 'block', fontSize: 10, fontWeight: 700, color: '#64748b',
        marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.7px',
      }}>
        {label}
      </label>
      {children}
    </div>
  )
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const base = {
  width: '100%', padding: '8px 10px',
  border: '1px solid #e2e8f0', borderRadius: 7,
  fontSize: 13, color: '#0f172a', background: '#f8fafc',
  fontFamily: 'inherit', boxSizing: 'border-box',
}
const inp = { ...base }
const sel = { ...base, cursor: 'pointer' }

const btnPrimary   = { background: '#2563eb', color: 'white',   border: 'none', padding: '9px 22px', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }
const btnSecondary = { background: '#f1f5f9', color: '#64748b', border: 'none', padding: '9px 18px', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }
const btnDanger    = { background: '#fee2e2', color: '#dc2626', border: 'none', padding: '9px 16px', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }
