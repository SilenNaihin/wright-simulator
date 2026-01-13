import { VerticalSlider } from './VerticalSlider'
import { useControlStore } from '@/store/controlStore'
import { useSimulationStore } from '@/store/simulationStore'

export function ControlPanel() {
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

  const {
    aircraftData,
    simulationTime,
    isCanonicalMode,
    canonicalControls,
    distanceTraveled,
    maxAltitudeReached,
  } = useSimulationStore()

  // Use canonical controls when in canonical mode
  const displayThrottle = isCanonicalMode ? canonicalControls.throttle : throttle
  const displayElevator = isCanonicalMode ? canonicalControls.elevator : elevator
  const displayRudder = isCanonicalMode ? canonicalControls.rudder : rudder
  const displayWingWarp = isCanonicalMode ? canonicalControls.wingWarp : wingWarp

  return (
    <div className="bg-gradient-to-t from-slate-900 to-slate-800 border-t border-slate-700/50 px-6 py-4">
      <div className="flex items-center gap-8">
        {/* Control Sliders */}
        <div className="flex items-end gap-6 px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700/30">
          <div className="flex flex-col items-center self-center mr-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Controls
            </span>
            {isCanonicalMode && (
              <span className="text-[10px] text-emerald-400 mt-1">AUTO</span>
            )}
          </div>
          <VerticalSlider
            label="Throttle"
            value={displayThrottle}
            min={0}
            max={1}
            onChange={isCanonicalMode ? () => {} : setThrottle}
            disabled={isCanonicalMode}
          />
          <VerticalSlider
            label="Elevator"
            value={displayElevator}
            min={-1}
            max={1}
            onChange={isCanonicalMode ? () => {} : setElevator}
            centerZero
            disabled={isCanonicalMode}
          />
          <VerticalSlider
            label="Rudder"
            value={displayRudder}
            min={-1}
            max={1}
            onChange={isCanonicalMode ? () => {} : setRudder}
            centerZero
            disabled={isCanonicalMode}
          />
          <VerticalSlider
            label="Warp"
            value={displayWingWarp}
            min={-1}
            max={1}
            onChange={isCanonicalMode ? () => {} : setWingWarp}
            centerZero
            disabled={isCanonicalMode}
          />
        </div>

        {/* Flight Data Display */}
        <div className="flex-1 grid grid-cols-5 gap-3">
          <DataCard
            label="Airspeed"
            value={aircraftData.airspeed.toFixed(1)}
            unit="m/s"
            color="cyan"
          />
          <DataCard
            label="Altitude"
            value={aircraftData.altitude.toFixed(1)}
            unit="m"
            color="emerald"
          />
          <DataCard
            label="Distance"
            value={distanceTraveled.toFixed(1)}
            unit="m"
            color="amber"
          />
          <DataCard
            label="Lift"
            value={aircraftData.forces.lift.toFixed(0)}
            unit="N"
            color="purple"
          />
          <DataCard
            label="Thrust"
            value={aircraftData.forces.thrust.toFixed(0)}
            unit="N"
            color="rose"
          />
        </div>

        {/* Time and Stats Display */}
        <div className="flex flex-col gap-2">
          <div className="px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700/30">
            <div className="text-xs text-slate-500 uppercase tracking-wider">Time</div>
            <div className="text-2xl font-mono text-slate-200">
              {formatTime(simulationTime)}
            </div>
          </div>
          <div className="px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700/30">
            <div className="text-xs text-slate-500 uppercase tracking-wider">Max Alt</div>
            <div className="text-lg font-mono text-emerald-400">
              {maxAltitudeReached.toFixed(1)}m
            </div>
          </div>
        </div>
      </div>

      {/* Keyboard hints */}
      <div className="mt-3 flex items-center justify-center gap-6 text-xs text-slate-500">
        <span><kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-400">W</kbd>/<kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-400">S</kbd> Throttle</span>
        <span><kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-400">↑</kbd>/<kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-400">↓</kbd> Elevator</span>
        <span><kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-400">←</kbd>/<kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-400">→</kbd> Rudder</span>
        <span><kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-400">Q</kbd>/<kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-400">E</kbd> Wing Warp</span>
        <span><kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-400">Space</kbd> Start/Pause</span>
      </div>
    </div>
  )
}

interface DataCardProps {
  label: string
  value: string
  unit: string
  color: 'cyan' | 'emerald' | 'amber' | 'rose' | 'purple'
}

function DataCard({ label, value, unit, color }: DataCardProps) {
  const colorClasses = {
    cyan: 'text-cyan-400',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    rose: 'text-rose-400',
    purple: 'text-purple-400',
  }

  return (
    <div className="px-3 py-2 bg-slate-800/30 rounded-lg border border-slate-700/20">
      <div className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className={`text-lg font-semibold ${colorClasses[color]}`}>{value}</span>
        <span className="text-xs text-slate-500">{unit}</span>
      </div>
    </div>
  )
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 100)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
}
