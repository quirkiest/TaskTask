import { useState, useRef, useEffect } from 'react'

const PRESET_COLORS = [
  '#2563eb', '#7c3aed', '#db2777', '#dc2626', '#ea580c',
  '#ca8a04', '#16a34a', '#0891b2', '#0f766e', '#475569',
]

export default function ManageModal({ teams, tracks, tasks, onSave, onClose }) {
  const [localTeams,  setLocalTeams]  = useState(teams)
  const [localTracks, setLocalTracks] = useState(tracks)
  const [colorPickerId, setColorPickerId] = useState(null) // teamId with open swatch picker
  const [confirmDelete, setConfirmDelete] = useState(null) // { type, id, count, label }
  const overlayRef = useRef()

  // Close color picker on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest('[data-color-picker]')) setColorPickerId(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ── Teams ──────────────────────────────────────────────────
  const addTeam = () => {
    const id = `team-${Date.now()}`
    setLocalTeams(prev => [...prev, { id, name: 'New Team', color: PRESET_COLORS[prev.length % PRESET_COLORS.length] }])
    setLocalTracks(prev => [...prev, { id: `${id}-t1`, teamId: id, name: 'Track 1' }])
  }

  const updateTeam = (id, field, value) =>
    setLocalTeams(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t))

  const requestDeleteTeam = (id) => {
    const teamTracks = localTracks.filter(t => t.teamId === id)
    const count = tasks.filter(t => teamTracks.some(tr => tr.id === t.trackId)).length
    if (count === 0) {
      doDeleteTeam(id)
    } else {
      const team = localTeams.find(t => t.id === id)
      setConfirmDelete({ type: 'team', id, count, label: team.name })
    }
  }

  const doDeleteTeam = (id) => {
    setLocalTeams(prev => prev.filter(t => t.id !== id))
    setLocalTracks(prev => prev.filter(t => t.teamId !== id))
    setConfirmDelete(null)
  }

  // ── Tracks ─────────────────────────────────────────────────
  const addTrack = (teamId) =>
    setLocalTracks(prev => [...prev, { id: `${teamId}-t${Date.now()}`, teamId, name: 'New Track' }])

  const updateTrack = (id, value) =>
    setLocalTracks(prev => prev.map(t => t.id === id ? { ...t, name: value } : t))

  const requestDeleteTrack = (id) => {
    const count = tasks.filter(t => t.trackId === id).length
    if (count === 0) {
      doDeleteTrack(id)
    } else {
      const track = localTracks.find(t => t.id === id)
      setConfirmDelete({ type: 'track', id, count, label: track.name })
    }
  }

  const doDeleteTrack = (id) => {
    setLocalTracks(prev => prev.filter(t => t.id !== id))
    setConfirmDelete(null)
  }

  // ── Save ───────────────────────────────────────────────────
  const handleSave = () => {
    const validTeams  = localTeams.filter(t => t.name.trim())
    const validTracks = localTracks.filter(t => t.name.trim())
    onSave(validTeams, validTracks)
  }

  const team = localTeams.find(t => t.id === colorPickerId)

  return (
    <div
      ref={overlayRef}
      style={overlay}
      onClick={e => e.target === overlayRef.current && onClose()}
    >
      <div style={panel}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Teams & Tracks</h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#94a3b8' }}>
              Define capacity lanes. Each team can have as many tracks as needed.
            </p>
          </div>
          <button onClick={onClose} style={closeBtn}>×</button>
        </div>

        {/* ── Team list ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {localTeams.map(team => {
            const teamTracks = localTracks.filter(t => t.teamId === team.id)
            return (
              <div key={team.id} style={{
                borderRadius: 10,
                border: `1px solid ${team.color}40`,
                overflow: 'visible',
                position: 'relative',
              }}>

                {/* Team header row */}
                <div style={{
                  background: team.color + '12',
                  borderBottom: `1px solid ${team.color}30`,
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  borderRadius: '10px 10px 0 0',
                }}>

                  {/* Color swatch + picker */}
                  <div data-color-picker style={{ position: 'relative', flexShrink: 0 }}>
                    <div
                      onClick={() => setColorPickerId(prev => prev === team.id ? null : team.id)}
                      title="Change team colour"
                      style={{
                        width: 22, height: 22, borderRadius: 6,
                        background: team.color,
                        cursor: 'pointer',
                        border: '2px solid rgba(255,255,255,0.5)',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                      }}
                    />
                    {colorPickerId === team.id && (
                      <div style={{
                        position: 'absolute',
                        top: 28,
                        left: 0,
                        zIndex: 50,
                        background: 'white',
                        borderRadius: 8,
                        padding: 8,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                        border: '1px solid #e2e8f0',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(5, 1fr)',
                        gap: 6,
                      }}>
                        {PRESET_COLORS.map(c => (
                          <div
                            key={c}
                            onClick={() => { updateTeam(team.id, 'color', c); setColorPickerId(null) }}
                            style={{
                              width: 22, height: 22, borderRadius: 5,
                              background: c, cursor: 'pointer',
                              border: c === team.color ? '2px solid #0f172a' : '2px solid transparent',
                              boxSizing: 'border-box',
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Team name */}
                  <input
                    value={team.name}
                    onChange={e => updateTeam(team.id, 'name', e.target.value)}
                    style={{
                      flex: 1, fontSize: 14, fontWeight: 700, color: '#0f172a',
                      border: 'none', outline: 'none', background: 'transparent',
                      fontFamily: 'inherit',
                    }}
                    placeholder="Team name…"
                  />

                  <span style={{ fontSize: 11, color: team.color, fontWeight: 600, marginRight: 4 }}>
                    {teamTracks.length} track{teamTracks.length !== 1 ? 's' : ''}
                  </span>

                  {/* Delete team */}
                  <button
                    onClick={() => requestDeleteTeam(team.id)}
                    title="Delete team"
                    style={deleteBtn}
                  >
                    ✕
                  </button>
                </div>

                {/* Track list */}
                <div style={{ padding: '6px 12px 10px' }}>
                  {teamTracks.length === 0 && (
                    <div style={{ fontSize: 12, color: '#94a3b8', padding: '8px 0', fontStyle: 'italic' }}>
                      No tracks yet — add one below
                    </div>
                  )}
                  {teamTracks.map((track, i) => (
                    <div key={track.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '5px 0',
                      borderBottom: i < teamTracks.length - 1 ? '1px solid #f1f5f9' : 'none',
                    }}>
                      {/* Drag handle (visual only for now) */}
                      <span style={{ color: '#cbd5e1', fontSize: 13, cursor: 'grab', userSelect: 'none', lineHeight: 1 }}>
                        ⠿
                      </span>

                      {/* Team colour bar */}
                      <div style={{
                        width: 3, height: 18, borderRadius: 2,
                        background: team.color, flexShrink: 0,
                      }} />

                      {/* Track name input */}
                      <input
                        value={track.name}
                        onChange={e => updateTrack(track.id, e.target.value)}
                        style={{
                          flex: 1,
                          fontSize: 13,
                          color: '#334155',
                          border: '1px solid transparent',
                          borderRadius: 5,
                          padding: '4px 8px',
                          background: 'transparent',
                          fontFamily: 'inherit',
                          outline: 'none',
                          transition: 'border-color 0.1s, background 0.1s',
                        }}
                        onFocus={e => {
                          e.target.style.borderColor = '#e2e8f0'
                          e.target.style.background = '#f8fafc'
                        }}
                        onBlur={e => {
                          e.target.style.borderColor = 'transparent'
                          e.target.style.background = 'transparent'
                        }}
                        placeholder="Track name…"
                      />

                      {/* Task count badge */}
                      {(() => {
                        const n = tasks.filter(t => t.trackId === track.id).length
                        return n > 0 ? (
                          <span style={{
                            fontSize: 10, fontWeight: 600,
                            color: team.color,
                            background: team.color + '15',
                            borderRadius: 10, padding: '1px 6px',
                            flexShrink: 0,
                          }}>
                            {n}
                          </span>
                        ) : null
                      })()}

                      {/* Delete track */}
                      <button
                        onClick={() => requestDeleteTrack(track.id)}
                        title="Delete track"
                        style={deleteBtn}
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  {/* Add track button */}
                  <button
                    onClick={() => addTrack(team.id)}
                    style={{
                      marginTop: 8,
                      width: '100%',
                      background: 'none',
                      border: `1px dashed ${team.color}60`,
                      color: team.color,
                      borderRadius: 6,
                      padding: '5px 12px',
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 600,
                      fontFamily: 'inherit',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => e.target.style.background = team.color + '10'}
                    onMouseLeave={e => e.target.style.background = 'none'}
                  >
                    + Add track
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Add team ── */}
        <button
          onClick={addTeam}
          style={{
            marginTop: 14,
            width: '100%',
            background: '#f8fafc',
            border: '1px dashed #cbd5e1',
            color: '#64748b',
            borderRadius: 8,
            padding: '10px',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
            fontFamily: 'inherit',
            transition: 'background 0.1s, border-color 0.1s',
          }}
          onMouseEnter={e => { e.target.style.background = '#f1f5f9'; e.target.style.borderColor = '#94a3b8' }}
          onMouseLeave={e => { e.target.style.background = '#f8fafc'; e.target.style.borderColor = '#cbd5e1' }}
        >
          + Add team
        </button>

        {/* ── Actions ── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
          <button onClick={onClose} style={btnSecondary}>Cancel</button>
          <button onClick={handleSave} style={btnPrimary}>Save changes</button>
        </div>
      </div>

      {/* ── Confirm delete dialog ── */}
      {confirmDelete && (
        <div style={{
          position: 'fixed', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200,
        }}>
          <div style={{
            background: 'white',
            borderRadius: 12,
            padding: '28px 28px 24px',
            width: 400,
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            border: '1px solid #fecaca',
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>
              Delete {confirmDelete.type}?
            </div>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
              <strong>"{confirmDelete.label}"</strong> has {confirmDelete.count} task
              {confirmDelete.count !== 1 ? 's' : ''} assigned to it.
              Deleting it will also remove {confirmDelete.count === 1 ? 'that task' : 'those tasks'}.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmDelete(null)} style={btnSecondary}>Cancel</button>
              <button
                onClick={() => confirmDelete.type === 'team' ? doDeleteTeam(confirmDelete.id) : doDeleteTrack(confirmDelete.id)}
                style={{ ...btnPrimary, background: '#dc2626' }}
              >
                Delete anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Styles ──────────────────────────────────────────────────
const overlay = {
  position: 'fixed', inset: 0,
  background: 'rgba(15,23,42,0.55)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 100,
  backdropFilter: 'blur(2px)',
}

const panel = {
  background: 'white',
  borderRadius: 14,
  padding: '28px 28px 24px',
  width: 520,
  maxWidth: '96vw',
  maxHeight: '88vh',
  overflowY: 'auto',
  boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
}

const closeBtn = {
  background: 'none', border: 'none', cursor: 'pointer',
  fontSize: 22, color: '#94a3b8', padding: 0, lineHeight: 1,
  marginTop: -2,
}

const deleteBtn = {
  background: 'none', border: 'none', cursor: 'pointer',
  fontSize: 12, color: '#cbd5e1', padding: '2px 4px', lineHeight: 1,
  borderRadius: 4, flexShrink: 0, fontFamily: 'inherit',
  transition: 'color 0.1s, background 0.1s',
  onMouseEnter: undefined,
}

const btnPrimary   = { background: '#2563eb', color: 'white',   border: 'none', padding: '9px 22px', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }
const btnSecondary = { background: '#f1f5f9', color: '#64748b', border: 'none', padding: '9px 18px', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }
