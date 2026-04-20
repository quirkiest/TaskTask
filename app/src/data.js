export const STATUS_CONFIG = {
  active:     { label: 'Active',       bg: '#dcfce7', border: '#16a34a', text: '#14532d' },
  atrisk:     { label: 'At Risk',      bg: '#fef9c3', border: '#ca8a04', text: '#713f12' },
  late:       { label: 'Late',         bg: '#fee2e2', border: '#dc2626', text: '#7f1d1d' },
  notstarted: { label: 'Not Started',  bg: '#f1f5f9', border: '#94a3b8', text: '#475569' },
  paused:     { label: 'Paused',       bg: '#ede9fe', border: '#7c3aed', text: '#3b0764' },
  done:       { label: 'Done',         bg: '#dbeafe', border: '#3b82f6', text: '#1e3a8a' },
}

export const PRIORITY_CONFIG = {
  VH: { label: 'VH', bg: '#fecaca', text: '#dc2626' },
  H:  { label: 'H',  bg: '#fed7aa', text: '#ea580c' },
  M:  { label: 'M',  bg: '#fef08a', text: '#a16207' },
  L:  { label: 'L',  bg: '#e2e8f0', text: '#64748b' },
}

export const MAGNITUDES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
export const STATUSES   = Object.keys(STATUS_CONFIG)
export const PRIORITIES = Object.keys(PRIORITY_CONFIG)
export const TYPES      = ['Support', 'Product', 'Solution', 'R&D', 'Infrastructure']

// Shared type display config — used by TaskCard and TaskModal
export const TYPE_CONFIG = {
  'Support':        { abbr: 'SUP', bg: '#dbeafe', color: '#1d4ed8' },
  'Product':        { abbr: 'PRD', bg: '#ede9fe', color: '#6d28d9' },
  'Solution':       { abbr: 'SOL', bg: '#dcfce7', color: '#15803d' },
  'R&D':            { abbr: 'R&D', bg: '#ffedd5', color: '#c2410c' },
  'Infrastructure': { abbr: 'INF', bg: '#f1f5f9', color: '#475569' },
}

// Helper to create a seed comment entry
const note = (text) => [{ id: '1', text, ts: new Date('2026-04-01T09:00:00').toISOString() }]

export const initialTeams = [
  { id: 'dev',  name: 'Dev Team',  color: '#2563eb' },
  { id: 'data', name: 'Data Team', color: '#7c3aed' },
]

export const initialTracks = [
  { id: 'dev-t1',  teamId: 'dev',  name: 'C-Station + Hubspot Support' },
  { id: 'dev-t2',  teamId: 'dev',  name: 'Product' },
  { id: 'dev-t3',  teamId: 'dev',  name: 'Solutions' },
  { id: 'data-t1', teamId: 'data', name: 'Data Support & Ad Hoc' },
  { id: 'data-t2', teamId: 'data', name: 'Nikkei' },
  { id: 'data-t3', teamId: 'data', name: 'IDR' },
]

// Tasks seeded from real spreadsheet data, dates shifted to current/near-future window
export const initialTasks = [
  {
    id: 'P22', trackId: 'dev-t1', name: 'CS Support & Enhancement',
    type: 'Support', status: 'active', priority: 'H', magnitude: 'XL',
    startDate: '2026-01-05', endDate: '2026-09-27',
    labels: ['ongoing'], percentComplete: 45,
    comments: note('Ongoing support track'), estimate: null, githubRef: 'multiple',
    history: [],
  },
  {
    id: 'P23', trackId: 'dev-t1', name: 'Hubspot Support',
    type: 'Support', status: 'active', priority: 'H', magnitude: 'XL',
    startDate: '2026-01-05', endDate: '2026-09-27',
    labels: ['ongoing', 'hubspot'], percentComplete: 30,
    comments: [], estimate: null, githubRef: 'multiple',
    history: [],
  },
  {
    id: 'P24', trackId: 'dev-t2', name: 'Codex IDR Core Engineering (Beta)',
    type: 'Solution', status: 'atrisk', priority: 'VH', magnitude: 'XL',
    startDate: '2026-02-02', endDate: '2026-06-28',
    labels: ['codex', 'idr'], percentComplete: 40,
    comments: note('At risk: scope has grown since kickoff'), estimate: null, githubRef: 'multiple',
    history: [],
  },
  {
    id: 'P04', trackId: 'dev-t2', name: 'New CS-UBO UX (TokyoGov)',
    type: 'Product', status: 'active', priority: 'H', magnitude: 'XL',
    startDate: '2026-04-06', endDate: '2026-07-26',
    labels: ['tokyogov', 'ux'], percentComplete: 20,
    comments: [], estimate: null, githubRef: 'n/a',
    history: [],
  },
  {
    id: 'P33', trackId: 'dev-t3', name: 'Mini AME Batch Utility',
    type: 'Product', status: 'active', priority: 'VH', magnitude: 'M',
    startDate: '2026-03-23', endDate: '2026-05-10',
    labels: ['fulfilment', 'urgent'], percentComplete: 60,
    comments: [], estimate: 15, githubRef: '230',
    history: [],
  },
  {
    id: 'P12', trackId: 'dev-t3', name: 'Replace AME in CS-UBO',
    type: 'Product', status: 'notstarted', priority: 'H', magnitude: 'XL',
    startDate: '2026-06-01', endDate: '2026-10-25',
    labels: ['codex', 'tokyogov'], percentComplete: 0,
    comments: note('Waiting for Codex IDR (P24)'), estimate: 100, githubRef: '654, 171',
    history: [],
  },
  {
    id: 'P26', trackId: 'dev-t3', name: 'Wire up APIs for Neg Data UI',
    type: 'Solution', status: 'paused', priority: 'H', magnitude: 'XL',
    startDate: '2026-05-11', endDate: '2026-08-09',
    labels: ['tokyogov', 'neg-data'], percentComplete: 25,
    comments: note('Paused pending TokyoGov sign-off'), estimate: null, githubRef: 'multiple',
    history: [],
  },
  {
    id: 'P03', trackId: 'data-t2', name: 'Nikkei Article Project',
    type: 'Product', status: 'active', priority: 'VH', magnitude: 'XL',
    startDate: '2026-02-16', endDate: '2026-07-12',
    labels: ['nikkei'], percentComplete: 55,
    comments: [], estimate: null, githubRef: 'multiple',
    history: [],
  },
  {
    id: 'P34', trackId: 'data-t2', name: 'Nikkei "Relationships" Sub-project',
    type: 'Product', status: 'active', priority: 'VH', magnitude: 'M',
    startDate: '2026-04-06', endDate: '2026-05-31',
    labels: ['nikkei', 'urgent'], percentComplete: 0,
    comments: [], estimate: 15, githubRef: '75',
    history: [],
  },
  {
    id: 'P08', trackId: 'data-t1', name: 'Pension Fund Search System',
    type: 'R&D', status: 'active', priority: 'H', magnitude: 'L',
    startDate: '2026-02-23', endDate: '2026-05-17',
    labels: [], percentComplete: 0,
    comments: note('R&D by data team'), estimate: 35, githubRef: '129',
    history: [],
  },
  {
    id: 'P14', trackId: 'data-t3', name: 'Codex IDR Mizuho Demo',
    type: 'Product', status: 'done', priority: 'M', magnitude: 'L',
    startDate: '2026-03-02', endDate: '2026-04-05',
    labels: ['codex', 'idr', 'mizuho'], percentComplete: 100,
    comments: note('Delivered on schedule'), estimate: null, githubRef: '139',
    history: [],
  },
  {
    id: 'P16', trackId: 'data-t1', name: 'Demo Data for Sales Team',
    type: 'Product', status: 'paused', priority: 'M', magnitude: 'L',
    startDate: '2026-05-18', endDate: '2026-07-26',
    labels: ['sales', 'synthetic'], percentComplete: 0,
    comments: [], estimate: null, githubRef: null,
    history: [],
  },
  {
    id: 'P31', trackId: 'data-t3', name: 'Batch ETC Display On-Screen',
    type: 'Product', status: 'notstarted', priority: 'L', magnitude: 'S',
    startDate: '2026-04-20', endDate: '2026-06-14',
    labels: [], percentComplete: 0,
    comments: note('Scheduled, not yet started'), estimate: null, githubRef: '346',
    history: [],
  },
]
