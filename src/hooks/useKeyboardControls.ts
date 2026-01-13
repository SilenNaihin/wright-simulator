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

  const { isRunning, start, pause, resume, isPaused } = useSimulationStore()

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Prevent default for game controls
    if (['w', 's', 'a', 'd', 'q', 'e', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
      event.preventDefault()
    }

    const step = 0.05 // Control increment step

    switch (event.key.toLowerCase()) {
      // Throttle: W/S
      case 'w':
        setThrottle(Math.min(1, throttle + step))
        break
      case 's':
        setThrottle(Math.max(0, throttle - step))
        break

      // Elevator: Up/Down arrows
      case 'arrowup':
        setElevator(Math.min(1, elevator + step))
        break
      case 'arrowdown':
        setElevator(Math.max(-1, elevator - step))
        break

      // Rudder: Left/Right arrows
      case 'arrowleft':
        setRudder(Math.max(-1, rudder - step))
        break
      case 'arrowright':
        setRudder(Math.min(1, rudder + step))
        break

      // Wing warp: Q/E
      case 'q':
        setWingWarp(Math.max(-1, wingWarp - step))
        break
      case 'e':
        setWingWarp(Math.min(1, wingWarp + step))
        break

      // Space: Start/Pause
      case ' ':
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
    isRunning, isPaused, start, pause, resume
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
