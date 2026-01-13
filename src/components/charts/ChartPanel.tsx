import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import type { DataPoint } from '@/types/simulation'

interface LineConfig {
  key: string
  name: string
  color: string
  data: DataPoint[]
}

interface ChartPanelProps {
  lines: LineConfig[]
  height?: number
}

export function ChartPanel({ lines, height = 100 }: ChartPanelProps) {
  // Combine all data points by time
  const chartData = useMemo(() => {
    if (lines.length === 0 || lines[0].data.length === 0) {
      return []
    }

    const timeMap = new Map<number, Record<string, number>>()

    lines.forEach((line) => {
      line.data.forEach((point) => {
        const existing = timeMap.get(point.time) || { time: point.time }
        existing[line.key] = point.value
        timeMap.set(point.time, existing)
      })
    })

    return Array.from(timeMap.values()).sort((a, b) => a.time - b.time)
  }, [lines])

  // Get latest values for display
  const latestValues = useMemo(() => {
    return lines.map((line) => {
      const latest = line.data[line.data.length - 1]
      return {
        name: line.name,
        value: latest?.value ?? 0,
        color: line.color,
      }
    })
  }, [lines])

  return (
    <div className="flex gap-3 h-full">
      {/* Chart */}
      <div className="flex-1 min-w-0">
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
            <XAxis
              dataKey="time"
              stroke="#475569"
              tick={{ fill: '#64748b', fontSize: 9 }}
              tickFormatter={(v) => v.toFixed(0)}
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis
              stroke="#475569"
              tick={{ fill: '#64748b', fontSize: 9 }}
              tickFormatter={(v) => v.toFixed(0)}
              axisLine={{ stroke: '#334155' }}
            />
            <ReferenceLine y={0} stroke="#334155" strokeDasharray="3 3" />
            {lines.map((line) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                stroke={line.color}
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend with values */}
      <div className="flex flex-col justify-center gap-1.5 min-w-[70px]">
        {latestValues.map((item) => (
          <div key={item.name} className="flex flex-col">
            <span className="text-[9px] text-slate-500 uppercase tracking-wide">{item.name}</span>
            <span className="text-xs font-mono font-medium" style={{ color: item.color }}>
              {item.value.toFixed(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
