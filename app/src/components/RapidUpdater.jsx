import { useState } from 'react'
import { STATUS_CONFIG, PRIORITY_CONFIG, STATUSES } from '../data'
import { lightenHex } from '../utils'

export default function RapidUpdater({ teams, tracks, tasks, onSave, onClose }) {
  // Local copy so changes are staged until Save
  const [local, setLocal] = useState(() =>
    tasks.reduce((acc, t) => ({ ...acc, [t.id]: { status: t.status, priority: t.priority, percentComplete: t.percentComplete } }), {})
  )
  const [filter, setFilter] = useState('') // search filter

  const update = (taskId, field, value) =>
    setLocal(prev => ({ ...prev, [taskId]: { ...prev[taskId], [field]: value } }))

  const changedCount = tasks.filter(t => {
    const l = local[t.id]
    return l && (l.status !== t.status || l.priority !== t.priority || l.percentComplete !== t.percentComplete)
  }).length

  const handleSave = () => {
    const updates = tasks
      .filter(t => {
        const l = local[t.id]
        return l && (l.status !== t.status || l.priority !== t.priority || l.percentComplete !== t.percentComplete)
      })
      .map(t => ({ ...t, ...local[t.id] }))
    onSave(updates)
  }

  const filteredTasks = (trackId) =>
    tasks.filter(t =>
      t.trackId === trackId &&
      (filter === '' || t.name.toLowerCase().includes(filter.toLowerCase()))
    )

  return (
    <div style={{
      position: 'fixed', right: 0, top: 0, bottom: 0,
      width: 400,
      background: '#ffffff',
      boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
      zIndex: 80,
      display: 'flex',
      flexDirection: 'column',
      borderLeft: '1px solid #e2e8f0',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
        background: '#0f172a',
        color: 'white',
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>⚡ Quick Update</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
            Scan and update task status across all tracks
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 20, cursor: 'pointer', padding: 0 }}>×</button>
      </div>

      {/* Search */}
      <div style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9', flexShrink: 0 }}>
        <input
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Filter tasks…"
          style={{
            width: '100%', padding: '6px 10px', border: '1px solid #e2e8f0',
            borderRadius: 6, fontSize: 12, fontFamily: 'inherit',
            outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Task list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {teams.map(team => {
          const teamTracks = tracks.filter(t => t.teamId === team.id)
          const teamVisible = teamTracks.some(tr => filteredTasks(tr.id).length > 0)
          if (!teamVisible) return null

          return (
            <div key={team.id}>
              {/* Team header */}
              <div style={{
                padding: '8px 16px',
                background: team.color,
                color: 'white',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}>
                {team.name}
              </div>

              {teamTracks.map(track => {
                const trackTasks = filteredTasks(track.id)
                if (trackTasks.length === 0) return null
                return (
                  <div key={track.id}>
                    {/* Track label */}
                    <div style={{
                      padding: '5px 16px 5px 20px',
                      background: lightenHex(team.color, 0.94),
                      fontSize: 10,
                      fontWeight: 700,
                      color: team.color,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      textTransform: 'uppercase',
                      letterSpacing: '0.4px',
                      borderBottom: '1px solid #f1f5f9',
                    }}>
                      <div style={{ width: 2, height: 10, borderRadius: 1, background: team.color }} />
                      {track.name}
                    </div>

                    {/* Tasks */}
                    {trackTasks.map(task => {
                      const l  = local[task.id] || {}
                      const sc = STATUS_CONFIG[l.status] || STATUS_CONFIG.notstarted
                      const changed = l.status !== task.status || l.priority !== task.priority || l.percentComplete !== task.percentComplete

                      return (
                        <div key={task.id} style={{
                          padding: '8px 16px 8px 24px',
                          borderBottom: '1px solid #f8fafc',
                          background: changed ? lightenHex(team.color, 0.95) : 'white',
                          borderLeft: changed ? `3px solid ${team.color}` : '3px solid transparent',
                        }}>
                          {/* Task name */}
                          <div style={{
                            fontSize: 12, fontWeight: 600, color: '#1e293b',
                            marginBottom: 6,
                            display: 'flex', alignItems: 'center', gap: 6,
                          }}>
                            <div style={{ width: 7, height: 7, borderRadius: '50%', background: sc.border, flexShrink: 0 }} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.name}</span>
                          </div>

                          {/* Controls */}
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            {/* Status */}
                            <select
                              value={l.status || task.status}
                              onChange={e => update(task.id, 'status', e.target.value)}
                              style={quickSel}
                            >
                              {STATUSES.map(s => (
                                <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                              ))}
                            </select>

                            {/* % complete */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, flex: 1 }}>
                              <span style={{ fontSize: 10, color: '#94a3b8', flexShrink: 0 }}>{l.percentComplete ?? task.percentComplete}%</span>
                              <input
                                type="range" min={0} max={100} step={5}
                                value={l.percentComplete ?? task.percentComplete}
                                onChange={e => update(task.id, 'percentComplete', Number(e.target.value))}
                                style={{ flex: 1, accentColor: sc.border, margin: 0 }}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid #e2e8f0',
        display: 'flex', gap: 8, justifyContent: 'space-between', alignItems: 'center',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 12, color: '#94a3b8' }}>
          {changedCount > 0 ? `${changedCount} change${changedCount !== 1 ? 's' : ''} staged` : 'No changes'}
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={btnSecondary}>Discard</button>
          <button
            onClick={handleSave}
            disabled={changedCount === 0}
            style={{ ...btnPrimary, opacity: changedCount > 0 ? 1 : 0.4 }}
          >
            Apply {changedCount > 0 ? changedCount : ''} update{changedCount !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  )
}

const quickSel = {
  fontSize: 11, padding: '3px 6px',
  border: '1px solid #e2e8f0', borderRadius: 5,
  background: '#f8fafc', color: '#334155',
  cursor: 'pointer', fontFamily: 'inherit',
  outline: 'none',
}

const btnPrimary   = { background: '#2563eb', color: 'white',   border: 'none', padding: '7px 16px', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }
const btnSecondary = { background: '#f1f5f9', color: '#64748b', border: 'none', padding: '7px 14px', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }
