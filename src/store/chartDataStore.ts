import { create } from 'zustand'
import type { DataPoint } from '@/types/simulation'
import { SIMULATION_CONSTANTS } from '@/config/aircraft.config'

interface ChartDataState {
  // Time series data for each metric
  lift: DataPoint[]
  drag: DataPoint[]
  thrust: DataPoint[]
  torque: DataPoint[]
  airspeed: DataPoint[]
  altitude: DataPoint[]
  enginePower: DataPoint[]
  engineRPM: DataPoint[]
  elevatorDeflection: DataPoint[]
  rudderDeflection: DataPoint[]
  warpDeflection: DataPoint[]

  // Actions
  addDataPoints: (time: number, data: {
    lift?: number
    drag?: number
    thrust?: number
    torque?: number
    airspeed?: number
    altitude?: number
    enginePower?: number
    engineRPM?: number
    elevatorDeflection?: number
    rudderDeflection?: number
    warpDeflection?: number
  }) => void
  clearData: () => void
}

const trimArray = (arr: DataPoint[], maxLength: number): DataPoint[] => {
  if (arr.length > maxLength) {
    return arr.slice(arr.length - maxLength)
  }
  return arr
}

export const useChartDataStore = create<ChartDataState>((set) => ({
  lift: [],
  drag: [],
  thrust: [],
  torque: [],
  airspeed: [],
  altitude: [],
  enginePower: [],
  engineRPM: [],
  elevatorDeflection: [],
  rudderDeflection: [],
  warpDeflection: [],

  addDataPoints: (time, data) => set((state) => {
    const maxPoints = SIMULATION_CONSTANTS.maxDataPoints
    const newState: Partial<ChartDataState> = {}

    if (data.lift !== undefined) {
      newState.lift = trimArray([...state.lift, { time, value: data.lift }], maxPoints)
    }
    if (data.drag !== undefined) {
      newState.drag = trimArray([...state.drag, { time, value: data.drag }], maxPoints)
    }
    if (data.thrust !== undefined) {
      newState.thrust = trimArray([...state.thrust, { time, value: data.thrust }], maxPoints)
    }
    if (data.torque !== undefined) {
      newState.torque = trimArray([...state.torque, { time, value: data.torque }], maxPoints)
    }
    if (data.airspeed !== undefined) {
      newState.airspeed = trimArray([...state.airspeed, { time, value: data.airspeed }], maxPoints)
    }
    if (data.altitude !== undefined) {
      newState.altitude = trimArray([...state.altitude, { time, value: data.altitude }], maxPoints)
    }
    if (data.enginePower !== undefined) {
      newState.enginePower = trimArray([...state.enginePower, { time, value: data.enginePower }], maxPoints)
    }
    if (data.engineRPM !== undefined) {
      newState.engineRPM = trimArray([...state.engineRPM, { time, value: data.engineRPM }], maxPoints)
    }
    if (data.elevatorDeflection !== undefined) {
      newState.elevatorDeflection = trimArray([...state.elevatorDeflection, { time, value: data.elevatorDeflection }], maxPoints)
    }
    if (data.rudderDeflection !== undefined) {
      newState.rudderDeflection = trimArray([...state.rudderDeflection, { time, value: data.rudderDeflection }], maxPoints)
    }
    if (data.warpDeflection !== undefined) {
      newState.warpDeflection = trimArray([...state.warpDeflection, { time, value: data.warpDeflection }], maxPoints)
    }

    return newState as ChartDataState
  }),

  clearData: () => set({
    lift: [],
    drag: [],
    thrust: [],
    torque: [],
    airspeed: [],
    altitude: [],
    enginePower: [],
    engineRPM: [],
    elevatorDeflection: [],
    rudderDeflection: [],
    warpDeflection: [],
  }),
}))
