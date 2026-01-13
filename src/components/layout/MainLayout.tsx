import { Header } from './Header'
import { MenuBar } from './MenuBar'
import { ControlPanel } from '@/components/controls/ControlPanel'
import { Scene } from '@/components/viewport/Scene'
import { LiftDragChart } from '@/components/charts/LiftDragChart'
import { EnginePowerChart } from '@/components/charts/EnginePowerChart'
import { AirspeedAltitudeChart } from '@/components/charts/AirspeedAltitudeChart'
import { ThrustTorqueChart } from '@/components/charts/ThrustTorqueChart'
import { ControlSurfaceChart } from '@/components/charts/ControlSurfaceChart'
import { useSimulation } from '@/hooks/useSimulation'
import { useKeyboardControls } from '@/hooks/useKeyboardControls'

export function MainLayout() {
  // Initialize simulation loop
  useSimulation()
  // Initialize keyboard controls
  useKeyboardControls()

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-900 overflow-hidden">
      {/* Header */}
      <Header />

      {/* Menu Bar */}
      <MenuBar />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden p-3 gap-3">
        {/* Left Panels */}
        <div className="w-64 flex flex-col gap-2 overflow-y-auto">
          <LiftDragChart />
          <EnginePowerChart />
          <AirspeedAltitudeChart position="left" />
        </div>

        {/* Center - 3D Viewport */}
        <div className="flex-1 relative">
          <Scene />
        </div>

        {/* Right Panels */}
        <div className="w-64 flex flex-col gap-2 overflow-y-auto">
          <AirspeedAltitudeChart position="right" />
          <ThrustTorqueChart />
          <ControlSurfaceChart />
        </div>
      </div>

      {/* Bottom Control Panel */}
      <ControlPanel />
    </div>
  )
}
