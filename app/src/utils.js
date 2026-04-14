export const WEEK_WIDTH    = 84   // px per week column
export const LABEL_WIDTH   = 210  // px for sticky track label column
export const ROW_HEIGHT    = 57   // px per task sub-row within a track (~30% thicker cards)
export const TRACK_PADDING = 7    // px top/bottom padding inside a track
export const HEADER_HEIGHT = 52   // sticky time header (2 × 26px rows)
export const TEAM_HEADER_H = 34   // team band height

// ── Colour helpers ──────────────────────────────────────────

// Lighten a hex colour toward white: amount 0 = unchanged, 1 = white
export const lightenHex = (hex, amount) => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const nr = Math.round(r + (255 - r) * amount)
  const ng = Math.round(g + (255 - g) * amount)
  const nb = Math.round(b + (255 - b) * amount)
  return `#${nr.toString(16).padStart(2,'0')}${ng.toString(16).padStart(2,'0')}${nb.toString(16).padStart(2,'0')}`
}

// Return rgba tint of a hex colour
export const teamTint = (hex, alpha = 0.10) => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

export const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export const addDays = (date, n) => {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

export const startOfWeek = (date) => {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay()) // Sunday start
  d.setHours(0, 0, 0, 0)
  return d
}

export const daysBetween = (a, b) =>
  (new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24)

export const formatDate = (d) => {
  const date = d instanceof Date ? d : new Date(d)
  return date.toISOString().split('T')[0]
}

// Returns array of Date objects, one per week, starting from startOfWeek(viewStart)
export const getVisibleWeeks = (viewStart, numWeeks) => {
  const weeks = []
  let cur = startOfWeek(new Date(viewStart))
  for (let i = 0; i < numWeeks; i++) {
    weeks.push(new Date(cur))
    cur = addDays(cur, 7)
  }
  return weeks
}

// Returns month header groups for the week array
export const getMonthGroups = (weeks) => {
  const groups = []
  let cur = null
  weeks.forEach((week, i) => {
    const m = week.getMonth(), y = week.getFullYear()
    if (!cur || cur.month !== m || cur.year !== y) {
      if (cur) groups.push(cur)
      cur = { month: m, year: y, label: `${MONTHS[m]} ${y}`, startCol: i, count: 1 }
    } else {
      cur.count++
    }
  })
  if (cur) groups.push(cur)
  return groups
}

// Computes left/width for a task card relative to the task area (not including label column)
// Returns null if task is entirely before the view start
export const getTaskLayout = (task, viewStart, weekWidth) => {
  const vs  = startOfWeek(new Date(viewStart))
  const ts  = new Date(task.startDate)
  const te  = new Date(task.endDate)

  if (te <= vs) return null // entirely before view

  const rawLeft  = (daysBetween(vs, ts) / 7) * weekWidth
  const rawRight = (daysBetween(vs, te) / 7) * weekWidth
  const left     = Math.max(0, rawLeft)
  const width    = Math.max(rawRight - left, 22)

  return { left, width, clipped: rawLeft < 0 }
}

// Greedy interval packing: assigns tasks to sub-rows to avoid visual overlap
// Returns { taskRowMap: { taskId -> rowIndex }, numRows }
export const packTasksIntoRows = (tasks) => {
  const sorted = [...tasks].sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
  const rows = []     // rows[i] = last task's endDate in that row
  const rowMap = {}

  for (const task of sorted) {
    let placed = false
    for (let i = 0; i < rows.length; i++) {
      if (new Date(task.startDate) >= new Date(rows[i])) {
        rows[i] = task.endDate
        rowMap[task.id] = i
        placed = true
        break
      }
    }
    if (!placed) {
      rowMap[task.id] = rows.length
      rows.push(task.endDate)
    }
  }

  return { taskRowMap: rowMap, numRows: Math.max(rows.length, 1) }
}

export const trackHeight = (numRows) =>
  numRows * ROW_HEIGHT + 2 * TRACK_PADDING
