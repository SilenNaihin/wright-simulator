export interface DataPoint {
  time: number
  value: number
}

export interface ChartDataSeries {
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
}

export interface SimulationConfig {
  timeStep: number
  maxSimulationTime: number
  gravity: number
  airDensity: number
}
