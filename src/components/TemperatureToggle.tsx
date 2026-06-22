import type { TemperatureUnit } from '../types/weather.ts'

interface TemperatureToggleProps {
  unit: TemperatureUnit
  onChange: (unit: TemperatureUnit) => void
}

export const TemperatureToggle = ({ unit, onChange }: TemperatureToggleProps) => (
  <div className="inline-flex rounded-full border border-slate-200 bg-slate-100 p-1 dark:border-white/10 dark:bg-slate-900" role="group" aria-label="Temperature unit toggle">
    {([
      ['celsius', '°C'],
      ['fahrenheit', '°F'],
    ] as const).map(([value, label]) => {
      const selected = value === unit

      return (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          aria-pressed={selected}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            selected
              ? 'bg-sky-500 text-white shadow-sm'
              : 'text-slate-600 hover:text-sky-600 dark:text-slate-300 dark:hover:text-sky-300'
          }`}
        >
          {label}
        </button>
      )
    })}
  </div>
)
