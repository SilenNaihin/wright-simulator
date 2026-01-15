import type { AircraftState, ControlInputs, Vector3, Quaternion } from '@/types/aircraft'
import { WRIGHT_FLYER_SPECS, HEADWIND_SPEED, GROUND_LEVEL, LAUNCH_RAIL_HEIGHT } from '@/config/aircraft.config'
import { aerodynamicsEngine } from './AerodynamicsEngine'
import { engineModel } from './EngineModel'
import { controlSurfaces } from './ControlSurfaces'
import { PHYSICS } from './constants'

export class FlightDynamics {
  /**
   * Get pitch angle from quaternion
   */
  private getPitchFromQuaternion(q: Quaternion): number {
    // Extract pitch (rotation around X axis)
    const sinp = 2 * (q.w * q.y - q.z * q.x)
    return Math.abs(sinp) >= 1 ? Math.sign(sinp) * Math.PI / 2 : Math.asin(sinp)
  }

  /**
   * Get yaw angle from quaternion
   */
  private getYawFromQuaternion(q: Quaternion): number {
    const siny_cosp = 2 * (q.w * q.z + q.x * q.y)
    const cosy_cosp = 1 - 2 * (q.y * q.y + q.z * q.z)
    return Math.atan2(siny_cosp, cosy_cosp)
  }

  /**
   * Calculate airspeed from velocity vector (includes headwind effect)
   * Headwind adds to apparent airspeed in the -Z direction
   */
  calculateAirspeed(velocity: Vector3, includeWind: boolean = true): number {
    // Headwind comes from +Z direction (plane flies into -Z)
    // So it adds to the apparent velocity in -Z direction
    const effectiveVz = includeWind ? velocity.z - HEADWIND_SPEED : velocity.z
    return Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y + effectiveVz * effectiveVz)
  }

  /**
   * Calculate ground speed (actual movement over terrain)
   */
  calculateGroundSpeed(velocity: Vector3): number {
    return Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z)
  }

  /**
   * Main physics integration step
   */
  integrate(state: AircraftState, controls: ControlInputs, dt: number): AircraftState {
    // Update engine RPM
    const newRPM = engineModel.calculateRPMResponse(controls.throttle, state.engineRPM, dt)

    // Get flight parameters
    const airspeed = this.calculateAirspeed(state.velocity)
    const altitude = Math.max(0, state.position.y)
    const airDensity = aerodynamicsEngine.calculateAirDensity(altitude)
    const pitch = this.getPitchFromQuaternion(state.orientation)
    const yaw = this.getYawFromQuaternion(state.orientation)

    // Calculate angle of attack (pitch relative to velocity direction)
    // Flight path angle should be relative to airspeed, not ground speed
    let angleOfAttack = 0
    if (airspeed > 0.5) {
      // Use airspeed (horizontal component) for flight path calculation
      const horizontalAirspeed = Math.sqrt(
        state.velocity.x * state.velocity.x +
        (state.velocity.z - HEADWIND_SPEED) * (state.velocity.z - HEADWIND_SPEED)
      )
      const flightPathAngle = Math.atan2(state.velocity.y, horizontalAirspeed)
      angleOfAttack = pitch - flightPathAngle
    }

    // Calculate aerodynamic forces
    const lift = aerodynamicsEngine.calculateLift(airspeed, angleOfAttack, airDensity)
    const liftCoeff = aerodynamicsEngine.calculateLiftCoefficient(angleOfAttack)
    const drag = aerodynamicsEngine.calculateDrag(airspeed, liftCoeff, airDensity)
    const thrust = engineModel.calculateThrust(controls.throttle, newRPM, airspeed, airDensity)
    const weight = WRIGHT_FLYER_SPECS.totalMass * PHYSICS.GRAVITY

    // Calculate control moments
    const moments = controlSurfaces.calculateMoments(
      controls.elevator,
      controls.rudder,
      controls.wingWarp,
      airspeed,
      airDensity
    )

    // Direction vectors based on aircraft orientation
    const cosYaw = Math.cos(yaw)
    const sinYaw = Math.sin(yaw)
    const cosPitch = Math.cos(pitch)
    const sinPitch = Math.sin(pitch)

    // Thrust acts along the aircraft's forward direction (negative Z in aircraft frame)
    // Forward direction in world space
    const forwardX = -sinYaw * cosPitch
    const forwardY = sinPitch
    const forwardZ = -cosYaw * cosPitch

    // Calculate force components in world frame
    let Fx = thrust * forwardX
    let Fy = thrust * forwardY - weight
    let Fz = thrust * forwardZ

    // Add lift (simplified: acts purely vertical for stable flight characteristics)
    // This matches the simplified test script physics and gives more controllable behavior
    if (airspeed > 0.5) {
      Fy += lift * cosPitch
      // Note: In full 6-DOF simulation, lift would have horizontal components when pitched
      // but for this simplified model matching historical flight, we omit them
    }

    // Add drag (opposite to AIR-RELATIVE velocity direction, not ground velocity)
    // Headwind comes from +Z, so air-relative velocity has headwind subtracted from Z
    if (airspeed > 0.5) {
      const airRelativeVz = state.velocity.z - HEADWIND_SPEED // Add headwind effect
      const dragFactor = drag / airspeed
      Fx -= state.velocity.x * dragFactor
      Fy -= state.velocity.y * dragFactor
      Fz -= airRelativeVz * dragFactor
    }

    // Calculate accelerations
    const mass = WRIGHT_FLYER_SPECS.totalMass
    let ax = Fx / mass
    let ay = Fy / mass
    let az = Fz / mass

    // Ground interaction - use launch rail height for ground check during takeoff
    // Aircraft is "on ground" when at or below the rail height
    const onGround = state.position.y <= LAUNCH_RAIL_HEIGHT + 0.1
    if (onGround) {
      // Ground friction when on ground
      const frictionCoeff = 0.02 // Rolling friction on launch rail
      const groundSpeed = Math.sqrt(state.velocity.x ** 2 + state.velocity.z ** 2)
      if (groundSpeed > 0.1) {
        const normalForce = Math.max(0, weight - lift) // Normal force reduced by lift
        const friction = frictionCoeff * normalForce
        ax -= (state.velocity.x / groundSpeed) * friction / mass
        az -= (state.velocity.z / groundSpeed) * friction / mass
      }

      // Keep plane on ground until lift exceeds weight
      if (lift < weight) {
        // Clamp vertical position and velocity
        if (state.velocity.y < 0) {
          ay = Math.max(0, ay)
        }
      }
    }

    // Angular accelerations from control moments
    // Add aerodynamic pitch damping - pitch rate creates opposing moment
    // Also add static stability: nose-down pitching moment when AoA is high
    const pitchDampingCoeff = 150 // Nm per rad/s - reduced for better elevator response
    const pitchDamping = -state.angularVelocity.y * pitchDampingCoeff

    // Add pitch stability moment - aircraft naturally pitches toward trim AoA
    // This creates a restoring moment when AoA deviates from trim (static stability)
    // For level flight at V=15 m/s with CL0=0.1: CL_required = 0.51, AoA = (0.51-0.1)/5.5 = 0.075 rad
    // Keep stability weak so elevator can override it for climb/descent control
    const trimAoA = 0.075 // Trim angle of attack (~4.3 degrees) for level flight
    const stabilityCoeff = 30 // Nm per radian of AoA deviation (weak for controllability)
    const pitchStability = -(angleOfAttack - trimAoA) * stabilityCoeff * (airspeed / 15)
    const alphaPitch = (moments.pitch + pitchDamping + pitchStability) / WRIGHT_FLYER_SPECS.Iyy
    const alphaYaw = moments.yaw / WRIGHT_FLYER_SPECS.Izz
    const alphaRoll = moments.roll / WRIGHT_FLYER_SPECS.Ixx

    // Damping - minimal damping to maintain stability without killing response
    const linearDamping = 0.9995
    const angularDamping = 0.998 // Reduced from 0.98 which was too aggressive

    // Integrate velocities
    const newVelocity: Vector3 = {
      x: (state.velocity.x + ax * dt) * linearDamping,
      y: (state.velocity.y + ay * dt) * linearDamping,
      z: (state.velocity.z + az * dt) * linearDamping,
    }

    // Integrate position
    // Ground is the sand surface (GROUND_LEVEL = 0), aircraft lands on sand
    const newPosition: Vector3 = {
      x: state.position.x + newVelocity.x * dt,
      y: Math.max(GROUND_LEVEL, state.position.y + newVelocity.y * dt),
      z: state.position.z + newVelocity.z * dt,
    }

    // Ground collision - stop vertical velocity if hitting ground (sand)
    if (newPosition.y <= GROUND_LEVEL && newVelocity.y < 0) {
      newPosition.y = GROUND_LEVEL
      newVelocity.y = 0
      // Apply strong deceleration on touchdown to prevent dragging
      // This simulates the skids/wheels catching on the ground
      const groundFriction = 0.85 // Reduce horizontal velocity significantly
      newVelocity.x *= groundFriction
      newVelocity.z *= groundFriction
    }

    // Integrate angular velocities
    // Aircraft axes: X=roll, Y=pitch, Z=yaw
    const newAngularVelocity: Vector3 = {
      x: (state.angularVelocity.x + alphaRoll * dt) * angularDamping,
      y: (state.angularVelocity.y + alphaPitch * dt) * angularDamping, // Pitch around Y axis
      z: (state.angularVelocity.z + alphaYaw * dt) * angularDamping,   // Yaw around Z axis
    }

    // Limit angular velocities
    const maxAngVel = 1.0
    newAngularVelocity.x = Math.max(-maxAngVel, Math.min(maxAngVel, newAngularVelocity.x))
    newAngularVelocity.y = Math.max(-maxAngVel, Math.min(maxAngVel, newAngularVelocity.y))
    newAngularVelocity.z = Math.max(-maxAngVel, Math.min(maxAngVel, newAngularVelocity.z))

    // Update orientation
    const newOrientation = this.integrateQuaternion(
      state.orientation,
      newAngularVelocity,
      dt
    )

    return {
      position: newPosition,
      velocity: newVelocity,
      orientation: newOrientation,
      angularVelocity: newAngularVelocity,
      engineRPM: newRPM,
      throttle: controls.throttle,
    }
  }

  /**
   * Integrate quaternion with angular velocity
   */
  private integrateQuaternion(q: Quaternion, omega: Vector3, dt: number): Quaternion {
    const halfDt = dt * 0.5
    const qDot: Quaternion = {
      x: halfDt * (omega.x * q.w + omega.z * q.y - omega.y * q.z),
      y: halfDt * (omega.y * q.w - omega.z * q.x + omega.x * q.z),
      z: halfDt * (omega.z * q.w + omega.y * q.x - omega.x * q.y),
      w: halfDt * (-omega.x * q.x - omega.y * q.y - omega.z * q.z),
    }

    const newQ: Quaternion = {
      x: q.x + qDot.x,
      y: q.y + qDot.y,
      z: q.z + qDot.z,
      w: q.w + qDot.w,
    }

    // Normalize
    const mag = Math.sqrt(newQ.x ** 2 + newQ.y ** 2 + newQ.z ** 2 + newQ.w ** 2)
    return {
      x: newQ.x / mag,
      y: newQ.y / mag,
      z: newQ.z / mag,
      w: newQ.w / mag,
    }
  }

  /**
   * Get all computed data for display
   */
  getAircraftData(state: AircraftState, controls: ControlInputs) {
    const airspeed = this.calculateAirspeed(state.velocity)
    const altitude = state.position.y
    const airDensity = aerodynamicsEngine.calculateAirDensity(altitude)
    const pitch = this.getPitchFromQuaternion(state.orientation)

    // Calculate angle of attack using horizontal AIRSPEED (matching integrate function)
    let angleOfAttack = 0
    if (airspeed > 0.5) {
      const horizontalAirspeed = Math.sqrt(
        state.velocity.x * state.velocity.x +
        (state.velocity.z - HEADWIND_SPEED) * (state.velocity.z - HEADWIND_SPEED)
      )
      const flightPathAngle = Math.atan2(state.velocity.y, horizontalAirspeed)
      angleOfAttack = pitch - flightPathAngle
    }

    const lift = aerodynamicsEngine.calculateLift(airspeed, angleOfAttack, airDensity)
    const liftCoeff = aerodynamicsEngine.calculateLiftCoefficient(angleOfAttack)
    const drag = aerodynamicsEngine.calculateDrag(airspeed, liftCoeff, airDensity)
    const thrust = engineModel.calculateThrust(controls.throttle, state.engineRPM, airspeed, airDensity)
    const enginePower = engineModel.calculatePower(controls.throttle, state.engineRPM)
    const engineTorque = engineModel.calculateTorque(controls.throttle, state.engineRPM)

    const moments = controlSurfaces.calculateMoments(
      controls.elevator,
      controls.rudder,
      controls.wingWarp,
      airspeed,
      airDensity
    )

    return {
      forces: {
        lift,
        drag,
        thrust,
        weight: WRIGHT_FLYER_SPECS.totalMass * PHYSICS.GRAVITY,
      },
      moments,
      airspeed,
      altitude,
      angleOfAttack,
      enginePower,
      engineTorque,
    }
  }
}

export const flightDynamics = new FlightDynamics()
