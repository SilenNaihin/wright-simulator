import { SidePanel } from '@/components/layout/SidePanel'
import { ChartPanel } from './ChartPanel'
import { useChartDataStore } from '@/store/chartDataStore'
import { useUIStore } from '@/store/uiStore'

export function LiftDragChart() {
  const { lift, drag } = useChartDataStore()
  const { leftPanels, toggleLeftPanel } = useUIStore()

  const lines = [
    { key: 'lift', name: 'LIFT', color: '#00cc88', data: lift },
    { key: 'drag', name: 'DRAG', color: '#ff6666', data: drag },
  ]

  return (
    <SidePanel
      title="LIFT & DRAG FORCES (N)"
      isOpen={leftPanels.liftDrag}
      onClose={() => toggleLeftPanel('liftDrag')}
    >
      <ChartPanel lines={lines} />
    </SidePanel>
  )
}
