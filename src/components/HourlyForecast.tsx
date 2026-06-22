import type { HourlyForecastItem, TemperatureUnit } from '../types/weather.ts'
import { getWeatherPresentation } from '../utils/weatherIcons.ts'

const formatTemperature = (value: number, unit: TemperatureUnit) =>
  `${Math.round(unit === 'fahrenheit' ? value * 1.8 + 32 : value)}°`

interface HourlyForecastProps {
  items: HourlyForecastItem[]
  unit: TemperatureUnit
}

export const HourlyForecast = ({ items, unit }: HourlyForecastProps) => (
  <section aria-labelledby="hourly-forecast-title" className="rounded-3xl border border-white/30 bg-white/85 p-6 shadow-panel dark:border-white/10 dark:bg-slate-900/70">
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 id="hourly-forecast-title" className="text-2xl font-semibold text-slate-900 dark:text-white">
          24-hour forecast
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Scroll horizontally for the next 24 hours.</p>
      </div>
      <span className="text-xs uppercase tracking-[0.3em] text-slate-400">Hourly</span>
    </div>

    <div className="mt-5 flex gap-3 overflow-x-auto pb-2 weather-scrollbar" role="list" aria-label="Hourly forecast list">
      {items.map((item) => {
        const presentation = getWeatherPresentation(item.weatherCode)

        return (
          <article key={item.time} className="min-w-[128px] rounded-3xl border border-slate-200/70 bg-slate-50/80 p-4 transition hover:-translate-y-1 dark:border-white/10 dark:bg-slate-950/30" role="listitem">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {new Date(item.time).toLocaleTimeString([], { hour: 'numeric' })}
            </p>
            <p className="mt-3 text-3xl" aria-hidden="true">{presentation.icon}</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">{formatTemperature(item.temperature, unit)}</p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Rain {Math.round(item.precipitationChance)}%</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Wind {Math.round(item.windSpeed)} km/h</p>
          </article>
        )
      })}
    </div>
  </section>
)
