import { SidePanel } from '@/components/layout/SidePanel'
import { ChartPanel } from './ChartPanel'
import { useChartDataStore } from '@/store/chartDataStore'
import { useUIStore } from '@/store/uiStore'

export function ControlSurfaceChart() {
  const { elevatorDeflection, rudderDeflection, warpDeflection } = useChartDataStore()
  const { rightPanels, toggleRightPanel } = useUIStore()

  const lines = [
    { key: 'elevator', name: 'Elevator', color: '#ff6666', data: elevatorDeflection },
    { key: 'rudder', name: 'Rudflection', color: '#66ff66', data: rudderDeflection },
    { key: 'warp', name: 'Deflection', color: '#6666ff', data: warpDeflection },
  ]

  return (
    <SidePanel
      title="CONTROL SURFACE DEFLECTION"
      isOpen={rightPanels.controlSurface}
      onClose={() => toggleRightPanel('controlSurface')}
    >
      <ChartPanel lines={lines} />
    </SidePanel>
  )
}
