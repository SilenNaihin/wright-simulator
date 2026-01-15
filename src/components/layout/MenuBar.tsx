import { useSimulationStore } from '@/store/simulationStore'
import { useControlStore } from '@/store/controlStore'
import { useChartDataStore } from '@/store/chartDataStore'
import { useUIStore } from '@/store/uiStore'
import { RotateCcw, Play, Pause, Rocket, Camera, Eye, BookOpen } from 'lucide-react'

export function MenuBar() {
  const {
    isRunning,
    isPaused,
    start,
    reset,
    pause,
    resume,
    startCanonicalSimulation,
    isCanonicalMode,
    hasCrashed,
    hasLanded,
  } = useSimulationStore()

  const { resetControls } = useControlStore()
  const { clearData } = useChartDataStore()
  const { cameraMode, cycleCameraMode, isArticleOpen, toggleArticle } = useUIStore()

  const handleReset = () => {
    reset()
    resetControls()
    clearData()
  }

  const handlePlayPause = () => {
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

  return (
    <nav className="bg-slate-800/80 backdrop-blur border-b border-slate-700/50 px-4 py-1.5 flex items-center">
      {/* Left side - Canonical Flight button */}
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

      <div className="w-px h-6 bg-slate-600/50 mx-3" />

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
        className="p-2 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white transition-all duration-150 ml-1"
        title="Reset"
      >
        <RotateCcw className="w-4 h-4" />
      </button>

      {/* Camera mode button */}
      <button
        onClick={cycleCameraMode}
        className="p-2 rounded-lg transition-all duration-150 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 ml-1"
        title={`Camera: ${cameraMode} (C to cycle)`}
      >
        {cameraMode === 'first-person' ? <Eye className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
      </button>

      {/* Center - Title */}
      <div className="flex-1 flex justify-center">
        <span className="text-sm font-semibold text-slate-200">Wright Flyer Simulation</span>
      </div>

      {/* Article button */}
      <button
        onClick={toggleArticle}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-150 mr-3 ${
          isArticleOpen
            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
            : 'bg-slate-700/50 text-slate-300 hover:bg-purple-500/20 hover:text-purple-400 border border-transparent'
        }`}
        title="Historical article about the Wright Brothers' first flight"
      >
        <BookOpen className="w-4 h-4" />
        <span className="text-sm font-medium">Article</span>
      </button>

      {/* Right side - Status indicator */}
      <div className="flex items-center gap-2">
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
