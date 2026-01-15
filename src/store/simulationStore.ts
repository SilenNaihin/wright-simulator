import { create } from 'zustand'
import type { AircraftState, AircraftData } from '@/types/aircraft'
import { INITIAL_AIRCRAFT_STATE } from '@/config/aircraft.config'

// Wright Brothers first flight stats (Canonical flight)
export const WRIGHT_FIRST_FLIGHT = {
  duration: 12,        // seconds
  distance: 36.5,      // meters (120 feet)
  maxAltitude: 3,      // meters (~10 feet)
  groundSpeed: 3,      // m/s (~6.8 mph)
}

// Smooth interpolation helper
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t))
}

// Smooth step function for natural transitions
function smoothstep(t: number): number {
  t = Math.max(0, Math.min(1, t))
  return t * t * (3 - 2 * t)
}

// Get time-varying controls for canonical flight simulation
// Uses open-loop control tuned to match historical Wright Brothers first flight
// Historical data: 12s duration, 36.5m distance, ~3m max altitude
export function getCanonicalControls(
  time: number,
  _currentAltitude: number = 0.7,
  _verticalVelocity: number = 0
): {
  throttle: number
  elevator: number
  rudder: number
  wingWarp: number
} {
  const duration = 12
  const t = time / duration // Normalized time 0-1

  // Throttle curve - tuned for 36.5m in 12s
  let throttle: number
  if (t < 0.10) {
    throttle = 0.91  // Takeoff
  } else if (t < 0.25) {
    const u = smoothstep((t - 0.10) / 0.15)
    throttle = lerp(0.91, 0.835, u)
  } else if (t < 0.78) {
    throttle = 0.835  // Cruise
  } else {
    const u = smoothstep((t - 0.78) / 0.22)
    throttle = lerp(0.835, 0.58, u)
  }

  // Elevator profile - tuned for ~3m max altitude and landing at 12s
  let elevator: number
  if (t < 0.15) {
    // Takeoff - slight nose-up
    elevator = 0.02
  } else if (t < 0.30) {
    // Transition to cruise
    const u = smoothstep((t - 0.15) / 0.15)
    elevator = lerp(0.02, -0.019, u)
  } else if (t < 0.65) {
    // Cruise - nose-down to limit climb to ~3m
    elevator = -0.019
  } else {
    // Descent phase - land at ~12s
    const u = smoothstep((t - 0.65) / 0.35)
    elevator = lerp(-0.019, -0.065, u)
  }

  return {
    throttle: Math.max(0, Math.min(1, throttle)),
    elevator: Math.max(-1, Math.min(1, elevator)),
    rudder: 0,
    wingWarp: 0,
  }
}

interface SimulationState {
  // Simulation control
  isRunning: boolean
  isPaused: boolean
  simulationTime: number
  timeScale: number

  // Aircraft state
  aircraft: AircraftState

  // Computed data (for display)
  aircraftData: AircraftData

  // Energy/fuel system (0-100%)
  fuelRemaining: number
  maxFlightTime: number  // seconds of fuel

  // Canonical simulation mode (mimics Wright Brothers' first flight)
  isCanonicalMode: boolean
  canonicalControls: {
    throttle: number
    elevator: number
    rudder: number
    wingWarp: number
  }


  // Flight stats
  distanceTraveled: number
  maxAltitudeReached: number
  hasCrashed: boolean
  hasLanded: boolean

  // Actions
  start: () => void
  stop: () => void
  pause: () => void
  resume: () => void
  reset: () => void
  setTimeScale: (scale: number) => void
  updateAircraftState: (state: Partial<AircraftState>) => void
  updateAircraftData: (data: Partial<AircraftData>) => void
  incrementTime: (dt: number) => void
  consumeFuel: (amount: number) => void
  setCanonicalMode: (enabled: boolean) => void
  updateCanonicalControls: (time: number, altitude?: number, verticalVelocity?: number) => void
  updateFlightStats: (distance: number, altitude: number) => void
  setCrashed: (crashed: boolean) => void
  setLanded: (landed: boolean) => void
  startCanonicalSimulation: () => void
}

const initialAircraftData: AircraftData = {
  forces: { lift: 0, drag: 0, thrust: 0, weight: 3444 },
  moments: { pitch: 0, yaw: 0, roll: 0 },
  airspeed: 0,
  altitude: 0,
  angleOfAttack: 0,
  enginePower: 0,
  engineTorque: 0,
}

// Initial canonical controls (will be updated dynamically during flight)
const initialCanonicalControls = {
  throttle: 1.0,
  elevator: 0.3,
  rudder: 0,
  wingWarp: 0,
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  isRunning: false,
  isPaused: false,
  simulationTime: 0,
  timeScale: 1,
  aircraft: { ...INITIAL_AIRCRAFT_STATE },
  aircraftData: { ...initialAircraftData },
  fuelRemaining: 100,
  maxFlightTime: 60,  // 60 seconds of fuel (they had limited fuel)
  isCanonicalMode: false,
  canonicalControls: { ...initialCanonicalControls },
  distanceTraveled: 0,
  maxAltitudeReached: 0,
  hasCrashed: false,
  hasLanded: false,

  start: () => set({
    isRunning: true,
    isPaused: false,
    isCanonicalMode: false,
    hasCrashed: false,
    hasLanded: false,
  }),

  stop: () => set({
    isRunning: false,
    isPaused: false,
  }),

  pause: () => set({ isPaused: true }),

  resume: () => set({ isPaused: false }),

  reset: () => set({
    aircraft: {
      ...INITIAL_AIRCRAFT_STATE,
      velocity: { x: 0, y: 0, z: 0 },  // Start idle, not moving
    },
    aircraftData: { ...initialAircraftData },
    simulationTime: 0,
    isRunning: true,   // Simulation active
    isPaused: false,
    fuelRemaining: 100,
    distanceTraveled: 0,
    maxAltitudeReached: 0,
    hasCrashed: false,
    hasLanded: false,
    isCanonicalMode: false,
    canonicalControls: { ...initialCanonicalControls },
  }),

  setTimeScale: (scale) => set({ timeScale: scale }),

  updateAircraftState: (state) => set((prev) => ({
    aircraft: { ...prev.aircraft, ...state },
  })),

  updateAircraftData: (data) => set((prev) => ({
    aircraftData: { ...prev.aircraftData, ...data },
  })),

  incrementTime: (dt) => set((prev) => ({
    simulationTime: prev.simulationTime + dt,
  })),

  consumeFuel: (amount) => set((prev) => ({
    fuelRemaining: Math.max(0, prev.fuelRemaining - amount),
  })),

  setCanonicalMode: (enabled) => set({ isCanonicalMode: enabled }),

  updateCanonicalControls: (time, altitude = 0.7, verticalVelocity = 0) => set({
    canonicalControls: getCanonicalControls(time, altitude, verticalVelocity),
  }),

  updateFlightStats: (distance, altitude) => set((prev) => ({
    distanceTraveled: prev.distanceTraveled + distance,
    maxAltitudeReached: Math.max(prev.maxAltitudeReached, altitude),
  })),

  setCrashed: (crashed) => set({ hasCrashed: crashed, isRunning: !crashed }),

  setLanded: (landed) => set({ hasLanded: landed, isRunning: !landed, isPaused: landed }),

  startCanonicalSimulation: () => {
    const state = get()
    state.reset()
    // Override with full initial state including velocity (reset sets velocity to 0 for manual mode)
    set({
      aircraft: { ...INITIAL_AIRCRAFT_STATE }, // Restore initial velocity from launch rail
      isCanonicalMode: true,
      isRunning: true,
      isPaused: false,
      canonicalControls: getCanonicalControls(0),
    })
  },
}))
