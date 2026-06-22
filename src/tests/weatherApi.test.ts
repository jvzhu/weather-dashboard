import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { searchLocations, reverseGeocode, fetchWeather } from '../services/weatherApi.ts'
import type { OpenMeteoForecastResponse, OpenMeteoGeocodingResponse } from '../types/weather.ts'

const makeForecastResponse = (): OpenMeteoForecastResponse => ({
  timezone: 'America/New_York',
  current: {
    time: '2024-01-15T12:00',
    temperature_2m: 20,
    apparent_temperature: 18,
    relative_humidity_2m: 65,
    wind_speed_10m: 10,
    uv_index: 3,
    surface_pressure: 1013,
    visibility: 10000,
    weather_code: 0,
    is_day: 1,
    precipitation: 0,
  },
  hourly: {
    time: Array.from({ length: 24 }, (_, i) => `2024-01-15T${String(i).padStart(2, '0')}:00`),
    temperature_2m: Array.from({ length: 24 }, (_, i) => 18 + i * 0.2),
    precipitation_probability: Array.from({ length: 24 }, () => 10),
    weather_code: Array.from({ length: 24 }, () => 0),
    wind_speed_10m: Array.from({ length: 24 }, () => 10),
  },
  daily: {
    time: ['2024-01-15', '2024-01-16', '2024-01-17', '2024-01-18', '2024-01-19'],
    weather_code: [0, 1, 2, 3, 61],
    temperature_2m_max: [22, 20, 19, 18, 15],
    temperature_2m_min: [10, 9, 8, 7, 6],
    precipitation_probability_max: [5, 10, 15, 20, 60],
  },
})

const makeGeocodingResponse = (count = 1): OpenMeteoGeocodingResponse => ({
  results: Array.from({ length: count }, (_, i) => ({
    name: `City ${i}`,
    country: 'US',
    admin1: 'State',
    latitude: 40 + i,
    longitude: -74 + i,
    timezone: 'America/New_York',
  })),
})

const TEST_LOCATION = {
  id: 'test-40-74',
  name: 'Test City',
  country: 'US',
  admin1: 'Test State',
  latitude: 40,
  longitude: -74,
  timezone: 'America/New_York',
}

beforeEach(() => {
  // Reset localStorage before each test
  localStorage.clear()
  vi.resetAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('searchLocations', () => {
  it('returns empty array for queries shorter than 2 characters', async () => {
    const result = await searchLocations('a')
    expect(result).toEqual([])
  })

  it('returns empty array for empty query', async () => {
    const result = await searchLocations('')
    expect(result).toEqual([])
  })

  it('returns empty array for whitespace-only query', async () => {
    const result = await searchLocations('  ')
    expect(result).toEqual([])
  })

  it('fetches and maps location results', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(makeGeocodingResponse(2)),
    })
    vi.stubGlobal('fetch', mockFetch)

    const results = await searchLocations('New York')
    expect(results).toHaveLength(2)
    expect(results[0].name).toBe('City 0')
    expect(results[0].latitude).toBe(40)
    expect(results[0].longitude).toBe(-74)
  })

  it('handles empty results from API', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ results: [] }),
    })
    vi.stubGlobal('fetch', mockFetch)

    const results = await searchLocations('unknown city xyz')
    expect(results).toEqual([])
  })

  it('handles missing results field from API', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    })
    vi.stubGlobal('fetch', mockFetch)

    const results = await searchLocations('test city')
    expect(results).toEqual([])
  })

  it('caches results and reuses them on subsequent calls', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(makeGeocodingResponse(1)),
    })
    vi.stubGlobal('fetch', mockFetch)

    await searchLocations('London')
    await searchLocations('London')

    // Should only fetch once due to caching
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('throws on HTTP error', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    })
    vi.stubGlobal('fetch', mockFetch)

    await expect(searchLocations('Berlin')).rejects.toThrow('Request failed with status 500')
  })
})

describe('reverseGeocode', () => {
  it('returns a location suggestion for valid coordinates', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(makeGeocodingResponse(1)),
    })
    vi.stubGlobal('fetch', mockFetch)

    const result = await reverseGeocode(40, -74)
    expect(result).not.toBeNull()
    expect(result?.name).toBe('City 0')
  })

  it('returns null when API returns no results', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ results: [] }),
    })
    vi.stubGlobal('fetch', mockFetch)

    const result = await reverseGeocode(0, 0)
    expect(result).toBeNull()
  })

  it('returns null when results field is missing', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    })
    vi.stubGlobal('fetch', mockFetch)

    const result = await reverseGeocode(0, 0)
    expect(result).toBeNull()
  })
})

describe('fetchWeather', () => {
  it('fetches and transforms weather data correctly', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(makeForecastResponse()),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ alerts: [] }),
      })
    vi.stubGlobal('fetch', mockFetch)

    const data = await fetchWeather(TEST_LOCATION, { persistToStorage: false })

    expect(data.current.temperature).toBe(20)
    expect(data.current.humidity).toBe(65)
    expect(data.current.weatherCode).toBe(0)
    expect(data.hourly).toHaveLength(24)
    expect(data.daily).toHaveLength(5)
    expect(data.timezone).toBe('America/New_York')
  })

  it('maps hourly data correctly', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(makeForecastResponse()),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      })
    vi.stubGlobal('fetch', mockFetch)

    const data = await fetchWeather(TEST_LOCATION, { persistToStorage: false })
    expect(data.hourly[0].time).toBe('2024-01-15T00:00')
    expect(data.hourly[0].precipitationChance).toBe(10)
    expect(data.hourly[0].windSpeed).toBe(10)
  })

  it('maps daily data correctly', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(makeForecastResponse()),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      })
    vi.stubGlobal('fetch', mockFetch)

    const data = await fetchWeather(TEST_LOCATION, { persistToStorage: false })
    expect(data.daily[0].date).toBe('2024-01-15')
    expect(data.daily[0].high).toBe(22)
    expect(data.daily[0].low).toBe(10)
    expect(data.daily).toHaveLength(5)
  })

  it('caches data and returns cached result on subsequent calls', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(makeForecastResponse()),
      })
    vi.stubGlobal('fetch', mockFetch)

    await fetchWeather(TEST_LOCATION)
    await fetchWeather(TEST_LOCATION)

    // Forecast + alerts = 2 calls; second fetchWeather call should use cache
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it('skips cache when persistToStorage is false', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(makeForecastResponse()),
      })
    vi.stubGlobal('fetch', mockFetch)

    await fetchWeather(TEST_LOCATION, { persistToStorage: false })
    await fetchWeather(TEST_LOCATION, { persistToStorage: false })

    // Should fetch twice since no caching
    expect(mockFetch).toHaveBeenCalledTimes(4)
  })

  it('includes empty alerts when API returns none', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(makeForecastResponse()),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      })
    vi.stubGlobal('fetch', mockFetch)

    const data = await fetchWeather(TEST_LOCATION, { persistToStorage: false })
    expect(data.alerts).toEqual([])
  })
})
