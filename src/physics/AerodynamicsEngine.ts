import { WRIGHT_FLYER_SPECS } from '@/config/aircraft.config'
import { PHYSICS } from './constants'

export class AerodynamicsEngine {
  /**
   * Calculate lift coefficient based on angle of attack
   * Uses linear region with stall modeling
   */
  calculateLiftCoefficient(angleOfAttack: number): number {
    const { liftCoefficient0, liftCoefficientSlope, stallAngle, maxLiftCoefficient } = WRIGHT_FLYER_SPECS

    // Pre-stall: linear relationship
    if (Math.abs(angleOfAttack) < stallAngle) {
      const cl = liftCoefficient0 + liftCoefficientSlope * angleOfAttack
      return Math.min(cl, maxLiftCoefficient)
    }

    // Post-stall: gradual decrease (simplified model)
    const sign = Math.sign(angleOfAttack)
    const excessAngle = Math.abs(angleOfAttack) - stallAngle
    const stallDecay = Math.exp(-excessAngle * 3)
    return sign * maxLiftCoefficient * stallDecay
  }

  /**
   * Calculate drag coefficient
   * CD = CD0 + CL² / (π × AR × e)
   */
  calculateDragCoefficient(liftCoefficient: number): number {
    const { dragCoefficient0, aspectRatio, oswaldEfficiency } = WRIGHT_FLYER_SPECS

    // Induced drag factor
    const inducedDragFactor = 1 / (Math.PI * aspectRatio * oswaldEfficiency)

    return dragCoefficient0 + (liftCoefficient * liftCoefficient) * inducedDragFactor
  }

  /**
   * Calculate lift force
   * L = 0.5 × ρ × V² × S × CL
   */
  calculateLift(
    velocity: number,
    angleOfAttack: number,
    airDensity: number = PHYSICS.AIR_DENSITY_SEA_LEVEL
  ): number {
    if (velocity < 0.1) return 0

    const cl = this.calculateLiftCoefficient(angleOfAttack)
    const dynamicPressure = 0.5 * airDensity * velocity * velocity
    return dynamicPressure * WRIGHT_FLYER_SPECS.wingArea * cl
  }

  /**
   * Calculate drag force
   * D = 0.5 × ρ × V² × S × CD
   */
  calculateDrag(
    velocity: number,
    liftCoefficient: number,
    airDensity: number = PHYSICS.AIR_DENSITY_SEA_LEVEL
  ): number {
    if (velocity < 0.1) return 0

    const cd = this.calculateDragCoefficient(liftCoefficient)
    const dynamicPressure = 0.5 * airDensity * velocity * velocity
    return dynamicPressure * WRIGHT_FLYER_SPECS.wingArea * cd
  }

  /**
   * Calculate air density at altitude
   * Uses barometric formula
   */
  calculateAirDensity(altitude: number): number {
    const T = PHYSICS.SEA_LEVEL_TEMP - PHYSICS.TEMP_LAPSE_RATE * altitude
    const pressure = 101325 * Math.pow(T / PHYSICS.SEA_LEVEL_TEMP, 5.257)
    return pressure / (PHYSICS.GAS_CONSTANT * T)
  }

  /**
   * Calculate angle of attack from velocity and pitch
   */
  calculateAngleOfAttack(velocityX: number, velocityY: number, pitch: number): number {
    if (Math.abs(velocityX) < 0.1) return pitch
    const flightPathAngle = Math.atan2(velocityY, velocityX)
    return pitch - flightPathAngle
  }
}

export const aerodynamicsEngine = new AerodynamicsEngine()
