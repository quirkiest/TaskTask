import {
  WEEK_WIDTH, LABEL_WIDTH, ROW_HEIGHT, TRACK_PADDING,
  getVisibleWeeks, getMonthGroups, packTasksIntoRows,
  getTaskLayout, trackHeight, addDays, startOfWeek, daysBetween,
} from '../utils'
import TaskCard from './TaskCard'

const TEAM_HEADER_H = 34

export default function Timeline({ teams, tracks, tasks, viewStart, numWeeks, onTaskClick, onAddTask }) {
  const weeks     = getVisibleWeeks(viewStart, numWeeks)
  const months    = getMonthGroups(weeks)
  const totalW    = LABEL_WIDTH + numWeeks * WEEK_WIDTH
  const today     = new Date()
  const todayLeft = LABEL_WIDTH + (daysBetween(startOfWeek(new Date(viewStart)), today) / 7) * WEEK_WIDTH
  const todayVisible = todayLeft >= LABEL_WIDTH && todayLeft <= totalW

  return (
    <div style={{ width: '100%', height: '100%', overflowX: 'auto', overflowY: 'auto', position: 'relative', background: '#f8fafc' }}>
      <div style={{ minWidth: totalW, position: 'relative' }}>

        {/* ── Today vertical rule ── */}
        {todayVisible && (
          <div style={{
            position: 'absolute',
            left: todayLeft,
            top: 0,
            bottom: 0,
            width: 2,
            background: '#3b82f6',
            opacity: 0.25,
            zIndex: 4,
            pointerEvents: 'none',
          }} />
        )}

        {/* ══════════════════════════════════════
            TIME HEADER  (sticky top)
        ══════════════════════════════════════ */}
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          display: 'flex',
          borderBottom: '2px solid #e2e8f0',
          background: '#f8fafc',
        }}>
          {/* Corner */}
          <div style={{
            position: 'sticky',
            left: 0,
            width: LABEL_WIDTH,
            flexShrink: 0,
            background: '#f8fafc',
            zIndex: 25,
            borderRight: '2px solid #e2e8f0',
          }}>
            {/* Month row spacer */}
            <div style={{ height: 26 }} />
            {/* Week row — label */}
            <div style={{
              height: 26,
              display: 'flex',
              alignItems: 'center',
              paddingLeft: 14,
              fontSize: 10,
              fontWeight: 700,
              color: '#94a3b8',
              letterSpacing: '0.8px',
              borderTop: '1px solid #e2e8f0',
            }}>
              TRACK / TEAM
            </div>
          </div>

          {/* Month + week columns */}
          <div style={{ flex: 1 }}>
            {/* Month row */}
            <div style={{ display: 'flex', height: 26, borderBottom: '1px solid #e2e8f0' }}>
              {months.map((g, i) => (
                <div key={i} style={{
                  width: g.count * WEEK_WIDTH,
                  flexShrink: 0,
                  borderRight: '1px solid #e2e8f0',
                  padding: '0 10px',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
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
                    width: WEEK_WIDTH,
                    flexShrink: 0,
                    borderRight: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    fontWeight: isCurrent ? 800 : 400,
                    color: isCurrent ? '#2563eb' : '#94a3b8',
                    background: isCurrent ? '#eff6ff' : 'transparent',
                  }}>
                    {week.getDate()}/{week.getMonth() + 1}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════
            TEAMS + TRACKS
        ══════════════════════════════════════ */}
        {teams.map(team => {
          const teamTracks = tracks.filter(t => t.teamId === team.id)

          return (
            <div key={team.id}>

              {/* Team header row */}
              <div style={{ display: 'flex', height: TEAM_HEADER_H }}>
                {/* Sticky label */}
                <div style={{
                  position: 'sticky',
                  left: 0,
                  width: LABEL_WIDTH,
                  flexShrink: 0,
                  background: team.color,
                  zIndex: 15,
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: 14,
                  borderRight: '1px solid rgba(255,255,255,0.25)',
                  gap: 8,
                }}>
                  <span style={{
                    color: 'white',
                    fontWeight: 700,
                    fontSize: 12,
                    letterSpacing: '0.3px',
                    textTransform: 'uppercase',
                  }}>
                    {team.name}
                  </span>
                </div>
                {/* Header band */}
                <div style={{
                  flex: 1,
                  background: team.color + '18',
                  borderBottom: `1px solid ${team.color}40`,
                }} />
              </div>

              {/* Track rows */}
              {teamTracks.map((track, trackIdx) => {
                const trackTasks = tasks.filter(t => t.trackId === track.id)
                const { taskRowMap, numRows } = packTasksIntoRows(trackTasks)
                const h = trackHeight(numRows)

                return (
                  <div key={track.id} style={{ display: 'flex', height: h }}>

                    {/* Sticky track label */}
                    <div style={{
                      position: 'sticky',
                      left: 0,
                      width: LABEL_WIDTH,
                      flexShrink: 0,
                      zIndex: 15,
                      background: '#f8fafc',
                      borderRight: '2px solid #e2e8f0',
                      borderBottom: '1px solid #e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      padding: '8px 10px 6px 14px',
                    }}>
                      <span style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#1e293b',
                        lineHeight: 1.3,
                      }}>
                        {track.name}
                      </span>
                      <button
                        onClick={() => onAddTask(track.id)}
                        style={{
                          fontSize: 10,
                          color: '#94a3b8',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0,
                          textAlign: 'left',
                          fontFamily: 'inherit',
                        }}
                        onMouseEnter={e => e.target.style.color = team.color}
                        onMouseLeave={e => e.target.style.color = '#94a3b8'}
                      >
                        + add task
                      </button>
                    </div>

                    {/* Task area */}
                    <div style={{
                      flex: 1,
                      position: 'relative',
                      borderBottom: '1px solid #e2e8f0',
                      background: trackIdx % 2 === 0 ? '#ffffff' : '#fafafa',
                      overflow: 'hidden',
                    }}>
                      {/* Week grid lines */}
                      {weeks.map((_, i) => (
                        <div key={i} style={{
                          position: 'absolute',
                          left: i * WEEK_WIDTH,
                          top: 0,
                          bottom: 0,
                          width: 1,
                          background: '#f1f5f9',
                          pointerEvents: 'none',
                        }} />
                      ))}

                      {/* Task cards */}
                      {trackTasks.map(task => {
                        const layout = getTaskLayout(task, viewStart, WEEK_WIDTH)
                        if (!layout) return null

                        const rowIndex = taskRowMap[task.id] || 0
                        const top  = TRACK_PADDING + rowIndex * ROW_HEIGHT
                        const cardH = ROW_HEIGHT - 10

                        return (
                          <TaskCard
                            key={task.id}
                            task={task}
                            style={{
                              position: 'absolute',
                              left: layout.left + 2,
                              top,
                              width: layout.width - 4,
                              height: cardH,
                            }}
                            onClick={() => onTaskClick(task)}
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

        {/* Bottom padding */}
        <div style={{ height: 40 }} />
      </div>
    </div>
  )
}
