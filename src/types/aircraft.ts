export interface Vector3 {
  x: number
  y: number
  z: number
}

export interface Quaternion {
  x: number
  y: number
  z: number
  w: number
}

export interface AircraftState {
  // Position in world space (meters)
  position: Vector3
  // Velocity in world space (m/s)
  velocity: Vector3
  // Orientation as quaternion
  orientation: Quaternion
  // Angular velocity (rad/s)
  angularVelocity: Vector3
  // Engine state
  engineRPM: number
  throttle: number // 0-1
}

export interface ControlInputs {
  throttle: number   // 0 to 1
  elevator: number   // -1 to 1
  rudder: number     // -1 to 1
  wingWarp: number   // -1 to 1
}

export interface Forces {
  lift: number
  drag: number
  thrust: number
  weight: number
}

export interface Moments {
  pitch: number
  yaw: number
  roll: number
}

export interface AircraftData {
  forces: Forces
  moments: Moments
  airspeed: number
  altitude: number
  angleOfAttack: number
  enginePower: number
  engineTorque: number
}
