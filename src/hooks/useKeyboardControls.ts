import { useEffect, useCallback } from 'react'
import { useControlStore } from '@/store/controlStore'
import { useSimulationStore } from '@/store/simulationStore'
import { useUIStore } from '@/store/uiStore'

export function useKeyboardControls() {
  const {
    throttle,
    elevator,
    rudder,
    wingWarp,
    setThrottle,
    setElevator,
    setRudder,
    setWingWarp,
  } = useControlStore()

  const { isRunning, start, pause, resume, isPaused, isCanonicalMode, setCanonicalMode, hasCrashed, hasLanded, reset } = useSimulationStore()
  const { cycleCameraMode } = useUIStore()

  // Exit canonical mode when user manually controls the aircraft
  const exitCanonicalIfNeeded = () => {
    if (isCanonicalMode) {
      setCanonicalMode(false)
    }
  }

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Prevent default for game controls
    if (['w', 's', 'a', 'd', 'q', 'e', 'c', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key.toLowerCase())) {
      event.preventDefault()
    }

    const step = 0.05 // Control increment step

    switch (event.key.toLowerCase()) {
      // Throttle: W/S (exits canonical mode if active)
      case 'w':
        exitCanonicalIfNeeded()
        setThrottle(Math.min(1, throttle + step))
        break
      case 's':
        exitCanonicalIfNeeded()
        setThrottle(Math.max(0, throttle - step))
        break

      // Elevator: Up/Down arrows (exits canonical mode if active)
      case 'arrowup':
        exitCanonicalIfNeeded()
        setElevator(Math.min(1, elevator + step))
        break
      case 'arrowdown':
        exitCanonicalIfNeeded()
        setElevator(Math.max(-1, elevator - step))
        break

      // Rudder: Left/Right arrows (exits canonical mode if active)
      case 'arrowleft':
        exitCanonicalIfNeeded()
        setRudder(Math.max(-1, rudder - step))
        break
      case 'arrowright':
        exitCanonicalIfNeeded()
        setRudder(Math.min(1, rudder + step))
        break

      // Wing warp: Q/E (exits canonical mode if active)
      case 'q':
        exitCanonicalIfNeeded()
        setWingWarp(Math.max(-1, wingWarp - step))
        break
      case 'e':
        exitCanonicalIfNeeded()
        setWingWarp(Math.min(1, wingWarp + step))
        break

      // Space: Start/Pause
      case ' ':
        // If flight ended, reset first
        if (hasCrashed || hasLanded) {
          reset()
          return
        }
        if (!isRunning) {
          start()
        } else if (isPaused) {
          resume()
        } else {
          pause()
        }
        break

      // C: Cycle camera mode
      case 'c':
        cycleCameraMode()
        break
    }
  }, [
    throttle, elevator, rudder, wingWarp,
    setThrottle, setElevator, setRudder, setWingWarp,
    isRunning, isPaused, start, pause, resume, isCanonicalMode, setCanonicalMode,
    hasCrashed, hasLanded, reset, cycleCameraMode, exitCanonicalIfNeeded
  ])

  const handleKeyUp = useCallback((_event: KeyboardEvent) => {
    // Optionally return controls to center on key up
    // For now, we'll keep controls where they are
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [handleKeyDown, handleKeyUp])
}
