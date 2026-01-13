import { SidePanel } from '@/components/layout/SidePanel'
import { ChartPanel } from './ChartPanel'
import { useChartDataStore } from '@/store/chartDataStore'
import { useUIStore } from '@/store/uiStore'

export function EnginePowerChart() {
  const { enginePower, engineRPM } = useChartDataStore()
  const { leftPanels, toggleLeftPanel } = useUIStore()

  const lines = [
    { key: 'enginePower', name: 'Real Power', color: '#ffaa00', data: enginePower },
    { key: 'engineRPM', name: 'Engine RPM', color: '#00aaff', data: engineRPM },
  ]

  return (
    <SidePanel
      title="ENGINE POWER & RPM"
      isOpen={leftPanels.enginePower}
      onClose={() => toggleLeftPanel('enginePower')}
    >
      <ChartPanel lines={lines} />
    </SidePanel>
  )
}
