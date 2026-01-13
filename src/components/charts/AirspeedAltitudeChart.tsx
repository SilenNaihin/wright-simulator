import { SidePanel } from '@/components/layout/SidePanel'
import { ChartPanel } from './ChartPanel'
import { useChartDataStore } from '@/store/chartDataStore'
import { useUIStore } from '@/store/uiStore'

interface AirspeedAltitudeChartProps {
  position: 'left' | 'right'
}

export function AirspeedAltitudeChart({ position }: AirspeedAltitudeChartProps) {
  const { airspeed, altitude, torque } = useChartDataStore()
  const { leftPanels, rightPanels, toggleLeftPanel, toggleRightPanel } = useUIStore()

  const isOpen = position === 'left'
    ? leftPanels.airspeedAltitudeLeft
    : rightPanels.airspeedAltitudeRight

  const onClose = position === 'left'
    ? () => toggleLeftPanel('airspeedAltitudeLeft')
    : () => toggleRightPanel('airspeedAltitudeRight')

  const lines = position === 'left'
    ? [
        { key: 'airspeed', name: 'Airspeed', color: '#88ff00', data: airspeed },
        { key: 'altitude', name: 'Altitude', color: '#ff8800', data: altitude },
        { key: 'torque', name: 'Torque', color: '#8888ff', data: torque },
      ]
    : [
        { key: 'airspeed', name: 'AIRSPEED', color: '#00ff88', data: airspeed },
        { key: 'altitude', name: 'ALTITUDE', color: '#00aaff', data: altitude },
      ]

  return (
    <SidePanel
      title="AIRSPEED & ALTITUDE"
      isOpen={isOpen}
      onClose={onClose}
    >
      <ChartPanel lines={lines} />
    </SidePanel>
  )
}
