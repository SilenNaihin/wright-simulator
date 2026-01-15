import { create } from 'zustand'
import type { AircraftState, AircraftData } from '@/types/aircraft'
import { INITIAL_AIRCRAFT_STATE, LAUNCH_RAIL_HEIGHT } from '@/config/aircraft.config'

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
// NOTE: These values are tuned for the browser physics (FlightDynamics.ts), not the test script
export function getCanonicalControls(
  time: number,
  _currentAltitude: number = LAUNCH_RAIL_HEIGHT,
  _verticalVelocity: number = 0
): {
  throttle: number
  elevator: number
  rudder: number
  wingWarp: number
} {
  const duration = 12
  const t = time / duration // Normalized time 0-1

  // Throttle curve - tuned for 36.5m distance in 12s
  // Maintains power through landing for elevator authority
  // Verified with test-canonical.mjs at ~34 FPS (browser effective framerate)
  let throttle: number
  if (t < 0.10) {
    throttle = 0.92  // Takeoff
  } else if (t < 0.25) {
    const u = smoothstep((t - 0.10) / 0.15)
    throttle = lerp(0.92, 0.87, u)
  } else if (t < 0.95) {
    throttle = 0.87  // Cruise through flare
  } else {
    const u = smoothstep((t - 0.95) / 0.05)
    throttle = lerp(0.87, 0.70, u)  // Slight reduction at touchdown
  }

  // Elevator profile - tuned for 3m max altitude from rail height (0.089m)
  // Historical: ~10 ft (3m) max altitude, smooth glide to land on sand at 12s
  // Features two-stage flare for smooth, level touchdown
  // Verified with test-canonical.mjs at ~34 FPS (browser effective framerate)
  let elevator: number
  if (t < 0.12) {
    elevator = 0.016  // Nose-up for takeoff
  } else if (t < 0.27) {
    const u = smoothstep((t - 0.12) / 0.15)
    elevator = lerp(0.016, -0.009, u)
  } else if (t < 0.50) {
    elevator = -0.009  // Slight nose-down for cruise (limit climb to ~3m)
  } else if (t < 0.64) {
    // Begin descent - gradual transition
    const u = smoothstep((t - 0.50) / 0.14)
    elevator = lerp(-0.009, -0.060, u)
  } else if (t < 0.70) {
    // Steady descent - nose-down
    elevator = -0.060
  } else if (t < 0.82) {
    // First flare - level out
    const u = smoothstep((t - 0.70) / 0.12)
    elevator = lerp(-0.060, 0.020, u)
  } else {
    // Final flare - strong nose-up for smooth landing
    const u = smoothstep((t - 0.82) / 0.18)
    elevator = lerp(0.020, 0.070, u)
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

  updateCanonicalControls: (time, altitude = LAUNCH_RAIL_HEIGHT, verticalVelocity = 0) => set({
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
