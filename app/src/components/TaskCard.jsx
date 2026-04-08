import { STATUS_CONFIG, PRIORITY_CONFIG } from '../data'

export default function TaskCard({ task, style, onClick }) {
  const sc = STATUS_CONFIG[task.status] || STATUS_CONFIG.notstarted
  const pc = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.M

  return (
    <div
      onClick={onClick}
      title={`${task.name}  |  ${sc.label}  |  ${task.priority} priority  |  ${task.magnitude}`}
      style={{
        ...style,
        background: sc.bg,
        borderLeft: `3px solid ${sc.border}`,
        borderRadius: 5,
        padding: '0 7px 0 6px',
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        cursor: 'pointer',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        transition: 'box-shadow 0.12s, transform 0.12s',
        userSelect: 'none',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 3px 10px rgba(0,0,0,0.15)'
        e.currentTarget.style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Priority chip */}
      <span style={{
        flexShrink: 0,
        fontSize: 9,
        fontWeight: 700,
        padding: '1px 4px',
        borderRadius: 3,
        background: pc.bg,
        color: pc.text,
        letterSpacing: '0.3px',
      }}>
        {task.priority}
      </span>

      {/* Task name */}
      <span style={{
        fontSize: 11,
        fontWeight: 500,
        color: sc.text,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        flex: 1,
        minWidth: 0,
      }}>
        {task.name}
      </span>

      {/* Progress bar (only if nonzero) */}
      {task.percentComplete > 0 && (
        <div style={{
          flexShrink: 0,
          width: 30,
          height: 4,
          borderRadius: 2,
          background: sc.border + '30',
        }}>
          <div style={{
            height: '100%',
            width: `${task.percentComplete}%`,
            background: sc.border,
            borderRadius: 2,
          }} />
        </div>
      )}

      {/* Magnitude dot (right edge) */}
      <span style={{
        flexShrink: 0,
        fontSize: 9,
        color: sc.border,
        fontWeight: 600,
      }}>
        {task.magnitude}
      </span>
    </div>
  )
}
