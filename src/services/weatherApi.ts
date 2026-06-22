import type {
  LocationSuggestion,
  OpenMeteoForecastResponse,
  OpenMeteoGeocodingResponse,
  WeatherAlert,
  WeatherData,
} from '../types/weather.ts'

const GEOCODING_API = 'https://geocoding-api.open-meteo.com/v1'
const FORECAST_API = 'https://api.open-meteo.com/v1/forecast'
const CACHE_PREFIX = 'weather-dashboard-cache:'
const TEN_MINUTES = 1000 * 60 * 10
const DAY = 1000 * 60 * 60 * 24

interface CacheEntry<T> {
  expiresAt: number
  value: T
}

const readCache = <T,>(key: string): T | null => {
  const raw = window.localStorage.getItem(`${CACHE_PREFIX}${key}`)
  if (!raw) {
    return null
  }

  try {
    const entry = JSON.parse(raw) as CacheEntry<T>
    if (Date.now() > entry.expiresAt) {
      window.localStorage.removeItem(`${CACHE_PREFIX}${key}`)
      return null
    }

    return entry.value
  } catch {
    window.localStorage.removeItem(`${CACHE_PREFIX}${key}`)
    return null
  }
}

const writeCache = <T,>(key: string, value: T, ttl: number) => {
  const entry: CacheEntry<T> = {
    value,
    expiresAt: Date.now() + ttl,
  }

  window.localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry))
}

const fetchJson = async <T,>(url: string): Promise<T> => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return (await response.json()) as T
}

const toLocationSuggestion = (result: NonNullable<OpenMeteoGeocodingResponse['results']>[number]): LocationSuggestion => ({
  id: `${result.name}-${result.latitude}-${result.longitude}`,
  name: result.name,
  country: result.country,
  admin1: result.admin1,
  latitude: result.latitude,
  longitude: result.longitude,
  timezone: result.timezone,
})

const normalizeAlerts = (payload: unknown): WeatherAlert[] => {
  if (!payload) {
    return []
  }

  const candidate = Array.isArray(payload)
    ? payload
    : typeof payload === 'object' && payload !== null
      ? 'features' in payload && Array.isArray((payload as { features?: unknown }).features)
        ? (payload as { features: unknown[] }).features
        : Object.values(payload as Record<string, unknown>).find(Array.isArray) ?? []
      : []

  if (!Array.isArray(candidate)) {
    return []
  }

  return candidate
    .map<WeatherAlert | null>((item, index) => {
      const record = item as Record<string, unknown>
      const properties = (record.properties as Record<string, unknown> | undefined) ?? record
      const headline = properties.headline ?? properties.event ?? properties.title ?? properties.name
      const description = properties.description ?? properties.desc ?? properties.instruction ?? properties.summary
      const severity = properties.severity ?? properties.level ?? properties.urgency ?? 'advisory'
      const start = properties.start ?? properties.onset
      const end = properties.end ?? properties.expires
      const source = properties.sender_name ?? properties.source ?? properties.authority

      if (!headline && !description) {
        return null
      }

      return {
        id: String(record.id ?? properties.id ?? `${headline ?? 'alert'}-${index}`),
        title: String(headline ?? 'Weather alert'),
        description: String(description ?? 'Severe conditions may affect this location.'),
        severity: String(severity),
        start: start ? String(start) : undefined,
        end: end ? String(end) : undefined,
        source: source ? String(source) : undefined,
      }
    })
    .filter((alert): alert is WeatherAlert => alert !== null)
}

export const searchLocations = async (query: string): Promise<LocationSuggestion[]> => {
  const normalizedQuery = query.trim()
  if (normalizedQuery.length < 2) {
    return []
  }

  const cacheKey = `search:${normalizedQuery.toLowerCase()}`
  const cached = readCache<LocationSuggestion[]>(cacheKey)
  if (cached) {
    return cached
  }

  const params = new URLSearchParams({
    name: normalizedQuery,
    count: '6',
    language: 'en',
    format: 'json',
  })

  const response = await fetchJson<OpenMeteoGeocodingResponse>(`${GEOCODING_API}/search?${params.toString()}`)
  const results = (response.results ?? []).map(toLocationSuggestion)
  writeCache(cacheKey, results, DAY)
  return results
}

export const reverseGeocode = async (latitude: number, longitude: number): Promise<LocationSuggestion | null> => {
  const cacheKey = `reverse:${latitude.toFixed(3)}:${longitude.toFixed(3)}`
  const cached = readCache<LocationSuggestion>(cacheKey)
  if (cached) {
    return cached
  }

  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    count: '1',
    language: 'en',
    format: 'json',
  })

  const response = await fetchJson<OpenMeteoGeocodingResponse>(`${GEOCODING_API}/reverse?${params.toString()}`)
  const location = response.results?.[0] ? toLocationSuggestion(response.results[0]) : null

  if (location) {
    writeCache(cacheKey, location, DAY)
  }

  return location
}

const fetchAlerts = async (latitude: number, longitude: number): Promise<WeatherAlert[]> => {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    timezone: 'auto',
    alerts: 'true',
  })

  try {
    const response = await fetchJson<Record<string, unknown>>(`${FORECAST_API}?${params.toString()}`)
    return normalizeAlerts(response.alerts ?? response.warnings ?? response.current)
  } catch {
    return []
  }
}

export const fetchWeather = async (location: LocationSuggestion): Promise<WeatherData> => {
  const cacheKey = `forecast:${location.latitude.toFixed(3)}:${location.longitude.toFixed(3)}`
  const cached = readCache<WeatherData>(cacheKey)
  if (cached) {
    return cached
  }

  const params = new URLSearchParams({
    latitude: location.latitude.toString(),
    longitude: location.longitude.toString(),
    timezone: 'auto',
    current:
      'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,uv_index,surface_pressure,visibility,weather_code,is_day,precipitation',
    hourly: 'temperature_2m,precipitation_probability,weather_code,wind_speed_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    forecast_days: '5',
  })

  const [forecastResponse, alerts] = await Promise.all([
    fetchJson<OpenMeteoForecastResponse>(`${FORECAST_API}?${params.toString()}`),
    fetchAlerts(location.latitude, location.longitude),
  ])

  const weather: WeatherData = {
    location,
    timezone: forecastResponse.timezone,
    current: {
      time: forecastResponse.current.time,
      temperature: forecastResponse.current.temperature_2m,
      apparentTemperature: forecastResponse.current.apparent_temperature,
      humidity: forecastResponse.current.relative_humidity_2m,
      windSpeed: forecastResponse.current.wind_speed_10m,
      uvIndex: forecastResponse.current.uv_index,
      pressure: forecastResponse.current.surface_pressure,
      visibility: forecastResponse.current.visibility,
      weatherCode: forecastResponse.current.weather_code,
      isDay: forecastResponse.current.is_day,
      precipitation: forecastResponse.current.precipitation,
    },
    hourly: forecastResponse.hourly.time.slice(0, 24).map((time, index) => ({
      time,
      temperature: forecastResponse.hourly.temperature_2m[index],
      precipitationChance: forecastResponse.hourly.precipitation_probability[index],
      weatherCode: forecastResponse.hourly.weather_code[index],
      windSpeed: forecastResponse.hourly.wind_speed_10m[index],
    })),
    daily: forecastResponse.daily.time.slice(0, 5).map((date, index) => ({
      date,
      high: forecastResponse.daily.temperature_2m_max[index],
      low: forecastResponse.daily.temperature_2m_min[index],
      precipitationChance: forecastResponse.daily.precipitation_probability_max[index],
      weatherCode: forecastResponse.daily.weather_code[index],
    })),
    alerts,
    updatedAt: forecastResponse.current.time,
  }

  writeCache(cacheKey, weather, TEN_MINUTES)
  return weather
}
