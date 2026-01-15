import { create } from 'zustand'

export type CameraMode = 'third-person' | 'first-person'

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

  // Camera mode
  cameraMode: CameraMode

  // Article panel
  isArticleOpen: boolean

  // Modal states
  isDataLogModalOpen: boolean
  isAnalysisModeActive: boolean
  isHelpModalOpen: boolean

  // Actions
  toggleLeftPanel: (panel: keyof UIState['leftPanels']) => void
  toggleRightPanel: (panel: keyof UIState['rightPanels']) => void
  setCameraMode: (mode: CameraMode) => void
  cycleCameraMode: () => void
  toggleArticle: () => void
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

const cameraModes: CameraMode[] = ['third-person', 'first-person']

export const useUIStore = create<UIState>((set, get) => ({
  leftPanels: { ...defaultLeftPanels },
  rightPanels: { ...defaultRightPanels },
  cameraMode: 'third-person',
  isArticleOpen: false,
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

  setCameraMode: (mode) => set({ cameraMode: mode }),

  cycleCameraMode: () => {
    const current = get().cameraMode
    const currentIndex = cameraModes.indexOf(current)
    const nextIndex = (currentIndex + 1) % cameraModes.length
    set({ cameraMode: cameraModes[nextIndex] })
  },

  toggleArticle: () => set((state) => ({ isArticleOpen: !state.isArticleOpen })),

  setDataLogModalOpen: (open) => set({ isDataLogModalOpen: open }),
  setAnalysisModeActive: (active) => set({ isAnalysisModeActive: active }),
  setHelpModalOpen: (open) => set({ isHelpModalOpen: open }),

  resetPanels: () => set({
    leftPanels: { ...defaultLeftPanels },
    rightPanels: { ...defaultRightPanels },
  }),
}))
