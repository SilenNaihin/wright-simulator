import { useState, useRef, useEffect } from 'react'
import { useSimulationStore } from '@/store/simulationStore'
import { useControlStore } from '@/store/controlStore'
import { useChartDataStore } from '@/store/chartDataStore'
import { useUIStore } from '@/store/uiStore'
import { RotateCcw, Play, Pause, Gauge, Rocket, Camera, Eye, Move3d } from 'lucide-react'

interface MenuItem {
  label: string
  action?: () => void
  divider?: boolean
  checked?: boolean
  disabled?: boolean
}

interface MenuDropdownProps {
  label: string
  items: MenuItem[]
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
}

function MenuDropdown({ label, items, isOpen, onToggle, onClose }: MenuDropdownProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={onToggle}
        className={`px-3 py-1.5 text-sm font-medium rounded transition-all duration-150 ${
          isOpen
            ? 'bg-cyan-500/20 text-cyan-400'
            : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
        }`}
      >
        {label}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-slate-800 border border-slate-600/50 rounded-lg shadow-xl min-w-[200px] z-50 overflow-hidden">
          {items.map((item, index) => (
            item.divider ? (
              <div key={index} className="border-t border-slate-600/50 my-1" />
            ) : (
              <button
                key={index}
                onClick={() => {
                  if (!item.disabled) {
                    item.action?.()
                    onClose()
                  }
                }}
                disabled={item.disabled}
                className={`w-full px-4 py-2 text-sm text-left transition-colors flex items-center justify-between ${
                  item.disabled
                    ? 'text-slate-500 cursor-not-allowed'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                {item.label}
                {item.checked && <span className="text-cyan-400">✓</span>}
              </button>
            )
          ))}
        </div>
      )}
    </div>
  )
}

export function MenuBar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const {
    isRunning,
    isPaused,
    start,
    stop,
    reset,
    pause,
    resume,
    timeScale,
    setTimeScale,
    startCanonicalSimulation,
    isCanonicalMode,
    fuelRemaining,
    hasCrashed,
    hasLanded,
  } = useSimulationStore()

  const { resetControls } = useControlStore()
  const { clearData } = useChartDataStore()
  const { leftPanels, rightPanels, toggleLeftPanel, toggleRightPanel, resetPanels, cameraMode, setCameraMode, cycleCameraMode } = useUIStore()

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu)
  }

  const closeMenu = () => setOpenMenu(null)

  const handleReset = () => {
    reset()
    resetControls()
    clearData()
  }

  const handlePlayPause = () => {
    // If flight ended (crashed or landed), reset before starting new flight
    if (hasCrashed || hasLanded) {
      handleReset()
      return
    }
    if (!isRunning) {
      start()
    } else if (isPaused) {
      resume()
    } else {
      pause()
    }
  }

  const handleCanonicalFlight = () => {
    resetControls()
    clearData()
    startCanonicalSimulation()
  }

  const menus = [
    {
      label: 'Simulation',
      items: [
        { label: isRunning && !isPaused ? 'Pause' : 'Start', action: handlePlayPause },
        { label: 'Stop', action: stop },
        { label: 'Reset', action: handleReset },
        { divider: true },
        { label: 'Canonical Flight (Wright Bros)', action: handleCanonicalFlight },
        { divider: true },
        { label: 'Speed: 0.5x', action: () => setTimeScale(0.5), checked: timeScale === 0.5 },
        { label: 'Speed: 1x', action: () => setTimeScale(1), checked: timeScale === 1 },
        { label: 'Speed: 2x', action: () => setTimeScale(2), checked: timeScale === 2 },
      ],
    },
    {
      label: 'View',
      items: [
        { label: 'Third Person Camera', action: () => setCameraMode('third-person'), checked: cameraMode === 'third-person' },
        { label: 'First Person Camera', action: () => setCameraMode('first-person'), checked: cameraMode === 'first-person' },
        { label: 'Free Camera', action: () => setCameraMode('free'), checked: cameraMode === 'free' },
        { divider: true },
        { label: 'Lift & Drag Panel', action: () => toggleLeftPanel('liftDrag'), checked: leftPanels.liftDrag },
        { label: 'Engine Power Panel', action: () => toggleLeftPanel('enginePower'), checked: leftPanels.enginePower },
        { label: 'Airspeed Panel (Left)', action: () => toggleLeftPanel('airspeedAltitudeLeft'), checked: leftPanels.airspeedAltitudeLeft },
        { divider: true },
        { label: 'Airspeed Panel (Right)', action: () => toggleRightPanel('airspeedAltitudeRight'), checked: rightPanels.airspeedAltitudeRight },
        { label: 'Thrust & Torque Panel', action: () => toggleRightPanel('thrustTorque'), checked: rightPanels.thrustTorque },
        { label: 'Control Surface Panel', action: () => toggleRightPanel('controlSurface'), checked: rightPanels.controlSurface },
        { divider: true },
        { label: 'Reset All Panels', action: resetPanels },
      ],
    },
    {
      label: 'Help',
      items: [
        { label: 'W/S - Throttle up/down', disabled: true },
        { label: '↑/↓ - Elevator (pitch)', disabled: true },
        { label: '←/→ - Rudder (yaw)', disabled: true },
        { label: 'Q/E - Wing warp (roll)', disabled: true },
        { label: 'Space - Start/Pause', disabled: true },
        { label: 'C - Cycle camera mode', disabled: true },
        { divider: true },
        { label: 'About: First powered flight', disabled: true },
        { label: 'December 17, 1903', disabled: true },
        { label: 'Kitty Hawk, North Carolina', disabled: true },
      ],
    },
  ]

  return (
    <nav className="bg-slate-800/80 backdrop-blur border-b border-slate-700/50 px-4 py-1.5 flex items-center gap-2">
      {/* Menu dropdowns */}
      {menus.map((menu) => (
        <MenuDropdown
          key={menu.label}
          label={menu.label}
          items={menu.items as MenuItem[]}
          isOpen={openMenu === menu.label}
          onToggle={() => toggleMenu(menu.label)}
          onClose={closeMenu}
        />
      ))}

      {/* Separator */}
      <div className="w-px h-6 bg-slate-600/50 mx-2" />

      {/* Canonical Flight button */}
      <button
        onClick={handleCanonicalFlight}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-150 ${
          isCanonicalMode
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : 'bg-slate-700/50 text-slate-300 hover:bg-emerald-500/20 hover:text-emerald-400 border border-transparent'
        }`}
        title="Run canonical simulation matching Wright Brothers' first flight"
      >
        <Rocket className="w-4 h-4" />
        <span className="text-sm font-medium">Canonical Flight</span>
      </button>

      {/* Separator */}
      <div className="w-px h-6 bg-slate-600/50 mx-2" />

      {/* Quick action buttons */}
      <button
        onClick={handlePlayPause}
        className={`p-2 rounded-lg transition-all duration-150 ${
          hasCrashed
            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
            : isRunning && !isPaused
            ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
            : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
        }`}
        title={hasCrashed ? 'Reset' : isRunning && !isPaused ? 'Pause' : 'Start'}
      >
        {hasCrashed ? <RotateCcw className="w-4 h-4" /> : isRunning && !isPaused ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </button>

      <button
        onClick={handleReset}
        className="p-2 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white transition-all duration-150"
        title="Reset"
      >
        <RotateCcw className="w-4 h-4" />
      </button>

      {/* Camera mode button */}
      <button
        onClick={cycleCameraMode}
        className="p-2 rounded-lg transition-all duration-150 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30"
        title={`Camera: ${cameraMode} (C to cycle)`}
      >
        {cameraMode === 'first-person' ? <Eye className="w-4 h-4" /> :
         cameraMode === 'free' ? <Move3d className="w-4 h-4" /> :
         <Camera className="w-4 h-4" />}
      </button>

      {/* Speed indicator */}
      <div className="flex items-center gap-2 ml-2 px-3 py-1 rounded-lg bg-slate-700/30">
        <Gauge className="w-4 h-4 text-slate-400" />
        <span className="text-sm text-slate-300">{timeScale}x</span>
      </div>

      {/* Fuel indicator */}
      <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-700/30">
        <div className={`w-2 h-2 rounded-full ${fuelRemaining > 20 ? 'bg-emerald-400' : 'bg-red-400 animate-pulse'}`} />
        <span className={`text-sm ${fuelRemaining > 20 ? 'text-slate-300' : 'text-red-400'}`}>
          {fuelRemaining.toFixed(0)}%
        </span>
      </div>

      {/* Status indicator */}
      <div className="ml-auto flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${
          hasCrashed ? 'bg-red-400' :
          hasLanded ? 'bg-emerald-400' :
          isRunning && !isPaused ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
        }`} />
        <span className="text-sm text-slate-400">
          {hasCrashed ? 'Crashed' : hasLanded ? 'Landed' : isRunning ? (isPaused ? 'Paused' : 'Running') : 'Ready'}
        </span>
      </div>
    </nav>
  )
}
