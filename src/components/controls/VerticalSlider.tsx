import { useCallback } from 'react'

interface VerticalSliderProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  centerZero?: boolean
  disabled?: boolean
}

export function VerticalSlider({
  label,
  value,
  min,
  max,
  step = 0.01,
  onChange,
  centerZero = false,
  disabled = false,
}: VerticalSliderProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(parseFloat(e.target.value))
    },
    [onChange]
  )

  // Calculate fill percentage
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-24 w-6 flex items-center justify-center">
        {/* Track background */}
        <div className="absolute w-1.5 h-full bg-slate-700 rounded-full overflow-hidden">
          {/* Fill */}
          {centerZero ? (
            <>
              {value > 0 && (
                <div
                  className="absolute w-full bg-cyan-500/70 transition-all duration-75"
                  style={{
                    bottom: '50%',
                    height: `${(value / max) * 50}%`,
                  }}
                />
              )}
              {value < 0 && (
                <div
                  className="absolute w-full bg-cyan-500/70 transition-all duration-75"
                  style={{
                    top: '50%',
                    height: `${(Math.abs(value) / Math.abs(min)) * 50}%`,
                  }}
                />
              )}
            </>
          ) : (
            <div
              className="absolute w-full bg-cyan-500/70 transition-all duration-75"
              style={{
                bottom: 0,
                height: `${percentage}%`,
              }}
            />
          )}
        </div>

        {/* Center line for center-zero sliders */}
        {centerZero && (
          <div className="absolute w-3 h-0.5 bg-slate-500 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        )}

        {/* Slider thumb indicator */}
        <div
          className={`absolute w-4 h-2 rounded-sm shadow-lg transition-all duration-75 ${disabled ? 'bg-emerald-400' : 'bg-cyan-400'}`}
          style={{
            bottom: `calc(${percentage}% - 4px)`,
          }}
        />

        {/* Actual slider input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className={`absolute h-full w-6 opacity-0 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          style={{
            writingMode: 'vertical-lr',
            direction: 'rtl',
          }}
        />
      </div>

      {/* Label */}
      <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">
        {label}
      </span>

      {/* Value display */}
      <span className="text-xs text-cyan-400 font-mono">
        {(value * 100).toFixed(0)}%
      </span>
    </div>
  )
}
