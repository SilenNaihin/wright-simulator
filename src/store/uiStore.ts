import { create } from 'zustand'

interface PanelVisibility {
  liftDrag: boolean
  enginePower: boolean
  airspeedAltitudeLeft: boolean
  airspeedAltitudeRight: boolean
  thrustTorque: boolean
  controlSurface: boolean
}

interface UIState {
  // Panel visibility
  leftPanels: Pick<PanelVisibility, 'liftDrag' | 'enginePower' | 'airspeedAltitudeLeft'>
  rightPanels: Pick<PanelVisibility, 'airspeedAltitudeRight' | 'thrustTorque' | 'controlSurface'>

  // Modal states
  isDataLogModalOpen: boolean
  isAnalysisModeActive: boolean
  isHelpModalOpen: boolean

  // Actions
  toggleLeftPanel: (panel: keyof UIState['leftPanels']) => void
  toggleRightPanel: (panel: keyof UIState['rightPanels']) => void
  setDataLogModalOpen: (open: boolean) => void
  setAnalysisModeActive: (active: boolean) => void
  setHelpModalOpen: (open: boolean) => void
  resetPanels: () => void
}

const defaultLeftPanels = {
  liftDrag: true,
  enginePower: true,
  airspeedAltitudeLeft: true,
}

const defaultRightPanels = {
  airspeedAltitudeRight: true,
  thrustTorque: true,
  controlSurface: true,
}

export const useUIStore = create<UIState>((set) => ({
  leftPanels: { ...defaultLeftPanels },
  rightPanels: { ...defaultRightPanels },
  isDataLogModalOpen: false,
  isAnalysisModeActive: false,
  isHelpModalOpen: false,

  toggleLeftPanel: (panel) => set((state) => ({
    leftPanels: {
      ...state.leftPanels,
      [panel]: !state.leftPanels[panel],
    },
  })),

  toggleRightPanel: (panel) => set((state) => ({
    rightPanels: {
      ...state.rightPanels,
      [panel]: !state.rightPanels[panel],
    },
  })),

  setDataLogModalOpen: (open) => set({ isDataLogModalOpen: open }),
  setAnalysisModeActive: (active) => set({ isAnalysisModeActive: active }),
  setHelpModalOpen: (open) => set({ isHelpModalOpen: open }),

  resetPanels: () => set({
    leftPanels: { ...defaultLeftPanels },
    rightPanels: { ...defaultRightPanels },
  }),
}))
