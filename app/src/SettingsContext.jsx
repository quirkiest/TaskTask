import { createContext, useContext, useState } from 'react'

export const DEFAULT_SETTINGS = {
  priorityDisplay:   'stars',  // 'stars' | 'bars' | 'text' | 'hidden'
  sizeDisplay:       'bars',   // 'bars' | 'stars' | 'clock' | 'hidden'
  typeDisplay:       'stripe', // 'stripe' | 'badge' | 'dot' | 'hidden'
  indicatorPosition: 'right',  // 'left' | 'center' | 'right'
}

const SettingsContext = createContext({ settings: DEFAULT_SETTINGS, updateSettings: () => {} })

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const updateSettings = (patch) => setSettings(s => ({ ...s, ...patch }))
  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  return useContext(SettingsContext)
}
