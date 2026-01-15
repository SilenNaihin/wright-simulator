import { useEffect, useRef, useCallback } from 'react'
import { useSimulationStore, WRIGHT_FIRST_FLIGHT } from '@/store/simulationStore'
import { useControlStore } from '@/store/controlStore'
import { useChartDataStore } from '@/store/chartDataStore'
import { flightDynamics } from '@/physics/FlightDynamics'
import { WRIGHT_FLYER_SPECS, GROUND_LEVEL, LAUNCH_RAIL_HEIGHT } from '@/config/aircraft.config'
import { CONVERSIONS } from '@/physics/constants'

export function useSimulation() {
  const animationRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)
  const dataLogIntervalRef = useRef<number>(0)
  const lastPositionRef = useRef({ x: 0, z: 0 })

  const {
    isRunning,
    isPaused,
    timeScale,
    updateAircraftState,
    updateAircraftData,
    incrementTime,
    simulationTime,
    consumeFuel,
    maxFlightTime,
    updateFlightStats,
    setCrashed,
    hasCrashed,
    hasLanded,
    updateCanonicalControls,
    setLanded,
  } = useSimulationStore()

  const { addDataPoints } = useChartDataStore()

  const simulate = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) {
      lastTimeRef.current = timestamp
    }

    const deltaTime = Math.min((timestamp - lastTimeRef.current) / 1000, 0.1) // Cap at 100ms
    lastTimeRef.current = timestamp

    // Get current state from store
    const currentAircraft = useSimulationStore.getState().aircraft
    const currentControls = useControlStore.getState()
    const currentTime = useSimulationStore.getState().simulationTime
    const currentFuel = useSimulationStore.getState().fuelRemaining
    const isCanonical = useSimulationStore.getState().isCanonicalMode

    // In canonical mode, update controls based on flight time and current state
    if (isCanonical) {
      updateCanonicalControls(
        currentTime,
        currentAircraft.position.y,
        currentAircraft.velocity.y
      )
    }
    const canonicalCtrl = useSimulationStore.getState().canonicalControls

    // Check if canonical flight should end
    // Either at 12 seconds OR when plane touches down after being airborne
    const maxAlt = useSimulationStore.getState().maxAltitudeReached
    const wasAirborne = maxAlt > LAUNCH_RAIL_HEIGHT + 1.0 // Was at least 1m above launch rail
    const isOnGround = currentAircraft.position.y <= GROUND_LEVEL + 0.1 // On sand
    const isDescending = currentAircraft.velocity.y < 0

    if (isCanonical) {
      // End if time exceeded
      if (currentTime >= WRIGHT_FIRST_FLIGHT.duration) {
        setLanded(true)
        return
      }
      // End if landed after being airborne (after 3 seconds to allow takeoff)
      // Use <= 0.1 since velocity is clamped to 0 on ground contact
      if (wasAirborne && isOnGround && isDescending && currentTime > 3) {
        setLanded(true)
        return
      }
      // Also detect landing when plane was descending and is now on ground with no vertical velocity
      // (the velocity gets clamped to 0 on ground contact)
      if (wasAirborne && isOnGround && currentAircraft.velocity.y <= 0 && currentTime > 3) {
        setLanded(true)
        return
      }
    }

    // Determine which controls to use
    const controls = isCanonical ? canonicalCtrl : {
      throttle: currentControls.throttle,
      elevator: currentControls.elevator,
      rudder: currentControls.rudder,
      wingWarp: currentControls.wingWarp,
    }

    // Check if we have fuel
    const hasFuel = currentFuel > 0
    const effectiveThrottle = hasFuel ? controls.throttle : 0

    // Apply time scale
    const scaledDt = deltaTime * timeScale

    // Consume fuel based on throttle
    if (effectiveThrottle > 0) {
      const fuelConsumption = (effectiveThrottle * 100 / maxFlightTime) * scaledDt
      consumeFuel(fuelConsumption)
    }

    // Physics integration
    const newState = flightDynamics.integrate(
      currentAircraft,
      {
        throttle: effectiveThrottle,
        elevator: controls.elevator,
        rudder: controls.rudder,
        wingWarp: controls.wingWarp,
      },
      scaledDt
    )

    // Calculate distance traveled
    const dx = newState.position.x - lastPositionRef.current.x
    const dz = newState.position.z - lastPositionRef.current.z
    const distanceDelta = Math.sqrt(dx * dx + dz * dz)
    lastPositionRef.current = { x: newState.position.x, z: newState.position.z }

    // Update flight stats
    updateFlightStats(distanceDelta, newState.position.y)

    // Crash detection
    const data = flightDynamics.getAircraftData(newState, {
      throttle: effectiveThrottle,
      elevator: controls.elevator,
      rudder: controls.rudder,
      wingWarp: controls.wingWarp,
    })

    // Check for crash conditions
    const verticalSpeed = newState.velocity.y
    const isTouchingGround = newState.position.y <= 0.8
    const hardLanding = isTouchingGround && verticalSpeed < -3 // Hard impact
    const isStalled = data.airspeed > 2 && data.forces.lift < data.forces.weight * 0.3 && newState.position.y > 1

    // Stall warning could be added to UI later
    if (isStalled && newState.position.y < 1 && verticalSpeed < -2) {
      setCrashed(true)
      return
    }

    if (hardLanding && currentAircraft.position.y > 1) {
      setCrashed(true)
      return
    }

    // Update aircraft state
    updateAircraftState(newState)
    incrementTime(scaledDt)

    // Update computed data for display
    updateAircraftData(data)

    // Log data for charts at reduced rate (every ~100ms)
    dataLogIntervalRef.current += deltaTime
    if (dataLogIntervalRef.current >= 0.1) {
      dataLogIntervalRef.current = 0

      addDataPoints(currentTime, {
        lift: data.forces.lift,
        drag: data.forces.drag,
        thrust: data.forces.thrust,
        torque: data.engineTorque,
        airspeed: data.airspeed,
        altitude: data.altitude,
        enginePower: data.enginePower,
        engineRPM: newState.engineRPM,
        elevatorDeflection: controls.elevator * WRIGHT_FLYER_SPECS.maxElevatorDeflection * CONVERSIONS.RAD_TO_DEG,
        rudderDeflection: controls.rudder * WRIGHT_FLYER_SPECS.maxRudderDeflection * CONVERSIONS.RAD_TO_DEG,
        warpDeflection: controls.wingWarp * WRIGHT_FLYER_SPECS.maxWingWarp * CONVERSIONS.RAD_TO_DEG,
      })
    }

    // Continue loop
    animationRef.current = requestAnimationFrame(simulate)
  }, [timeScale, updateAircraftState, updateAircraftData, incrementTime, addDataPoints, consumeFuel, maxFlightTime, updateFlightStats, setCrashed, updateCanonicalControls, setLanded])

  useEffect(() => {
    if (isRunning && !isPaused && !hasCrashed && !hasLanded) {
      lastTimeRef.current = 0
      lastPositionRef.current = { x: 0, z: 0 }
      animationRef.current = requestAnimationFrame(simulate)
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isRunning, isPaused, hasCrashed, hasLanded, simulate])

  return {
    isRunning,
    isPaused,
    simulationTime,
  }
}
