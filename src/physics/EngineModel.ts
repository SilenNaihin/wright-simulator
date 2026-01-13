import { WRIGHT_FLYER_SPECS } from '@/config/aircraft.config'
import { PHYSICS } from './constants'

export class EngineModel {
  /**
   * Calculate propeller efficiency based on advance ratio
   * Wright Brothers achieved 66% base, up to 84% at optimal J
   * Advance ratio J = V / (n × D), optimal around J = 0.7-0.9
   */
  calculatePropellerEfficiency(velocity: number, rpm: number): number {
    if (rpm < 10) return 0.3

    // Advance ratio J = V / (n × D)
    const n = rpm / 60 // revolutions per second
    const D = WRIGHT_FLYER_SPECS.propellerDiameter
    const J = velocity / (n * D)

    // Efficiency curve: peaks around J = 0.8 with ~84% efficiency
    // Falls off at low J (static) and high J (blade stall)
    const Jopt = 0.8 // Optimal advance ratio
    const peakEfficiency = 0.84 // Historical peak
    const minEfficiency = 0.40 // Low-speed efficiency

    // Gaussian-like curve centered on Jopt
    const deviation = (J - Jopt) / 0.5
    const efficiencyFactor = Math.exp(-deviation * deviation)

    // Blend between min and peak
    return minEfficiency + (peakEfficiency - minEfficiency) * efficiencyFactor
  }

  /**
   * Calculate thrust from engine power using physics-based model
   * T = η × P / V where η varies with advance ratio
   * Historical: 12 hp engine, 66% base efficiency, up to 84% at optimal J
   */
  calculateThrust(
    throttle: number,
    rpm: number,
    velocity: number,
    _airDensity: number = PHYSICS.AIR_DENSITY_SEA_LEVEL
  ): number {
    if (throttle < 0.01 || rpm < 10) return 0

    // Engine power output
    const power = this.calculatePower(throttle, rpm)

    // Get propeller efficiency based on advance ratio
    const efficiency = this.calculatePropellerEfficiency(velocity, rpm)

    // T = η × P / V, but need minimum velocity to avoid singularity
    // At low speeds, use static thrust model
    const minVelocity = 3.0 // m/s

    if (velocity < minVelocity) {
      // Static thrust: ~132-136 lbf = 590-605 N at full power (historical)
      // Scale with power output
      const staticThrust = 600 * (power / WRIGHT_FLYER_SPECS.enginePower)
      // Blend toward dynamic thrust as velocity increases
      const blend = velocity / minVelocity
      const dynamicThrust = efficiency * power / minVelocity
      return staticThrust * (1 - blend) + dynamicThrust * blend
    }

    return efficiency * power / velocity
  }

  /**
   * Calculate engine power output
   */
  calculatePower(throttle: number, rpm: number): number {
    const normalizedRPM = rpm / WRIGHT_FLYER_SPECS.maxRPM
    // Power curve: peaks at high RPM
    const powerFactor = normalizedRPM * (2 - normalizedRPM)
    return throttle * WRIGHT_FLYER_SPECS.enginePower * powerFactor
  }

  /**
   * Calculate engine torque
   * T = P / ω
   */
  calculateTorque(throttle: number, rpm: number): number {
    if (rpm < 10) return 0

    const power = this.calculatePower(throttle, rpm)
    const omega = (rpm * 2 * Math.PI) / 60
    return power / omega
  }

  /**
   * Calculate RPM response to throttle
   * Models engine spool-up/down time
   */
  calculateRPMResponse(throttle: number, currentRPM: number, dt: number): number {
    const { maxRPM, idleRPM } = WRIGHT_FLYER_SPECS
    const targetRPM = idleRPM + throttle * (maxRPM - idleRPM)

    // Time constant for RPM response (seconds)
    const tau = currentRPM < targetRPM ? 0.8 : 0.5 // Faster spool down

    // First-order response
    const alpha = 1 - Math.exp(-dt / tau)
    return currentRPM + (targetRPM - currentRPM) * alpha
  }
}

export const engineModel = new EngineModel()
