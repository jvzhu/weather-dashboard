export interface WeatherPresentation {
  icon: string
  label: string
  gradient: string
}

const weatherMap: Array<{
  codes: number[]
  dayIcon: string
  nightIcon?: string
  label: string
  gradient: string
}> = [
  { codes: [0], dayIcon: '☀️', nightIcon: '🌙', label: 'Clear sky', gradient: 'from-amber-300 via-orange-300 to-rose-300' },
  { codes: [1, 2], dayIcon: '⛅', nightIcon: '☁️', label: 'Partly cloudy', gradient: 'from-sky-300 via-cyan-200 to-blue-300' },
  { codes: [3], dayIcon: '☁️', label: 'Overcast', gradient: 'from-slate-300 via-slate-200 to-slate-300' },
  { codes: [45, 48], dayIcon: '🌫️', label: 'Foggy', gradient: 'from-slate-200 via-slate-300 to-slate-400' },
  { codes: [51, 53, 55, 56, 57], dayIcon: '🌦️', label: 'Drizzle', gradient: 'from-cyan-200 via-sky-300 to-blue-400' },
  { codes: [61, 63, 65, 66, 67, 80, 81, 82], dayIcon: '🌧️', label: 'Rain', gradient: 'from-blue-300 via-indigo-300 to-slate-400' },
  { codes: [71, 73, 75, 77, 85, 86], dayIcon: '❄️', label: 'Snow', gradient: 'from-slate-100 via-cyan-100 to-blue-200' },
  { codes: [95, 96, 99], dayIcon: '⛈️', label: 'Thunderstorm', gradient: 'from-slate-500 via-indigo-500 to-purple-500' },
]

export const getWeatherPresentation = (weatherCode: number, isDay = true): WeatherPresentation => {
  const entry = weatherMap.find((item) => item.codes.includes(weatherCode))

  if (!entry) {
    return {
      icon: '🌤️',
      label: 'Variable conditions',
      gradient: 'from-sky-200 via-blue-200 to-indigo-300',
    }
  }

  return {
    icon: isDay ? entry.dayIcon : entry.nightIcon ?? entry.dayIcon,
    label: entry.label,
    gradient: entry.gradient,
  }
}
