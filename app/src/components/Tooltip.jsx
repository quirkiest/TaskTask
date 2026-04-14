import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

/**
 * Tooltip — renders into document.body via a portal so it escapes
 * overflow:hidden containers (e.g. task bar cards on the timeline).
 *
 * Usage:
 *   <Tooltip label="Descriptive text">
 *     <button>…</button>
 *   </Tooltip>
 *
 * Props:
 *   label      — string shown in the tooltip
 *   placement  — 'top' (default) | 'bottom'
 *   delay      — ms before tooltip appears (default 320)
 */
export default function Tooltip({ label, children, placement = 'top', delay = 320 }) {
  const [visible, setVisible] = useState(false)
  const [coords,  setCoords]  = useState({ x: 0, y: 0 })
  const ref     = useRef(null)
  const timerRef = useRef(null)

  const show = () => {
    timerRef.current = setTimeout(() => {
      if (ref.current) {
        const r = ref.current.getBoundingClientRect()
        setCoords({
          x: r.left + r.width  / 2,
          y: placement === 'top' ? r.top : r.bottom,
        })
      }
      setVisible(true)
    }, delay)
  }

  const hide = () => {
    clearTimeout(timerRef.current)
    setVisible(false)
  }

  // Clean up timer on unmount
  useEffect(() => () => clearTimeout(timerRef.current), [])

  const bubble = (
    <div
      style={{
        position: 'fixed',
        left: coords.x,
        top:  placement === 'top' ? coords.y - 8 : coords.y + 8,
        transform: placement === 'top'
          ? 'translate(-50%, -100%)'
          : 'translate(-50%, 0)',
        background:    '#1e293b',
        color:         '#f1f5f9',
        fontSize:      11,
        fontWeight:    500,
        lineHeight:    1.35,
        padding:       '5px 9px',
        borderRadius:  6,
        whiteSpace:    'nowrap',
        zIndex:        9999,
        pointerEvents: 'none',
        boxShadow:     '0 3px 10px rgba(0,0,0,0.28)',
        letterSpacing: '0.15px',
      }}
    >
      {label}
      {/* Arrow */}
      <div style={{
        position:  'absolute',
        left:      '50%',
        transform: 'translateX(-50%)',
        width: 0, height: 0,
        ...(placement === 'top'
          ? {
              bottom: -4,
              borderLeft:  '4px solid transparent',
              borderRight: '4px solid transparent',
              borderTop:   '4px solid #1e293b',
            }
          : {
              top: -4,
              borderLeft:   '4px solid transparent',
              borderRight:  '4px solid transparent',
              borderBottom: '4px solid #1e293b',
            }),
      }} />
    </div>
  )

  return (
    <>
      <span
        ref={ref}
        onMouseEnter={show}
        onMouseLeave={hide}
        style={{ display: 'inline-flex', alignItems: 'center' }}
      >
        {children}
      </span>
      {visible && createPortal(bubble, document.body)}
    </>
  )
}
