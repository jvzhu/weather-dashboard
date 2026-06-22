import { describe, it, expect } from 'vitest'
import { getWeatherPresentation } from '../utils/weatherIcons.ts'

describe('getWeatherPresentation', () => {
  it('returns clear sky for code 0 during day', () => {
    const result = getWeatherPresentation(0, true)
    expect(result.icon).toBe('☀️')
    expect(result.label).toBe('Clear sky')
    expect(result.gradient).toContain('amber')
  })

  it('returns night icon for code 0 during night', () => {
    const result = getWeatherPresentation(0, false)
    expect(result.icon).toBe('🌙')
    expect(result.label).toBe('Clear sky')
  })

  it('returns partly cloudy for code 1', () => {
    const result = getWeatherPresentation(1, true)
    expect(result.label).toBe('Partly cloudy')
  })

  it('returns partly cloudy for code 2', () => {
    const result = getWeatherPresentation(2, true)
    expect(result.label).toBe('Partly cloudy')
  })

  it('returns overcast for code 3', () => {
    const result = getWeatherPresentation(3, true)
    expect(result.label).toBe('Overcast')
    expect(result.icon).toBe('☁️')
  })

  it('returns foggy for code 45', () => {
    const result = getWeatherPresentation(45, true)
    expect(result.label).toBe('Foggy')
  })

  it('returns foggy for code 48', () => {
    const result = getWeatherPresentation(48, true)
    expect(result.label).toBe('Foggy')
  })

  it('returns drizzle for code 51', () => {
    const result = getWeatherPresentation(51, true)
    expect(result.label).toBe('Drizzle')
  })

  it('returns rain for code 61', () => {
    const result = getWeatherPresentation(61, true)
    expect(result.label).toBe('Rain')
  })

  it('returns rain for code 80 (showers)', () => {
    const result = getWeatherPresentation(80, true)
    expect(result.label).toBe('Rain')
  })

  it('returns snow for code 71', () => {
    const result = getWeatherPresentation(71, true)
    expect(result.label).toBe('Snow')
    expect(result.icon).toBe('❄️')
  })

  it('returns thunderstorm for code 95', () => {
    const result = getWeatherPresentation(95, true)
    expect(result.label).toBe('Thunderstorm')
    expect(result.icon).toBe('⛈️')
  })

  it('returns thunderstorm for code 99', () => {
    const result = getWeatherPresentation(99, true)
    expect(result.label).toBe('Thunderstorm')
  })

  it('returns fallback for unknown code', () => {
    const result = getWeatherPresentation(999, true)
    expect(result.icon).toBe('🌤️')
    expect(result.label).toBe('Variable conditions')
  })

  it('falls back to day icon when no night icon is specified', () => {
    // Code 3 (overcast) has no nightIcon, should use dayIcon
    const day = getWeatherPresentation(3, true)
    const night = getWeatherPresentation(3, false)
    expect(night.icon).toBe(day.icon)
  })

  it('defaults isDay to true when not provided', () => {
    const withDefault = getWeatherPresentation(0)
    const withExplicitDay = getWeatherPresentation(0, true)
    expect(withDefault.icon).toBe(withExplicitDay.icon)
  })
})
