/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { CurrentWeather } from './components/CurrentWeather.tsx'
import { DailyForecast } from './components/DailyForecast.tsx'
import { HourlyForecast } from './components/HourlyForecast.tsx'
import { LoadingSpinner } from './components/LoadingSpinner.tsx'
import { SearchBar } from './components/SearchBar.tsx'
import { TemperatureToggle } from './components/TemperatureToggle.tsx'
import { ThemeToggle } from './components/ThemeToggle.tsx'
import { WeatherAlerts } from './components/WeatherAlerts.tsx'
import { fetchWeather, reverseGeocode } from './services/weatherApi.ts'
import type { LocationSuggestion, TemperatureUnit, WeatherData } from './types/weather.ts'

const DEFAULT_LOCATION: LocationSuggestion = {
  id: 'new-york-40.7128--74.0060',
  name: 'New York',
  admin1: 'New York',
  country: 'United States',
  latitude: 40.7128,
  longitude: -74.006,
  timezone: 'America/New_York',
}

const UNIT_STORAGE_KEY = 'weather-dashboard-temperature-unit'

const getInitialUnit = (): TemperatureUnit => {
  const saved = window.localStorage.getItem(UNIT_STORAGE_KEY)
  return saved === 'fahrenheit' ? 'fahrenheit' : 'celsius'
}

const formatUpdatedAt = (date: string, timezone: string) =>
  new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezone,
  }).format(new Date(date))

function App() {
  const geolocationSupported = 'geolocation' in navigator
  const [unit, setUnit] = useState<TemperatureUnit>(getInitialUnit)
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [currentLocation, setCurrentLocation] = useState<LocationSuggestion | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(() =>
    geolocationSupported ? null : 'Geolocation is not supported in this browser, so New York is shown by default.',
  )
  const hasInitialized = useRef(false)

  useEffect(() => {
    window.localStorage.setItem(UNIT_STORAGE_KEY, unit)
  }, [unit])

  const loadForecast = useCallback(async (location: LocationSuggestion, persistToStorage = true) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetchWeather(location, { persistToStorage })
      setCurrentLocation(location)
      setWeather(response)
    } catch {
      setError('Unable to load weather data right now. Please try another city or retry shortly.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadGeolocation = useCallback(() => {
    if (!geolocationSupported) {
      void loadForecast(DEFAULT_LOCATION)
      return
    }

    setStatusMessage('Finding your current location…')

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const location = (await reverseGeocode(coords.latitude, coords.longitude)) ?? {
            ...DEFAULT_LOCATION,
            id: `coords-${coords.latitude}-${coords.longitude}`,
            name: 'Current location',
            latitude: coords.latitude,
            longitude: coords.longitude,
          }
          setStatusMessage('Showing weather near your current location.')
          await loadForecast(location, false)
        } catch {
          setStatusMessage('Unable to resolve your location name, showing local forecast by coordinates.')
          await loadForecast({
            ...DEFAULT_LOCATION,
            id: `coords-${coords.latitude}-${coords.longitude}`,
            name: 'Current location',
            latitude: coords.latitude,
            longitude: coords.longitude,
          }, false)
        }
      },
      async () => {
        setStatusMessage('Location access unavailable, showing New York weather instead.')
        await loadForecast(DEFAULT_LOCATION)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 1000 * 60 * 10 },
    )
  }, [geolocationSupported, loadForecast])

  useEffect(() => {
    if (hasInitialized.current) {
      return
    }
    hasInitialized.current = true

    if (!geolocationSupported) {
      void loadForecast(DEFAULT_LOCATION)
      return
    }

    loadGeolocation()
  }, [geolocationSupported, loadForecast, loadGeolocation])

  const locationSummary = useMemo(
    () => (currentLocation ? [currentLocation.admin1, currentLocation.country].filter(Boolean).join(', ') : ''),
    [currentLocation],
  )

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_45%),linear-gradient(180deg,_#f8fbff_0%,_#eef6ff_46%,_#e2ecf9_100%)] px-4 py-6 text-slate-900 transition dark:bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_40%),linear-gradient(180deg,_#020617_0%,_#0f172a_45%,_#111827_100%)] dark:text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl animate-fade-in">
        <header className="rounded-[2rem] border border-white/40 bg-white/70 p-6 shadow-panel backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/65">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600 dark:text-sky-300">Open-Meteo dashboard</p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Your forecast at a glance</h1>
              <p className="mt-4 text-base text-slate-600 dark:text-slate-300">
                Current conditions, hourly trends, weekly outlooks, and weather alerts in a single responsive view.
              </p>
              {locationSummary && (
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Currently selected: {currentLocation?.name}, {locationSummary}</p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <ThemeToggle />
              <TemperatureToggle unit={unit} onChange={setUnit} />
            </div>
          </div>

          <div className="mt-6">
            <SearchBar
              key={currentLocation?.id ?? 'default-location'}
              currentLocationName={currentLocation?.name}
              onSelect={(location) => loadForecast(location)}
              onLocateMe={loadGeolocation}
              disabled={isLoading}
            />
          </div>
        </header>

        <section aria-labelledby="settings-panel-title" className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="rounded-3xl border border-white/40 bg-white/70 p-5 shadow-panel dark:border-white/10 dark:bg-slate-900/65">
            <h2 id="settings-panel-title" className="text-lg font-semibold">Settings & status</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Preferences are saved in your browser for theme and temperature units.
            </p>
            {statusMessage && (
              <p className="mt-4 rounded-2xl bg-sky-50 px-4 py-3 text-sm text-sky-700 dark:bg-sky-500/10 dark:text-sky-200">
                {statusMessage}
              </p>
            )}
            {error && (
              <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-200">
                {error}
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-white/40 bg-white/70 p-5 shadow-panel dark:border-white/10 dark:bg-slate-900/65">
            <h2 className="text-lg font-semibold">Dashboard features</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li>• Global city search with autocomplete</li>
              <li>• Automatic geolocation on load</li>
              <li>• Theme and unit preferences saved locally</li>
              <li>• Current weather, hourly trend, 5-day outlook, and alerts</li>
            </ul>
          </div>
        </section>

        <main className="mt-6 grid gap-6">
          {isLoading && <LoadingSpinner label="Fetching the latest forecast…" />}

          {!isLoading && weather && currentLocation && (
            <>
              <CurrentWeather
                location={currentLocation}
                current={weather.current}
                unit={unit}
                updatedAt={formatUpdatedAt(weather.updatedAt, weather.timezone)}
              />
              <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <HourlyForecast items={weather.hourly} unit={unit} />
                <WeatherAlerts alerts={weather.alerts} />
              </div>
              <DailyForecast items={weather.daily} unit={unit} />
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
