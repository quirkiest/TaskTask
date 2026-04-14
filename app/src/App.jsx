import { useState } from 'react'
import { initialTeams, initialTracks, initialTasks, STATUS_CONFIG } from './data'
import { addDays, startOfWeek, formatDate } from './utils'
import { SettingsProvider } from './SettingsContext'
import Timeline from './components/Timeline'
import TaskModal from './components/TaskModal'
import ManageModal from './components/ManageModal'
import RapidUpdater from './components/RapidUpdater'
import SettingsModal from './components/SettingsModal'
import Tooltip from './components/Tooltip'

const NUM_WEEKS = 78 // total rendered weeks (scroll range ≈ 18 months)

const ZOOM_META = [
  { width: 28,  label: 'Year'   },
  { width: 42,  label: '6 mo'   },
  { width: 56,  label: 'Qtr'    },
  { width: 84,  label: 'Month'  }, // default (index 3)
  { width: 112, label: '6 wk'   },
  { width: 168, label: '3 wk'   },
  { width: 224, label: '2 wk'   },
]
const DEFAULT_ZOOM = 3

export default function App() {
  const [teams,  setTeams]  = useState(initialTeams)
  const [tracks, setTracks] = useState(initialTracks)
  const [tasks,  setTasks]  = useState(initialTasks)

  const [selectedTask,   setSelectedTask]   = useState(null)
  const [isModalOpen,    setIsModalOpen]    = useState(false)
  const [isNewTask,      setIsNewTask]      = useState(false)
  const [isManageOpen,    setIsManageOpen]    = useState(false)
  const [isRapidOpen,     setIsRapidOpen]     = useState(false)
  const [isSettingsOpen,  setIsSettingsOpen]  = useState(false)

  const [zoomIdx,       setZoomIdx]       = useState(DEFAULT_ZOOM)
  const [scrollSignal,  setScrollSignal]  = useState(0)

  const weekWidth    = ZOOM_META[zoomIdx].width
  const zoomIn  = () => setZoomIdx(i => Math.min(i + 1, ZOOM_META.length - 1))
  const zoomOut = () => setZoomIdx(i => Math.max(i - 1, 0))

  const today          = new Date()
  const defaultStart   = startOfWeek(addDays(today, -7 * 8)) // 8 weeks before today
  const [viewStart] = useState(defaultStart)

  // ── Task interactions ──────────────────────────────────
  const openTask = (task) => {
    setSelectedTask(task)
    setIsNewTask(false)
    setIsModalOpen(true)
  }

  const openNewTask = (trackId) => {
    setSelectedTask({
      id: `T${Date.now()}`,
      trackId,
      name: '',
      type: 'Product',
      status: 'notstarted',
      priority: 'M',
      magnitude: 'M',
      startDate: formatDate(today),
      endDate:   formatDate(addDays(today, 28)),
      labels: [],
      percentComplete: 0,
      comments: [],
      history: [],
      estimate: null,
      githubRef: null,
    })
    setIsNewTask(true)
    setIsModalOpen(true)
  }

  const saveTask = (updated) => {
    const EDIT_TRACKED = ['name', 'startDate', 'endDate', 'trackId', 'status', 'priority', 'magnitude', 'percentComplete']
    setTasks(prev => {
      if (isNewTask) {
        const entry = { id: Date.now().toString(), ts: new Date().toISOString(), type: 'created', changes: [] }
        return [...prev, { ...updated, history: [entry] }]
      }
      return prev.map(t => {
        if (t.id !== updated.id) return t
        const changes = EDIT_TRACKED
          .filter(f => String(updated[f] ?? '') !== String(t[f] ?? ''))
          .map(f => ({ field: f, from: t[f], to: updated[f] }))
        if (changes.length === 0) return { ...t, ...updated }
        const entry = { id: Date.now().toString(), ts: new Date().toISOString(), type: 'edit', changes }
        return { ...updated, history: [...(t.history || []), entry] }
      })
    })
    closeModal()
  }

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id))
    closeModal()
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedTask(null)
    setIsNewTask(false)
  }

  // ── Direct task update (from drag) ────────────────────
  const updateTask = (taskId, updates) => {
    const DRAG_TRACKED = ['startDate', 'endDate', 'trackId']
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t
      const changes = DRAG_TRACKED
        .filter(f => updates[f] !== undefined && String(updates[f]) !== String(t[f] ?? ''))
        .map(f => ({ field: f, from: t[f], to: updates[f] }))
      if (changes.length === 0) return { ...t, ...updates }
      const entry = { id: Date.now().toString(), ts: new Date().toISOString(), type: 'drag', changes }
      return { ...t, ...updates, history: [...(t.history || []), entry] }
    }))
  }

  // ── Rapid updater bulk save ────────────────────────────
  const rapidSave = (updatedTasks) => {
    setTasks(prev => {
      const map = Object.fromEntries(updatedTasks.map(t => [t.id, t]))
      return prev.map(t => map[t.id] ?? t)
    })
    setIsRapidOpen(false)
  }

  // ── Teams & tracks management ──────────────────────────
  const saveTeamsAndTracks = (newTeams, newTracks) => {
    // Remove tasks whose track no longer exists
    const validTrackIds = new Set(newTracks.map(t => t.id))
    setTasks(prev => prev.filter(t => validTrackIds.has(t.trackId)))
    setTeams(newTeams)
    setTracks(newTracks)
    setIsManageOpen(false)
  }

  // ── Scroll to today ────────────────────────────────────
  const goToday = () => setScrollSignal(s => s + 1)

  // ── Legend data ────────────────────────────────────────
  const legend = Object.entries(STATUS_CONFIG)

  return (
    <SettingsProvider>
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>

      {/* ══ Top bar ══════════════════════════════════════ */}
      <div style={{
        background: '#0f172a',
        color: 'white',
        padding: '0 20px',
        height: 52,
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        flexShrink: 0,
        borderBottom: '1px solid #1e293b',
      }}>
        {/* Logo + version */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
          <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.5px', color: '#f8fafc' }}>
            Task<span style={{ color: '#3b82f6' }}>Task</span>
          </span>
          <span style={{ fontSize: 10, fontWeight: 500, color: '#475569', letterSpacing: '0.3px' }}>
            v{__APP_VERSION__}
          </span>
        </div>

        <div style={{ width: 1, height: 20, background: '#334155' }} />

        {/* Zoom controls */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <Tooltip label="Zoom out — see more time" placement="bottom">
            <NavBtn onClick={zoomOut} disabled={zoomIdx === 0}>−</NavBtn>
          </Tooltip>
          <Tooltip label={`Zoom level: ${ZOOM_META[zoomIdx].label}`} placement="bottom">
            <div style={{
              minWidth: 48, textAlign: 'center',
              fontSize: 11, fontWeight: 600, color: '#cbd5e1',
              letterSpacing: '0.3px',
            }}>
              {ZOOM_META[zoomIdx].label}
            </div>
          </Tooltip>
          <Tooltip label="Zoom in — see more detail" placement="bottom">
            <NavBtn onClick={zoomIn} disabled={zoomIdx === ZOOM_META.length - 1}>+</NavBtn>
          </Tooltip>
        </div>

        <Tooltip label="Scroll to today" placement="bottom">
          <button onClick={goToday} style={{
            background: '#2563eb', color: 'white', border: 'none',
            padding: '5px 14px', borderRadius: 6, fontSize: 12,
            cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit',
          }}>
            Today
          </button>
        </Tooltip>

        <div style={{ width: 1, height: 20, background: '#334155' }} />

        {/* Quick update button */}
        <Tooltip label="Bulk-edit multiple tasks at once" placement="bottom">
          <button
            onClick={() => setIsRapidOpen(true)}
            style={{
              background: 'none', color: '#94a3b8',
              border: '1px solid #334155', borderRadius: 6,
              padding: '5px 12px', fontSize: 12,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#f8fafc'; e.currentTarget.style.borderColor = '#475569' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = '#334155' }}
          >
            ⚡ Quick Update
          </button>
        </Tooltip>

        {/* Manage button */}
        <Tooltip label="Add, rename or reorder teams and tracks" placement="bottom">
          <button
            onClick={() => setIsManageOpen(true)}
            style={{
              background: 'none',
              color: '#94a3b8',
              border: '1px solid #334155',
              borderRadius: 6,
              padding: '5px 12px',
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#f8fafc'; e.currentTarget.style.borderColor = '#475569' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = '#334155' }}
          >
            ⚙ Teams &amp; Tracks
          </button>
        </Tooltip>

        {/* Display settings */}
        <Tooltip label="Display settings — customise card indicators" placement="bottom">
          <button
            onClick={() => setIsSettingsOpen(true)}
            style={{
              background: 'none',
              color: '#94a3b8',
              border: '1px solid #334155',
              borderRadius: 6,
              padding: '5px 10px',
              fontSize: 14,
              cursor: 'pointer',
              fontFamily: 'inherit',
              lineHeight: 1,
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#f8fafc'; e.currentTarget.style.borderColor = '#475569' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = '#334155' }}
          >
            ◫
          </button>
        </Tooltip>

        <div style={{ width: 1, height: 20, background: '#334155' }} />

        {/* Legend */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {legend.map(([key, cfg]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.border }} />
              <span style={{ fontSize: 11, color: '#94a3b8' }}>{cfg.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ══ Timeline ═════════════════════════════════════ */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Timeline
          teams={teams}
          tracks={tracks}
          tasks={tasks}
          viewStart={viewStart}
          numWeeks={NUM_WEEKS}
          weekWidth={weekWidth}
          scrollSignal={scrollSignal}
          onTaskClick={openTask}
          onAddTask={openNewTask}
          onTeamClick={() => setIsManageOpen(true)}
          onTaskUpdate={updateTask}
        />
      </div>

      {/* ══ Task modal ═══════════════════════════════════ */}
      {isModalOpen && selectedTask && (
        <TaskModal
          task={selectedTask}
          tracks={tracks}
          teams={teams}
          isNew={isNewTask}
          onSave={saveTask}
          onDelete={deleteTask}
          onClose={closeModal}
        />
      )}

      {/* ══ Rapid updater panel ══════════════════════════ */}
      {isRapidOpen && (
        <RapidUpdater
          teams={teams}
          tracks={tracks}
          tasks={tasks}
          onSave={rapidSave}
          onClose={() => setIsRapidOpen(false)}
        />
      )}

      {/* ══ Manage teams & tracks modal ══════════════════ */}
      {isManageOpen && (
        <ManageModal
          teams={teams}
          tracks={tracks}
          tasks={tasks}
          onSave={saveTeamsAndTracks}
          onClose={() => setIsManageOpen(false)}
        />
      )}

      {/* ══ Display settings modal ═══════════════════════ */}
      {isSettingsOpen && (
        <SettingsModal onClose={() => setIsSettingsOpen(false)} />
      )}
    </div>
    </SettingsProvider>
  )
}

function NavBtn({ onClick, children, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: '#1e293b',
      color: disabled ? '#475569' : '#94a3b8',
      border: '1px solid #334155',
      borderRadius: 6,
      padding: '5px 10px',
      fontSize: 13,
      fontWeight: 700,
      cursor: disabled ? 'default' : 'pointer',
      fontFamily: 'inherit',
    }}>
      {children}
    </button>
  )
}
