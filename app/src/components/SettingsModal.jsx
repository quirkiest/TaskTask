import { useSettings } from '../SettingsContext'

// ── Preview renderers ─────────────────────────────────────────────────────────

function PriorityStarsPreview() {
  return (
    <div style={{ display: 'flex', gap: 1, alignItems: 'center',
      background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.10)',
      borderRadius: 10, padding: '3px 6px',
    }}>
      {[1,2,3,4].map(i => (
        <span key={i} style={{ fontSize: 13, color: i <= 3 ? '#d97706' : '#dde3ec' }}>★</span>
      ))}
    </div>
  )
}

function PriorityBarsPreview() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', justifyContent: 'center' }}>
      {[4, 3, 2, 1].map(i => (
        <div key={i} style={{
          width: 18, height: 3, borderRadius: 1,
          background: i <= 3 ? '#ea580c' : '#dde3ec',
        }} />
      ))}
    </div>
  )
}

function SizeBarsPreview() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', justifyContent: 'center' }}>
      {[5, 4, 3, 2, 1].map(i => (
        <div key={i} style={{
          width: 18, height: 3, borderRadius: 1,
          background: i <= 3 ? '#64748b' : '#dde3ec',
        }} />
      ))}
    </div>
  )
}

function PriorityTextPreview() {
  return <span style={{ fontSize: 12, fontWeight: 800, color: '#ea580c' }}>High</span>
}

function SizeStarsPreview() {
  return (
    <div style={{ display: 'flex', gap: 1 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ fontSize: 13, color: i <= 3 ? '#f59e0b' : '#dde3ec' }}>★</span>
      ))}
    </div>
  )
}

function SizeClockPreview() {
  return (
    <div style={{ width: 20, height: 20, borderRadius: '50%', position: 'relative',
      background: 'conic-gradient(from -90deg, #64748b 60%, #dde3ec 60%)',
    }}>
      <div style={{ position: 'absolute', inset: 5, borderRadius: '50%', background: '#fff' }} />
    </div>
  )
}

function TypeStripePreview() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 3, height: 24, borderRadius: 2, background: '#6d28d9' }} />
      <span style={{ fontSize: 11, color: '#64748b' }}>Task name</span>
    </div>
  )
}

function TypeBadgePreview() {
  return (
    <span style={{
      fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 3,
      background: '#ede9fe', color: '#6d28d9', letterSpacing: '0.4px',
    }}>
      PRD
    </span>
  )
}

function TypeDotPreview() {
  return <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#6d28d9' }} />
}

function HiddenPreview() {
  return <span style={{ fontSize: 16, color: '#cbd5e1' }}>—</span>
}

function PosLeftPreview() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, width: 72, background: '#fafaf8', borderRadius: 4, padding: '3px 5px', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1.5, flexShrink: 0 }}>
        {[0,1,2,3].map(i => <div key={i} style={{ width: 9, height: 2.5, borderRadius: 1, background: i < 3 ? '#ea580c' : '#dde3ec' }} />)}
      </div>
      <div style={{ flex: 1, height: 5, borderRadius: 2, background: '#cbd5e1' }} />
    </div>
  )
}

function PosCenterPreview() {
  return (
    <div style={{ position: 'relative', width: 72, height: 22, background: '#fafaf8', borderRadius: 4, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {[0,1,2,3].map(i => <div key={i} style={{ width: 9, height: 2.5, borderRadius: 1, background: i < 3 ? '#ea580c' : '#dde3ec' }} />)}
      </div>
    </div>
  )
}

function PosRightPreview() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, width: 72, background: '#fafaf8', borderRadius: 4, padding: '3px 5px', border: '1px solid #e2e8f0' }}>
      <div style={{ flex: 1, height: 5, borderRadius: 2, background: '#cbd5e1' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1.5, flexShrink: 0 }}>
        {[0,1,2,3].map(i => <div key={i} style={{ width: 9, height: 2.5, borderRadius: 1, background: i < 3 ? '#ea580c' : '#dde3ec' }} />)}
      </div>
    </div>
  )
}

// ── Section config ────────────────────────────────────────────────────────────

const SECTIONS = [
  {
    key: 'priorityDisplay',
    label: 'Priority indicator',
    description: 'How priority is shown on timeline cards',
    options: [
      { value: 'stars',  label: 'Stars',  Preview: PriorityStarsPreview },
      { value: 'bars',   label: 'Bars',   Preview: PriorityBarsPreview },
      { value: 'text',   label: 'Text',   Preview: PriorityTextPreview },
      { value: 'hidden', label: 'Hidden', Preview: HiddenPreview },
    ],
  },
  {
    key: 'sizeDisplay',
    label: 'Size indicator',
    description: 'How task size is shown on timeline cards',
    options: [
      { value: 'bars',   label: 'Bars',   Preview: SizeBarsPreview },
      { value: 'stars',  label: 'Stars',  Preview: SizeStarsPreview },
      { value: 'clock',  label: 'Clock',  Preview: SizeClockPreview },
      { value: 'hidden', label: 'Hidden', Preview: HiddenPreview },
    ],
  },
  {
    key: 'typeDisplay',
    label: 'Type indicator',
    description: 'How task type is shown on timeline cards',
    options: [
      { value: 'stripe', label: 'Stripe', Preview: TypeStripePreview },
      { value: 'badge',  label: 'Badge',  Preview: TypeBadgePreview },
      { value: 'dot',    label: 'Dot',    Preview: TypeDotPreview },
      { value: 'hidden', label: 'Hidden', Preview: HiddenPreview },
    ],
  },
  {
    key: 'indicatorPosition',
    label: 'Indicator position',
    description: 'Where icons appear on timeline task bars',
    options: [
      { value: 'left',   label: 'Left',   Preview: PosLeftPreview },
      { value: 'center', label: 'Centre', Preview: PosCenterPreview },
      { value: 'right',  label: 'Right',  Preview: PosRightPreview },
    ],
  },
]

// ── Modal ─────────────────────────────────────────────────────────────────────

export default function SettingsModal({ onClose }) {
  const { settings, updateSettings } = useSettings()

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff', borderRadius: 12, width: 500,
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)', overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Display Settings</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              Customise how metrics appear on timeline cards
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: 20, cursor: 'pointer',
            color: '#94a3b8', padding: '2px 6px', lineHeight: 1, borderRadius: 4,
          }}>×</button>
        </div>

        {/* Sections */}
        <div style={{ padding: '8px 20px 24px' }}>
          {SECTIONS.map(section => (
            <div key={section.key} style={{ marginTop: 20 }}>
              <div style={{
                fontSize: 11, fontWeight: 700, color: '#374151',
                marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.5px',
              }}>
                {section.label}
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8 }}>
                {section.description}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {section.options.map(({ value, label, Preview }) => {
                  const active = settings[section.key] === value
                  return (
                    <button
                      key={value}
                      onClick={() => updateSettings({ [section.key]: value })}
                      style={{
                        flex: 1, padding: '12px 8px', borderRadius: 8, cursor: 'pointer',
                        border: active ? '2px solid #3b82f6' : '2px solid #e2e8f0',
                        background: active ? '#eff6ff' : '#f8fafc',
                        fontFamily: 'inherit', transition: 'border-color 0.1s, background 0.1s',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', gap: 8,
                      }}
                    >
                      <div style={{ height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Preview />
                      </div>
                      <div style={{
                        fontSize: 11, fontWeight: 600,
                        color: active ? '#2563eb' : '#374151',
                      }}>
                        {label}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
