import { SidePanel } from '@/components/layout/SidePanel'
import { ChartPanel } from './ChartPanel'
import { useChartDataStore } from '@/store/chartDataStore'
import { useUIStore } from '@/store/uiStore'

export function ThrustTorqueChart() {
  const { thrust, torque } = useChartDataStore()
  const { rightPanels, toggleRightPanel } = useUIStore()

  const lines = [
    { key: 'thrust', name: 'Thrust', color: '#00ffff', data: thrust },
    { key: 'torque', name: 'Torque', color: '#ff00ff', data: torque },
  ]

  return (
    <SidePanel
      title="THRUST & TORQUE"
      isOpen={rightPanels.thrustTorque}
      onClose={() => toggleRightPanel('thrustTorque')}
    >
      <ChartPanel lines={lines} />
    </SidePanel>
  )
}
