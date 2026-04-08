import { useState } from 'react'
import {
  STATUS_CONFIG, PRIORITY_CONFIG, MAGNITUDES,
  STATUSES, PRIORITIES, TYPES,
} from '../data'

export default function TaskModal({ task, tracks, teams, isNew, onSave, onDelete, onClose }) {
  const [form, setForm] = useState({
    ...task,
    labels: Array.isArray(task.labels) ? task.labels.join(', ') : (task.labels || ''),
  })

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const handleSave = () => {
    onSave({
      ...form,
      labels: form.labels.split(',').map(l => l.trim()).filter(Boolean),
      percentComplete: Number(form.percentComplete),
      estimate: form.estimate ? Number(form.estimate) : null,
    })
  }

  const sc = STATUS_CONFIG[form.status] || STATUS_CONFIG.notstarted
  const tracksByTeam = teams.map(team => ({
    team,
    tracks: tracks.filter(t => t.teamId === team.id),
  }))

  const labelArr = form.labels.split(',').map(l => l.trim()).filter(Boolean)

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(15,23,42,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 100,
        backdropFilter: 'blur(2px)',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: 'white',
        borderRadius: 14,
        width: 580,
        maxWidth: '96vw',
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
        display: 'flex',
        flexDirection: 'column',
      }}>

        {/* ── Status accent bar at top ── */}
        <div style={{ height: 4, background: sc.border, borderRadius: '14px 14px 0 0', flexShrink: 0 }} />

        <div style={{ padding: '24px 28px 28px', flex: 1 }}>

          {/* Header: ID + Name */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
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
                  background: 'transparent', padding: 0,
                  fontFamily: 'inherit',
                }}
              />
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 22, color: '#94a3b8', padding: '0 0 0 16px', lineHeight: 1,
              }}
            >×</button>
          </div>

          {/* ── Row: Status / Priority / Magnitude / Type ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 18 }}>
            <Field label="Status">
              <select value={form.status} onChange={e => set('status', e.target.value)} style={sel}>
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
              </select>
            </Field>
            <Field label="Priority">
              <select value={form.priority} onChange={e => set('priority', e.target.value)} style={sel}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p} — {p === 'VH' ? 'Very High' : p === 'H' ? 'High' : p === 'M' ? 'Medium' : 'Low'}</option>)}
              </select>
            </Field>
            <Field label="Magnitude">
              <select value={form.magnitude} onChange={e => set('magnitude', e.target.value)} style={sel}>
                {MAGNITUDES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </Field>
            <Field label="Type">
              <select value={form.type} onChange={e => set('type', e.target.value)} style={sel}>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
          </div>

          {/* ── Dates ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
            <Field label="Start Date">
              <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} style={inp} />
            </Field>
            <Field label="End Date">
              <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} style={inp} />
            </Field>
          </div>

          {/* ── Track ── */}
          <Field label="Track" style={{ marginBottom: 18 }}>
            <select value={form.trackId} onChange={e => set('trackId', e.target.value)} style={sel}>
              {tracksByTeam.map(({ team, tracks: tt }) => (
                <optgroup key={team.id} label={team.name}>
                  {tt.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </optgroup>
              ))}
            </select>
          </Field>

          {/* ── % Complete ── */}
          <Field label={`Progress — ${form.percentComplete}%`} style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input
                type="range" min={0} max={100} step={5}
                value={form.percentComplete}
                onChange={e => set('percentComplete', e.target.value)}
                style={{ flex: 1, accentColor: sc.border }}
              />
              <div style={{ width: 100, height: 6, borderRadius: 3, background: '#e2e8f0', flexShrink: 0 }}>
                <div style={{
                  height: '100%', borderRadius: 3,
                  width: `${form.percentComplete}%`,
                  background: sc.border,
                  transition: 'width 0.15s',
                }} />
              </div>
            </div>
          </Field>

          {/* ── Labels ── */}
          <Field label="Labels (comma-separated)" style={{ marginBottom: 18 }}>
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

          {/* ── GitHub + Estimate ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 18 }}>
            <Field label="GitHub Ref">
              <input
                value={form.githubRef || ''}
                onChange={e => set('githubRef', e.target.value)}
                placeholder="#123 or 'multiple'"
                style={inp}
              />
            </Field>
            <Field label="Estimate (person-days)">
              <input
                type="number" min={0}
                value={form.estimate || ''}
                onChange={e => set('estimate', e.target.value)}
                placeholder="—"
                style={inp}
              />
            </Field>
          </div>

          {/* ── Comment ── */}
          <Field label="Comment" style={{ marginBottom: 28 }}>
            <textarea
              value={form.comment || ''}
              onChange={e => set('comment', e.target.value)}
              placeholder="Notes, blockers, context…"
              rows={3}
              style={{ ...inp, resize: 'vertical', fontFamily: 'inherit' }}
            />
          </Field>

          {/* ── Actions ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {!isNew
              ? (
                <button onClick={() => onDelete(form.id)} style={btnDanger}>
                  Delete task
                </button>
              )
              : <div />
            }
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={onClose} style={btnSecondary}>Cancel</button>
              <button onClick={handleSave} style={btnPrimary}>
                {isNew ? 'Create task' : 'Save changes'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

function Field({ label, children, style }) {
  return (
    <div style={style}>
      <label style={{
        display: 'block',
        fontSize: 10,
        fontWeight: 700,
        color: '#64748b',
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: '0.7px',
      }}>
        {label}
      </label>
      {children}
    </div>
  )
}

const base = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid #e2e8f0',
  borderRadius: 7,
  fontSize: 13,
  color: '#0f172a',
  background: '#f8fafc',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
}
const inp = { ...base }
const sel = { ...base, cursor: 'pointer' }

const btnPrimary   = { background: '#2563eb', color: 'white',   border: 'none', padding: '9px 22px', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }
const btnSecondary = { background: '#f1f5f9', color: '#64748b', border: 'none', padding: '9px 18px', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }
const btnDanger    = { background: '#fee2e2', color: '#dc2626', border: 'none', padding: '9px 16px', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }
