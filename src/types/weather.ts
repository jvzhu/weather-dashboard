export type TemperatureUnit = 'celsius' | 'fahrenheit'

export interface LocationSuggestion {
  id: string
  name: string
  country: string
  admin1?: string
  latitude: number
  longitude: number
  timezone?: string
}

export interface CurrentWeatherData {
  time: string
  temperature: number
  apparentTemperature: number
  humidity: number
  windSpeed: number
  uvIndex: number
  pressure: number
  visibility: number
  weatherCode: number
  isDay: number
  precipitation: number
}

export interface HourlyForecastItem {
  time: string
  temperature: number
  precipitationChance: number
  weatherCode: number
  windSpeed: number
}

export interface DailyForecastItem {
  date: string
  high: number
  low: number
  precipitationChance: number
  weatherCode: number
}

export interface WeatherAlert {
  id: string
  title: string
  severity: string
  description: string
  start?: string
  end?: string
  source?: string
}

export interface WeatherData {
  location: LocationSuggestion
  timezone: string
  current: CurrentWeatherData
  hourly: HourlyForecastItem[]
  daily: DailyForecastItem[]
  alerts: WeatherAlert[]
  updatedAt: string
}

export interface OpenMeteoGeocodingResponse {
  results?: Array<{
    id?: number
    name: string
    country: string
    admin1?: string
    latitude: number
    longitude: number
    timezone?: string
  }>
}

export interface OpenMeteoForecastResponse {
  timezone: string
  current: {
    time: string
    temperature_2m: number
    apparent_temperature: number
    relative_humidity_2m: number
    wind_speed_10m: number
    uv_index: number
    surface_pressure: number
    visibility: number
    weather_code: number
    is_day: number
    precipitation: number
    weather_alerts?: unknown
  }
  hourly: {
    time: string[]
    temperature_2m: number[]
    precipitation_probability: number[]
    weather_code: number[]
    wind_speed_10m: number[]
  }
  daily: {
    time: string[]
    weather_code: number[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    precipitation_probability_max: number[]
  }
  alerts?: unknown
  warnings?: unknown
}
