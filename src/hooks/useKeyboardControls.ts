import { useEffect, useCallback } from 'react'
import { useControlStore } from '@/store/controlStore'
import { useSimulationStore } from '@/store/simulationStore'

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

  const { isRunning, start, pause, resume, isPaused, isCanonicalMode, hasCrashed, hasLanded, reset } = useSimulationStore()

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Prevent default for game controls
    if (['w', 's', 'a', 'd', 'q', 'e', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
      event.preventDefault()
    }

    const step = 0.05 // Control increment step

    switch (event.key.toLowerCase()) {
      // Throttle: W/S (disabled in canonical mode)
      case 'w':
        if (!isCanonicalMode) setThrottle(Math.min(1, throttle + step))
        break
      case 's':
        if (!isCanonicalMode) setThrottle(Math.max(0, throttle - step))
        break

      // Elevator: Up/Down arrows (disabled in canonical mode)
      case 'arrowup':
        if (!isCanonicalMode) setElevator(Math.min(1, elevator + step))
        break
      case 'arrowdown':
        if (!isCanonicalMode) setElevator(Math.max(-1, elevator - step))
        break

      // Rudder: Left/Right arrows (disabled in canonical mode)
      case 'arrowleft':
        if (!isCanonicalMode) setRudder(Math.max(-1, rudder - step))
        break
      case 'arrowright':
        if (!isCanonicalMode) setRudder(Math.min(1, rudder + step))
        break

      // Wing warp: Q/E (disabled in canonical mode)
      case 'q':
        if (!isCanonicalMode) setWingWarp(Math.max(-1, wingWarp - step))
        break
      case 'e':
        if (!isCanonicalMode) setWingWarp(Math.min(1, wingWarp + step))
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
    }
  }, [
    throttle, elevator, rudder, wingWarp,
    setThrottle, setElevator, setRudder, setWingWarp,
    isRunning, isPaused, start, pause, resume, isCanonicalMode,
    hasCrashed, hasLanded, reset
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
