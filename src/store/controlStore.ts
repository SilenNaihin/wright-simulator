import { create } from 'zustand'

interface ControlState {
  throttle: number    // 0 to 1
  elevator: number    // -1 to 1
  rudder: number      // -1 to 1
  wingWarp: number    // -1 to 1

  setThrottle: (value: number) => void
  setElevator: (value: number) => void
  setRudder: (value: number) => void
  setWingWarp: (value: number) => void
  resetControls: () => void
}

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value))

export const useControlStore = create<ControlState>((set) => ({
  throttle: 0,
  elevator: 0,
  rudder: 0,
  wingWarp: 0,

  setThrottle: (value) => set({ throttle: clamp(value, 0, 1) }),
  setElevator: (value) => set({ elevator: clamp(value, -1, 1) }),
  setRudder: (value) => set({ rudder: clamp(value, -1, 1) }),
  setWingWarp: (value) => set({ wingWarp: clamp(value, -1, 1) }),

  resetControls: () => set({
    throttle: 0,
    elevator: 0,
    rudder: 0,
    wingWarp: 0,
  }),
}))
