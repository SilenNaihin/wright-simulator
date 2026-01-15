import { Canvas } from '@react-three/fiber'
import { Lighting } from './Lighting'
import { Terrain } from './Terrain'
import { Sky } from './Sky'
import { WrightFlyer } from './WrightFlyer'
import { CameraController } from './CameraController'
import { useSimulationStore, WRIGHT_FIRST_FLIGHT } from '@/store/simulationStore'
import { useUIStore, CameraMode } from '@/store/uiStore'
import { Camera, Eye } from 'lucide-react'

const cameraModeConfig: Record<CameraMode, { label: string; icon: typeof Camera }> = {
  'third-person': { label: 'Third Person', icon: Camera },
  'first-person': { label: 'First Person', icon: Eye },
}

export function Scene() {
  const {
    aircraftData,
    distanceTraveled,
    fuelRemaining,
    hasCrashed,
    hasLanded,
    isCanonicalMode,
    simulationTime,
  } = useSimulationStore()

  const { cameraMode, setCameraMode } = useUIStore()

  return (
    <div className="w-full h-full bg-slate-900 rounded-xl overflow-hidden border border-slate-700/30 relative">
      {/* Viewport header */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <div className="px-3 py-1.5 bg-slate-800/90 backdrop-blur rounded-lg border border-slate-700/30">
          <span className="text-xs font-medium text-slate-300">Wright Flyer 1903</span>
        </div>
        {isCanonicalMode && (
          <div className="px-3 py-1.5 bg-emerald-500/20 backdrop-blur rounded-lg border border-emerald-500/30">
            <span className="text-xs font-medium text-emerald-400">Canonical Flight</span>
          </div>
        )}
      </div>

      {/* Camera mode selector */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1">
        {(Object.keys(cameraModeConfig) as CameraMode[]).map((mode) => {
          const config = cameraModeConfig[mode]
          const Icon = config.icon
          const isActive = cameraMode === mode
          return (
            <button
              key={mode}
              onClick={() => setCameraMode(mode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
                isActive
                  ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400'
                  : 'bg-slate-800/90 border-slate-700/30 text-slate-400 hover:text-slate-200 hover:border-slate-600'
              }`}
              title={`${config.label} (Press C to cycle)`}
            >
              <Icon className="w-3 h-3" />
              <span className="text-xs font-medium">{config.label}</span>
            </button>
          )
        })}
      </div>

      {/* Flight info overlay - right side */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
        <div className="px-3 py-1.5 bg-slate-800/90 backdrop-blur rounded-lg border border-slate-700/30">
          <div className="text-[10px] text-slate-500 uppercase">Altitude</div>
          <div className="text-sm font-mono text-emerald-400">{aircraftData.altitude.toFixed(1)}m</div>
        </div>
        <div className="px-3 py-1.5 bg-slate-800/90 backdrop-blur rounded-lg border border-slate-700/30">
          <div className="text-[10px] text-slate-500 uppercase">Airspeed</div>
          <div className="text-sm font-mono text-cyan-400">{aircraftData.airspeed.toFixed(1)}m/s</div>
        </div>
        <div className="px-3 py-1.5 bg-slate-800/90 backdrop-blur rounded-lg border border-slate-700/30">
          <div className="text-[10px] text-slate-500 uppercase">Distance</div>
          <div className="text-sm font-mono text-amber-400">{distanceTraveled.toFixed(1)}m</div>
        </div>
        <div className="px-3 py-1.5 bg-slate-800/90 backdrop-blur rounded-lg border border-slate-700/30">
          <div className="text-[10px] text-slate-500 uppercase">Fuel</div>
          <div className={`text-sm font-mono ${fuelRemaining > 20 ? 'text-emerald-400' : 'text-red-400'}`}>
            {fuelRemaining.toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Wright Brothers comparison - bottom left */}
      {isCanonicalMode && (
        <div className="absolute bottom-3 left-3 z-10 px-3 py-2 bg-slate-800/90 backdrop-blur rounded-lg border border-slate-700/30">
          <div className="text-[10px] text-slate-500 uppercase mb-1">First Flight Target</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <div className="text-slate-400">Duration:</div>
            <div className="text-slate-200 font-mono">{WRIGHT_FIRST_FLIGHT.duration}s</div>
            <div className="text-slate-400">Distance:</div>
            <div className="text-slate-200 font-mono">{WRIGHT_FIRST_FLIGHT.distance}m</div>
            <div className="text-slate-400">Max Alt:</div>
            <div className="text-slate-200 font-mono">{WRIGHT_FIRST_FLIGHT.maxAltitude}m</div>
          </div>
        </div>
      )}

      {/* Landed overlay */}
      {hasLanded && (
        <div className="absolute inset-0 z-20 bg-emerald-900/30 flex items-center justify-center">
          <div className="bg-slate-900/95 px-8 py-6 rounded-xl border border-emerald-500/50 text-center">
            <div className="text-2xl font-bold text-emerald-400 mb-2">FLIGHT COMPLETE</div>
            <div className="text-sm text-slate-400 mb-4">
              Flight time: {simulationTime.toFixed(1)}s | Distance: {distanceTraveled.toFixed(1)}m
            </div>
            <div className="text-xs text-slate-500">Press Reset to try again</div>
          </div>
        </div>
      )}

      {/* Crash overlay */}
      {hasCrashed && (
        <div className="absolute inset-0 z-20 bg-red-900/50 flex items-center justify-center">
          <div className="bg-slate-900/95 px-8 py-6 rounded-xl border border-red-500/50 text-center">
            <div className="text-2xl font-bold text-red-400 mb-2">CRASHED</div>
            <div className="text-sm text-slate-400 mb-4">
              Flight time: {simulationTime.toFixed(1)}s | Distance: {distanceTraveled.toFixed(1)}m
            </div>
            <div className="text-xs text-slate-500">Press Reset to try again</div>
          </div>
        </div>
      )}

      <Canvas
        shadows
        camera={{ fov: 50, near: 0.1, far: 1000 }}
        gl={{ antialias: true }}
      >
        <Lighting />
        <Sky />
        <Terrain />
        <WrightFlyer />
        <CameraController />
      </Canvas>
    </div>
  )
}
