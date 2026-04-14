import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import {
  LABEL_WIDTH, ROW_HEIGHT, TRACK_PADDING,
  HEADER_HEIGHT, TEAM_HEADER_H,
  getVisibleWeeks, getMonthGroups, packTasksIntoRows,
  getTaskLayout, trackHeight, addDays, startOfWeek,
  daysBetween, formatDate, lightenHex, teamTint,
} from '../utils'
import { STATUS_CONFIG } from '../data'
import TaskCard from './TaskCard'
import Tooltip from './Tooltip'

export default function Timeline({
  teams, tracks, tasks, viewStart, numWeeks, weekWidth,
  scrollSignal, onTaskClick, onAddTask, onTeamClick, onTaskUpdate,
}) {
  const containerRef = useRef()
  const [drag, setDrag] = useState(null)
  const [pan,  setPan]  = useState(null)   // { startX, startScrollLeft }

  const today   = new Date()
  const weeks   = getVisibleWeeks(viewStart, numWeeks)
  const months  = getMonthGroups(weeks)
  const totalW  = LABEL_WIDTH + numWeeks * weekWidth
  const todayLeft = LABEL_WIDTH + (daysBetween(startOfWeek(new Date(viewStart)), today) / 7) * weekWidth
  const todayVisible = todayLeft >= LABEL_WIDTH && todayLeft <= totalW

  // ── Scroll-to-today on signal ─────────────────────────
  useEffect(() => {
    if (!scrollSignal) return
    const el = containerRef.current
    if (!el) return
    const offset = (daysBetween(startOfWeek(new Date(viewStart)), today) / 7) * weekWidth
    el.scrollLeft = Math.max(0, offset - el.clientWidth / 3)
  }, [scrollSignal]) // intentionally omitting other deps — only fires on signal

  // ── Track zones (content-space Y coords) ──────────────
  const trackZones = useMemo(() => {
    let y = HEADER_HEIGHT
    const zones = []
    for (const team of teams) {
      y += TEAM_HEADER_H
      for (const track of tracks.filter(t => t.teamId === team.id)) {
        const n = packTasksIntoRows(tasks.filter(t => t.trackId === track.id)).numRows
        const h = trackHeight(n)
        zones.push({ trackId: track.id, teamId: team.id, teamColor: team.color, y, height: h })
        y += h
      }
    }
    return zones
  }, [teams, tracks, tasks])

  // ── Coordinate helper ──────────────────────────────────
  const getPos = useCallback((clientX, clientY) => {
    const el = containerRef.current
    if (!el) return { x: 0, y: 0 }
    const rect = el.getBoundingClientRect()
    return {
      x: clientX - rect.left + el.scrollLeft,
      y: clientY - rect.top  + el.scrollTop,
    }
  }, [])

  // ── Start task drag ────────────────────────────────────
  const startDrag = useCallback((task, edge, clientX, clientY) => {
    setPan(null) // cancel any pan
    const { x, y } = getPos(clientX, clientY)
    setDrag({
      mode: 'pending',
      taskId: task.id,
      task: { ...task },
      edge,
      startX: x,
      startY: y,
      previewStart:   task.startDate,
      previewEnd:     task.endDate,
      previewTrackId: task.trackId,
    })
  }, [getPos])

  // ── Pan on empty timeline background ──────────────────
  const handleContainerMouseDown = (e) => {
    if (e.button !== 0) return
    if (drag) return
    const el = containerRef.current
    if (!el) return
    setPan({ startX: e.clientX, startScrollLeft: el.scrollLeft })
  }

  // ── Pan window listeners ───────────────────────────────
  useEffect(() => {
    if (!pan) return
    const onMove = (e) => {
      const el = containerRef.current
      if (!el) return
      el.scrollLeft = pan.startScrollLeft - (e.clientX - pan.startX)
    }
    const onUp = () => setPan(null)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',   onUp)
    }
  }, [pan])

  // ── Task drag window listeners ─────────────────────────
  useEffect(() => {
    if (!drag) return

    const onMove = (e) => {
      setDrag(prev => {
        if (!prev) return null
        const { x, y } = getPos(e.clientX, e.clientY)
        const dx = x - prev.startX

        if (prev.mode === 'pending') {
          if (Math.abs(x - prev.startX) < 4 && Math.abs(y - prev.startY) < 4) return prev
          return { ...prev, mode: prev.edge ? 'resizing' : 'moving' }
        }

        if (prev.mode === 'resizing') {
          const deltaDays = (dx / weekWidth) * 7
          const orig = prev.task
          let ns = orig.startDate, ne = orig.endDate
          if (prev.edge === 'left')  ns = formatDate(addDays(new Date(orig.startDate), Math.round(deltaDays)))
          if (prev.edge === 'right') ne = formatDate(addDays(new Date(orig.endDate),   Math.round(deltaDays)))
          if (new Date(ns) < new Date(ne)) return { ...prev, previewStart: ns, previewEnd: ne }
          return prev
        }

        if (prev.mode === 'moving') {
          const zone = trackZones.find(z => y >= z.y && y < z.y + z.height)
          const deltaDays = (dx / weekWidth) * 7
          const dur       = daysBetween(prev.task.startDate, prev.task.endDate)
          const ns        = formatDate(addDays(new Date(prev.task.startDate), Math.round(deltaDays)))
          const ne        = formatDate(addDays(new Date(ns), Math.round(dur)))
          return {
            ...prev,
            previewTrackId: zone ? zone.trackId : prev.previewTrackId,
            previewStart:   ns,
            previewEnd:     ne,
          }
        }
        return prev
      })
    }

    const onUp = () => {
      setDrag(prev => {
        if (!prev) return null
        if (prev.mode === 'pending') {
          onTaskClick(prev.task)
        } else {
          onTaskUpdate(prev.taskId, {
            startDate: prev.previewStart,
            endDate:   prev.previewEnd,
            trackId:   prev.previewTrackId,
          })
        }
        return null
      })
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',   onUp)
    }
  }, [drag, trackZones, weekWidth, getPos, onTaskClick, onTaskUpdate])

  // ── Ghost card during drag ─────────────────────────────
  const renderGhost = () => {
    if (!drag || drag.mode === 'pending') return null
    const ghostTask = { ...drag.task, startDate: drag.previewStart, endDate: drag.previewEnd }
    const trackId   = drag.mode === 'moving' ? drag.previewTrackId : drag.task.trackId
    const layout    = getTaskLayout(ghostTask, viewStart, weekWidth)
    const zone      = trackZones.find(z => z.trackId === trackId)
    if (!layout || !zone) return null

    return (
      <div style={{
        position: 'absolute',
        left: LABEL_WIDTH + layout.left + 2,
        top:  zone.y + TRACK_PADDING,
        width:  layout.width - 4,
        height: ROW_HEIGHT - 10,
        zIndex: 50,
        pointerEvents: 'none',
        borderRadius: 5,
        outline: `2px dashed ${zone.teamColor}`,
        outlineOffset: 1,
      }}>
        <TaskCard
          task={ghostTask}
          style={{ width: '100%', height: '100%', opacity: 0.75 }}
          isDragging
        />
      </div>
    )
  }

  // ── Cursor ────────────────────────────────────────────
  const cursor = drag && drag.mode !== 'pending'
    ? (drag.edge ? 'ew-resize' : 'grabbing')
    : pan ? 'grabbing' : 'grab'

  return (
    <div
      ref={containerRef}
      onMouseDown={handleContainerMouseDown}
      style={{
        width: '100%', height: '100%',
        overflowX: 'auto', overflowY: 'auto',
        position: 'relative',
        background: '#f8fafc',
        cursor,
        userSelect: 'none',
      }}
    >
      <div style={{ minWidth: totalW, position: 'relative' }}>

        {/* ── Today rule ─────────────────────────── */}
        {todayVisible && (
          <div style={{
            position: 'absolute',
            left: todayLeft, top: 0, bottom: 0,
            width: 2, background: '#3b82f6', opacity: 0.22,
            zIndex: 4, pointerEvents: 'none',
          }} />
        )}

        {/* ── Ghost card ─────────────────────────── */}
        {renderGhost()}

        {/* ══ TIME HEADER (sticky top) ═══════════════ */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 20,
          display: 'flex', borderBottom: '2px solid #e2e8f0', background: '#f8fafc',
        }}>
          {/* Corner */}
          <div style={{
            position: 'sticky', left: 0, width: LABEL_WIDTH, flexShrink: 0,
            background: '#f8fafc', zIndex: 25, borderRight: '2px solid #e2e8f0',
          }}>
            <div style={{ height: 26 }} />
            <div style={{
              height: 26, display: 'flex', alignItems: 'center',
              paddingLeft: 14, fontSize: 10, fontWeight: 700,
              color: '#94a3b8', letterSpacing: '0.8px',
              borderTop: '1px solid #e2e8f0',
            }}>
              TRACK / TEAM
            </div>
          </div>

          <div style={{ flex: 1 }}>
            {/* Month row */}
            <div style={{ display: 'flex', height: 26, borderBottom: '1px solid #e2e8f0' }}>
              {months.map((g, i) => (
                <div key={i} style={{
                  width: g.count * weekWidth, flexShrink: 0,
                  borderRight: '1px solid #e2e8f0',
                  padding: '0 10px', fontSize: 11, fontWeight: 700,
                  color: '#64748b', display: 'flex', alignItems: 'center',
                  textTransform: 'uppercase', letterSpacing: '0.5px',
                }}>
                  {g.label}
                </div>
              ))}
            </div>
            {/* Week row */}
            <div style={{ display: 'flex', height: 26 }}>
              {weeks.map((week, i) => {
                const isCurrent = week <= today && today < addDays(week, 7)
                return (
                  <div key={i} style={{
                    width: weekWidth, flexShrink: 0,
                    borderRight: '1px solid #f1f5f9',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10,
                    fontWeight: isCurrent ? 800 : 400,
                    color: isCurrent ? '#2563eb' : '#94a3b8',
                    background: isCurrent ? '#eff6ff' : 'transparent',
                    overflow: 'hidden',
                  }}>
                    {weekWidth >= 56 ? `${week.getDate()}/${week.getMonth() + 1}` : ''}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ══ TEAMS + TRACKS ═══════════════════════════ */}
        {teams.map(team => {
          const teamTracks = tracks.filter(t => t.teamId === team.id)

          return (
            <div key={team.id}>

              {/* Team header band */}
              <Tooltip label="Click to edit teams & tracks" placement="bottom">
              <div
                style={{ display: 'flex', height: TEAM_HEADER_H, cursor: 'pointer' }}
                onClick={() => onTeamClick?.(team.id)}
                onMouseDown={e => e.stopPropagation()} // don't start pan from team band
              >
                <div style={{
                  position: 'sticky', left: 0, width: LABEL_WIDTH, flexShrink: 0,
                  background: team.color, zIndex: 15,
                  display: 'flex', alignItems: 'center',
                  paddingLeft: 14, gap: 8,
                  borderRight: '1px solid rgba(255,255,255,0.2)',
                }}>
                  <span style={{
                    color: 'white', fontWeight: 700, fontSize: 12,
                    letterSpacing: '0.3px', textTransform: 'uppercase',
                  }}>
                    {team.name}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10 }}>✎</span>
                </div>
                <div style={{
                  flex: 1,
                  background: team.color + '18',
                  borderBottom: `1px solid ${team.color}40`,
                }} />
              </div>
              </Tooltip>

              {/* Tracks */}
              {teamTracks.map((track, trackIdx) => {
                const trackTasks = tasks.filter(t => t.trackId === track.id)
                const { taskRowMap, numRows } = packTasksIntoRows(trackTasks)
                const h          = trackHeight(numRows)
                const isDragOver = drag?.mode === 'moving' && drag.previewTrackId === track.id && drag.task.trackId !== track.id
                const trackBg    = isDragOver
                  ? teamTint(team.color, 0.12)
                  : lightenHex(team.color, 0.91)

                return (
                  <div key={track.id} style={{ display: 'flex', height: h }}>

                    {/* Sticky track label */}
                    <div
                      onMouseDown={e => e.stopPropagation()} // don't start pan from label
                      style={{
                        position: 'sticky', left: 0, width: LABEL_WIDTH, flexShrink: 0,
                        zIndex: 15, background: lightenHex(team.color, 0.94),
                        borderRight: '2px solid #e2e8f0',
                        borderBottom: '1px solid #e2e8f0',
                        display: 'flex', flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: '8px 10px 6px 14px',
                        cursor: 'default',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 3, height: 16, borderRadius: 2, background: team.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', lineHeight: 1.3 }}>
                          {track.name}
                        </span>
                      </div>
                      <Tooltip label={`Add a new task to ${track.name}`}>
                        <button
                          onClick={() => onAddTask(track.id)}
                          style={{
                            fontSize: 10, color: '#94a3b8', background: 'none',
                            border: 'none', cursor: 'pointer', padding: 0,
                            textAlign: 'left', fontFamily: 'inherit',
                          }}
                          onMouseEnter={e => e.target.style.color = team.color}
                          onMouseLeave={e => e.target.style.color = '#94a3b8'}
                        >
                          + add task
                        </button>
                      </Tooltip>
                    </div>

                    {/* Task area */}
                    <div style={{
                      flex: 1,
                      position: 'relative',
                      borderBottom: '1px solid #e2e8f0',
                      background: trackBg,
                      overflow: 'hidden',
                      outline: isDragOver ? `2px solid ${team.color}60` : 'none',
                      outlineOffset: '-2px',
                    }}>
                      {/* Week grid lines */}
                      {weeks.map((_, i) => (
                        <div key={i} style={{
                          position: 'absolute', left: i * weekWidth, top: 0, bottom: 0,
                          width: 1, background: '#f1f5f9', pointerEvents: 'none',
                        }} />
                      ))}

                      {/* Task cards */}
                      {trackTasks.map(task => {
                        const layout = getTaskLayout(task, viewStart, weekWidth)
                        if (!layout) return null
                        const rowIndex       = taskRowMap[task.id] || 0
                        const isBeingDragged = drag?.taskId === task.id && drag.mode !== 'pending'

                        return (
                          <TaskCard
                            key={task.id}
                            task={task}
                            style={{
                              position: 'absolute',
                              left:   layout.left + 2,
                              top:    TRACK_PADDING + rowIndex * ROW_HEIGHT,
                              width:  layout.width - 4,
                              height: ROW_HEIGHT - 10,
                              opacity: isBeingDragged ? 0.2 : 1,
                              transition: isBeingDragged ? 'none' : 'opacity 0.15s',
                            }}
                            onDragStart={startDrag}
                            onClick={() => {}}
                          />
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}

        <div style={{ height: 40 }} />
      </div>
    </div>
  )
}
