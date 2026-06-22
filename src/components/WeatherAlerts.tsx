import type { WeatherAlert } from '../types/weather.ts'

export const WeatherAlerts = ({ alerts }: { alerts: WeatherAlert[] }) => (
  <section aria-labelledby="weather-alerts-title" className="rounded-3xl border border-amber-200/60 bg-white/90 p-6 shadow-panel dark:border-amber-400/30 dark:bg-slate-900/75">
    <div className="flex items-center gap-3">
      <span className="text-2xl" aria-hidden="true">⚠️</span>
      <div>
        <h2 id="weather-alerts-title" className="text-lg font-semibold text-slate-900 dark:text-white">
          Weather alerts
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Severe conditions and official warnings for the selected area.</p>
      </div>
    </div>

    {alerts.length === 0 ? (
      <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
        No active severe weather alerts reported right now.
      </p>
    ) : (
      <ul className="mt-4 space-y-3">
        {alerts.map((alert) => (
          <li key={alert.id} className="rounded-2xl border border-amber-200/70 bg-amber-50/80 p-4 dark:border-amber-400/20 dark:bg-amber-500/10">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-slate-900 dark:text-white">{alert.title}</h3>
              <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-amber-950 dark:bg-amber-400/20 dark:text-amber-200">
                {alert.severity}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{alert.description}</p>
            {(alert.start || alert.end || alert.source) && (
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {[alert.start ? `Starts ${alert.start}` : null, alert.end ? `Ends ${alert.end}` : null, alert.source ? `Source: ${alert.source}` : null]
                  .filter(Boolean)
                  .join(' • ')}
              </p>
            )}
          </li>
        ))}
      </ul>
    )}
  </section>
)
