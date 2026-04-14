import { TYPE_CONFIG } from '../data'
import { useSettings } from '../SettingsContext'
import Tooltip from './Tooltip'

// ── Priority: coloured stacked bars (retained as alt option) ──────────────────
const PRIORITY_BAR_COLOR = { L: '#16a34a', M: '#ca8a04', H: '#ea580c', VH: '#dc2626' }
const PRIORITY_COUNT     = { L: 1, M: 2, H: 3, VH: 4 }
const PRIORITY_LABEL     = { L: 'Low', M: 'Med', H: 'High', VH: 'Urgent' }
const PRIORITY_FULL      = { L: 'Low', M: 'Medium', H: 'High', VH: 'Very High' }

function PriorityBars({ priority }) {
  const count = PRIORITY_COUNT[priority] ?? 2
  const color = PRIORITY_BAR_COLOR[priority] ?? '#ca8a04'
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 2,
      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      {[4, 3, 2, 1].map(i => (
        <div key={i} style={{
          width: 13, height: 3, borderRadius: 1,
          background: i <= count ? color : '#dde3ec',
        }} />
      ))}
    </div>
  )
}

function PriorityText({ priority }) {
  const color = PRIORITY_BAR_COLOR[priority] ?? '#ca8a04'
  const label = PRIORITY_LABEL[priority] ?? 'Med'
  return (
    <span style={{ fontSize: 9, fontWeight: 800, color, flexShrink: 0, letterSpacing: '0.3px' }}>
      {label}
    </span>
  )
}

// ── Priority: gold stars in cartouche (DEFAULT) ────────────────────────────────
// L=1★  M=2★  H=3★  VH=4★  (4-star scale)
const PRIORITY_STAR_COUNT = { L: 1, M: 2, H: 3, VH: 4 }

function PriorityStars({ priority }) {
  const count = PRIORITY_STAR_COUNT[priority] ?? 2
  return (
    <div style={{
      display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0,
      background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.10)',
      borderRadius: 10, padding: '2px 5px',
    }}>
      {[1, 2, 3, 4].map(i => (
        <span key={i} style={{ fontSize: 10, lineHeight: 1, color: i <= count ? '#d97706' : '#d1d5db' }}>★</span>
      ))}
    </div>
  )
}

// ── Size: charcoal stacked bars (DEFAULT) ─────────────────────────────────────
// XS=1  S=2  M=3  L=4  XL=5  — uniform charcoal (scale, not urgency)
const SIZE_BAR_COUNT = { XS: 1, S: 2, M: 3, L: 4, XL: 5 }

function SizeBars({ magnitude }) {
  const count = SIZE_BAR_COUNT[magnitude] ?? 3
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 2,
      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      {[5, 4, 3, 2, 1].map(i => (
        <div key={i} style={{
          width: 13, height: 3, borderRadius: 1,
          background: i <= count ? '#64748b' : '#dde3ec',
        }} />
      ))}
    </div>
  )
}

// ── Size: gold stars in cartouche (alt option) ────────────────────────────────
// XS=1★ … XL=5★
const SIZE_STAR_COUNT = { XS: 1, S: 2, M: 3, L: 4, XL: 5 }

function SizeStars({ magnitude }) {
  const count = SIZE_STAR_COUNT[magnitude] ?? 3
  return (
    <div style={{
      display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0,
      background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.10)',
      borderRadius: 10, padding: '2px 5px',
    }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ fontSize: 10, lineHeight: 1, color: i <= count ? '#d97706' : '#d1d5db' }}>★</span>
      ))}
    </div>
  )
}

// ── Size: clock-face pie (alt option) ─────────────────────────────────────────
const SIZE_PCT = { XS: 20, S: 40, M: 60, L: 80, XL: 100 }

function SizeClock({ magnitude }) {
  const pct = SIZE_PCT[magnitude] ?? 60
  return (
    <div style={{
      width: 16, height: 16, borderRadius: '50%',
      background: `conic-gradient(from -90deg, #64748b ${pct}%, #dde3ec ${pct}%)`,
      flexShrink: 0, position: 'relative',
    }}>
      <div style={{ position: 'absolute', inset: 4, borderRadius: '50%', background: '#fff' }} />
    </div>
  )
}

// ── Card ───────────────────────────────────────────────────────────────────────
export default function TaskCard({ task, style, onDragStart, isDragging }) {
  const { settings } = useSettings()
  const tc  = TYPE_CONFIG[task.type] || TYPE_CONFIG['Product']
  const pos = settings.indicatorPosition ?? 'right'

  const handleBodyDown = (e) => {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    onDragStart?.(task, null, e.clientX, e.clientY)
  }

  const handleEdgeDown = (edge) => (e) => {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    onDragStart?.(task, edge, e.clientX, e.clientY)
  }

  // ── Indicator cluster ────────────────────────────────────────────────────────
  const indicators = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>

      {/* Type */}
      {settings.typeDisplay === 'dot' && (
        <Tooltip label={`Type: ${task.type}`}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: tc.color }} />
        </Tooltip>
      )}
      {settings.typeDisplay === 'badge' && (
        <Tooltip label={`Type: ${task.type}`}>
          <span style={{
            fontSize: 9, fontWeight: 800, padding: '2px 5px', borderRadius: 3,
            background: tc.bg, color: tc.color,
            letterSpacing: '0.4px', textTransform: 'uppercase',
          }}>
            {tc.abbr}
          </span>
        </Tooltip>
      )}

      {/* Priority */}
      {settings.priorityDisplay === 'stars' && (
        <Tooltip label={`Priority: ${PRIORITY_FULL[task.priority] ?? task.priority}`}>
          <PriorityStars priority={task.priority} />
        </Tooltip>
      )}
      {settings.priorityDisplay === 'bars' && (
        <Tooltip label={`Priority: ${PRIORITY_FULL[task.priority] ?? task.priority}`}>
          <PriorityBars priority={task.priority} />
        </Tooltip>
      )}
      {settings.priorityDisplay === 'text' && (
        <Tooltip label={`Priority: ${PRIORITY_FULL[task.priority] ?? task.priority}`}>
          <PriorityText priority={task.priority} />
        </Tooltip>
      )}

      {/* Size */}
      {settings.sizeDisplay === 'bars' && (
        <Tooltip label={`Size: ${task.magnitude}`}>
          <SizeBars magnitude={task.magnitude} />
        </Tooltip>
      )}
      {settings.sizeDisplay === 'stars' && (
        <Tooltip label={`Size: ${task.magnitude}`}>
          <SizeStars magnitude={task.magnitude} />
        </Tooltip>
      )}
      {settings.sizeDisplay === 'clock' && (
        <Tooltip label={`Size: ${task.magnitude}`}>
          <SizeClock magnitude={task.magnitude} />
        </Tooltip>
      )}

    </div>
  )

  return (
    <div style={{
      ...style,
      background: '#fafaf8',
      borderRadius: 5,
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
      border: '1px solid rgba(0,0,0,0.13)',
      boxShadow: isDragging ? 'none' : '0 2px 6px rgba(0,0,0,0.14)',
      userSelect: 'none',
      position: style?.position ?? 'relative',
      cursor: isDragging ? 'grabbing' : 'grab',
      opacity: isDragging ? 0.9 : 1,
      borderLeft: settings.typeDisplay === 'stripe' ? `3px solid ${tc.color}` : undefined,
    }}>

      {/* Left resize handle */}
      <div
        onMouseDown={handleEdgeDown('left')}
        style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 7,
          cursor: 'ew-resize', zIndex: 2, borderRadius: '5px 0 0 5px',
        }}
      />

      {/* Body */}
      <div
        onMouseDown={handleBodyDown}
        style={{
          flex: 1, display: 'flex', alignItems: 'center',
          padding: '0 24px 0 10px', gap: 6,
          minWidth: 0, height: '100%', overflow: 'hidden',
          position: 'relative',
        }}
      >
        {pos === 'left' && indicators}

        <span style={{
          flex: pos === 'center' ? undefined : 1,
          minWidth: 0,
          fontSize: 11, fontWeight: 600, color: '#1e293b',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {task.name}
        </span>

        {pos === 'right' && indicators}

        {pos === 'center' && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            {indicators}
          </div>
        )}
      </div>

      {/* Right resize handle */}
      <div
        onMouseDown={handleEdgeDown('right')}
        style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: 7,
          cursor: 'ew-resize', zIndex: 2, borderRadius: '0 5px 5px 0',
        }}
      />
    </div>
  )
}
