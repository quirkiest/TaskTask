import { useState } from 'react'
import { initialTeams, initialTracks, initialTasks, STATUS_CONFIG } from './data'
import { addDays, startOfWeek, formatDate } from './utils'
import Timeline from './components/Timeline'
import TaskModal from './components/TaskModal'
import ManageModal from './components/ManageModal'

const NUM_WEEKS = 26 // visible window width

export default function App() {
  const [teams,  setTeams]  = useState(initialTeams)
  const [tracks, setTracks] = useState(initialTracks)
  const [tasks,  setTasks]  = useState(initialTasks)

  const [selectedTask,   setSelectedTask]   = useState(null)
  const [isModalOpen,    setIsModalOpen]    = useState(false)
  const [isNewTask,      setIsNewTask]      = useState(false)
  const [isManageOpen,   setIsManageOpen]   = useState(false)

  const today          = new Date()
  const defaultStart   = startOfWeek(addDays(today, -7 * 8)) // 8 weeks before today
  const [viewStart, setViewStart] = useState(defaultStart)

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
      comment: '',
      estimate: null,
      githubRef: null,
    })
    setIsNewTask(true)
    setIsModalOpen(true)
  }

  const saveTask = (updated) => {
    setTasks(prev =>
      isNewTask
        ? [...prev, updated]
        : prev.map(t => t.id === updated.id ? updated : t)
    )
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

  // ── Teams & tracks management ──────────────────────────
  const saveTeamsAndTracks = (newTeams, newTracks) => {
    // Remove tasks whose track no longer exists
    const validTrackIds = new Set(newTracks.map(t => t.id))
    setTasks(prev => prev.filter(t => validTrackIds.has(t.trackId)))
    setTeams(newTeams)
    setTracks(newTracks)
    setIsManageOpen(false)
  }

  // ── Navigation ─────────────────────────────────────────
  const navigate = (weeks) => setViewStart(prev => addDays(prev, weeks * 7))
  const goToday  = () => setViewStart(defaultStart)

  // ── Legend data ────────────────────────────────────────
  const legend = Object.entries(STATUS_CONFIG)

  return (
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
        {/* Logo */}
        <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.5px', color: '#f8fafc' }}>
          Task<span style={{ color: '#3b82f6' }}>Task</span>
        </span>

        <div style={{ width: 1, height: 20, background: '#334155' }} />

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <NavBtn onClick={() => navigate(-4)}>◂ 4w</NavBtn>
          <NavBtn onClick={() => navigate(-1)}>◂ 1w</NavBtn>
          <button onClick={goToday} style={{
            background: '#2563eb', color: 'white', border: 'none',
            padding: '5px 14px', borderRadius: 6, fontSize: 12,
            cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit',
          }}>
            Today
          </button>
          <NavBtn onClick={() => navigate(1)}>1w ▸</NavBtn>
          <NavBtn onClick={() => navigate(4)}>4w ▸</NavBtn>
        </div>

        <div style={{ width: 1, height: 20, background: '#334155' }} />

        {/* Manage button */}
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
          onTaskClick={openTask}
          onAddTask={openNewTask}
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
    </div>
  )
}

function NavBtn({ onClick, children }) {
  return (
    <button onClick={onClick} style={{
      background: '#1e293b',
      color: '#94a3b8',
      border: '1px solid #334155',
      borderRadius: 6,
      padding: '5px 10px',
      fontSize: 12,
      cursor: 'pointer',
      fontFamily: 'inherit',
    }}>
      {children}
    </button>
  )
}
