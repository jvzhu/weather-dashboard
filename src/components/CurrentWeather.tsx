import { memo } from 'react'
import type { CurrentWeatherData, LocationSuggestion, TemperatureUnit } from '../types/weather.ts'
import { getWeatherPresentation } from '../utils/weatherIcons.ts'

interface CurrentWeatherProps {
  location: LocationSuggestion
  current: CurrentWeatherData
  unit: TemperatureUnit
  updatedAt: string
}

const formatTemperature = (value: number, unit: TemperatureUnit) =>
  `${Math.round(unit === 'fahrenheit' ? value * 1.8 + 32 : value)}°${unit === 'fahrenheit' ? 'F' : 'C'}`

const metricFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

export const CurrentWeather = memo(({ location, current, unit, updatedAt }: CurrentWeatherProps) => {
  const presentation = getWeatherPresentation(current.weatherCode, current.isDay === 1)

  const metrics = [
    ['Humidity', `${metricFormatter.format(current.humidity)}%`],
    ['Wind speed', `${metricFormatter.format(current.windSpeed)} km/h`],
    ['UV index', current.uvIndex.toFixed(1)],
    ['Pressure', `${metricFormatter.format(current.pressure)} hPa`],
    ['Visibility', `${(current.visibility / 1000).toFixed(1)} km`],
    ['Precipitation', `${metricFormatter.format(current.precipitation)} mm`],
  ]

  return (
    <section
      aria-labelledby="current-weather-title"
      className="relative overflow-hidden rounded-[2rem] border border-white/30 bg-white/80 p-6 shadow-panel backdrop-blur-sm transition dark:border-white/10 dark:bg-slate-900/70"
    >
      <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${presentation.gradient} opacity-25 dark:opacity-20`} />
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600 dark:text-sky-300">Now</p>
          <h1 id="current-weather-title" className="mt-3 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            {location.name}
            <span className="block text-lg font-medium text-slate-500 dark:text-slate-300">
              {[location.admin1, location.country].filter(Boolean).join(', ')}
            </span>
          </h1>
          <div className="mt-6 flex items-end gap-4">
            <span className="text-6xl" aria-hidden="true">{presentation.icon}</span>
            <div>
              <p className="text-5xl font-bold text-slate-900 dark:text-white">{formatTemperature(current.temperature, unit)}</p>
              <p className="mt-2 text-base text-slate-600 dark:text-slate-300">{presentation.label}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Feels like {formatTemperature(current.apparentTemperature, unit)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white/70 p-4 dark:bg-slate-950/30">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Last updated</p>
          <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{updatedAt}</p>
        </div>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
        {metrics.map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-white/70 p-4 dark:bg-slate-950/30">
            <dt className="text-sm text-slate-500 dark:text-slate-400">{label}</dt>
            <dd className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
})
