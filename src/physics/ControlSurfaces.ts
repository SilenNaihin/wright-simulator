import { WRIGHT_FLYER_SPECS } from '@/config/aircraft.config'
import { PHYSICS } from './constants'

export class ControlSurfaces {
  /**
   * Calculate pitching moment from elevator deflection
   * The Wright Flyer used a front canard for pitch control
   */
  calculatePitchMoment(
    elevatorDeflection: number, // -1 to 1
    velocity: number,
    airDensity: number = PHYSICS.AIR_DENSITY_SEA_LEVEL
  ): number {
    if (velocity < 0.5) return 0

    const deflectionRad = elevatorDeflection * WRIGHT_FLYER_SPECS.maxElevatorDeflection
    const dynamicPressure = 0.5 * airDensity * velocity * velocity
    const effectiveness = WRIGHT_FLYER_SPECS.elevatorEffectiveness
    const area = WRIGHT_FLYER_SPECS.elevatorArea

    // Moment = q × S × effectiveness × deflection × moment arm
    const momentArm = WRIGHT_FLYER_SPECS.cgPosition // Distance from CG to elevator
    return dynamicPressure * area * effectiveness * deflectionRad * momentArm
  }

  /**
   * Calculate yawing moment from rudder deflection
   */
  calculateYawMoment(
    rudderDeflection: number, // -1 to 1
    velocity: number,
    airDensity: number = PHYSICS.AIR_DENSITY_SEA_LEVEL
  ): number {
    if (velocity < 0.5) return 0

    const deflectionRad = rudderDeflection * WRIGHT_FLYER_SPECS.maxRudderDeflection
    const dynamicPressure = 0.5 * airDensity * velocity * velocity
    const effectiveness = WRIGHT_FLYER_SPECS.rudderEffectiveness
    const area = WRIGHT_FLYER_SPECS.rudderArea

    // Moment arm from CG to rudder (roughly 3m behind CG)
    const momentArm = 3.0
    return dynamicPressure * area * effectiveness * deflectionRad * momentArm
  }

  /**
   * Calculate rolling moment from wing warping
   * The Wright Flyer used wing warping instead of ailerons
   */
  calculateRollMoment(
    warpDeflection: number, // -1 to 1
    velocity: number,
    airDensity: number = PHYSICS.AIR_DENSITY_SEA_LEVEL
  ): number {
    if (velocity < 0.5) return 0

    const warpRad = warpDeflection * WRIGHT_FLYER_SPECS.maxWingWarp
    const dynamicPressure = 0.5 * airDensity * velocity * velocity
    const effectiveness = WRIGHT_FLYER_SPECS.wingWarpEffectiveness

    // Wing warping creates differential lift across the span
    // Approximate moment arm as half wingspan
    const momentArm = WRIGHT_FLYER_SPECS.wingspan / 3
    const wingArea = WRIGHT_FLYER_SPECS.wingArea

    return dynamicPressure * wingArea * effectiveness * warpRad * momentArm
  }

  /**
   * Get all control moments
   */
  calculateMoments(
    elevator: number,
    rudder: number,
    wingWarp: number,
    velocity: number,
    airDensity: number = PHYSICS.AIR_DENSITY_SEA_LEVEL
  ) {
    return {
      pitch: this.calculatePitchMoment(elevator, velocity, airDensity),
      yaw: this.calculateYawMoment(rudder, velocity, airDensity),
      roll: this.calculateRollMoment(wingWarp, velocity, airDensity),
    }
  }
}

export const controlSurfaces = new ControlSurfaces()
