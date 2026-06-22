import type { DailyForecastItem, TemperatureUnit } from '../types/weather.ts'
import { getWeatherPresentation } from '../utils/weatherIcons.ts'

const formatTemperature = (value: number, unit: TemperatureUnit) =>
  `${Math.round(unit === 'fahrenheit' ? value * 1.8 + 32 : value)}°`

interface DailyForecastProps {
  items: DailyForecastItem[]
  unit: TemperatureUnit
}

export const DailyForecast = ({ items, unit }: DailyForecastProps) => (
  <section aria-labelledby="daily-forecast-title" className="rounded-3xl border border-white/30 bg-white/85 p-6 shadow-panel dark:border-white/10 dark:bg-slate-900/70">
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 id="daily-forecast-title" className="text-2xl font-semibold text-slate-900 dark:text-white">
          5-day outlook
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Highs, lows, and precipitation risk for the week ahead.</p>
      </div>
      <span className="text-xs uppercase tracking-[0.3em] text-slate-400">Daily</span>
    </div>

    <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {items.map((item) => {
        const presentation = getWeatherPresentation(item.weatherCode)

        return (
          <article key={item.date} className="rounded-3xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-slate-950/30">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {new Date(item.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
            <p className="mt-3 text-3xl" aria-hidden="true">{presentation.icon}</p>
            <div className="mt-4 flex items-center justify-between gap-3 text-slate-900 dark:text-white">
              <span className="text-xl font-semibold">{formatTemperature(item.high, unit)}</span>
              <span className="text-sm text-slate-500 dark:text-slate-400">{formatTemperature(item.low, unit)}</span>
            </div>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{presentation.label}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Rain chance {Math.round(item.precipitationChance)}%</p>
          </article>
        )
      })}
    </div>
  </section>
)
