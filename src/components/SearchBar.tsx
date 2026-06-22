/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { searchLocations } from '../services/weatherApi.ts'
import type { LocationSuggestion } from '../types/weather.ts'

interface SearchBarProps {
  currentLocationName?: string
  onSelect: (location: LocationSuggestion) => Promise<void> | void
  onLocateMe: () => void
  disabled?: boolean
}

export const SearchBar = ({ currentLocationName, onSelect, onLocateMe, disabled = false }: SearchBarProps) => {
  const [query, setQuery] = useState(currentLocationName ?? '')
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [isOpen, setIsOpen] = useState(false)
  const listboxId = useId()
  const requestId = useRef(0)

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      return
    }

    const currentRequest = ++requestId.current
    setIsLoading(true)
    const timeout = window.setTimeout(async () => {
      try {
        const results = await searchLocations(trimmed)
        if (requestId.current === currentRequest) {
          setSuggestions(results)
          setActiveIndex(results.length > 0 ? 0 : -1)
          setIsOpen(true)
        }
      } catch {
        if (requestId.current === currentRequest) {
          setSuggestions([])
        }
      } finally {
        if (requestId.current === currentRequest) {
          setIsLoading(false)
        }
      }
    }, 250)

    return () => window.clearTimeout(timeout)
  }, [query])

  const activeSuggestion = useMemo(
    () => (activeIndex >= 0 ? suggestions[activeIndex] : undefined),
    [activeIndex, suggestions],
  )

  const selectLocation = async (location: LocationSuggestion) => {
    setQuery(location.name)
    setSuggestions([])
    setIsOpen(false)
    setActiveIndex(-1)
    await onSelect(location)
  }

  return (
    <div className="relative w-full max-w-3xl">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="city-search">Search by city</label>
        <div className="relative flex-1">
          <input
            id="city-search"
            type="search"
            value={query}
            disabled={disabled}
            placeholder="Search any city worldwide"
            aria-label="Search city"
            aria-autocomplete="list"
            aria-controls={listboxId}
            aria-expanded={isOpen && suggestions.length > 0}
            aria-activedescendant={activeSuggestion ? `${listboxId}-${activeSuggestion.id}` : undefined}
            onFocus={() => setIsOpen(suggestions.length > 0)}
            onChange={(event) => {
              const nextQuery = event.target.value
              setQuery(nextQuery)

              if (nextQuery.trim().length < 2) {
                setSuggestions([])
                setActiveIndex(-1)
                setIsOpen(false)
                setIsLoading(false)
              }
            }}
            onKeyDown={async (event) => {
              if (event.key === 'ArrowDown') {
                event.preventDefault()
                setActiveIndex((current) => Math.min(current + 1, suggestions.length - 1))
              } else if (event.key === 'ArrowUp') {
                event.preventDefault()
                setActiveIndex((current) => Math.max(current - 1, 0))
              } else if (event.key === 'Enter') {
                event.preventDefault()
                if (activeSuggestion) {
                  await selectLocation(activeSuggestion)
                } else if (suggestions[0]) {
                  await selectLocation(suggestions[0])
                }
              } else if (event.key === 'Escape') {
                setIsOpen(false)
              }
            }}
            className="w-full rounded-full border border-white/60 bg-white/90 px-5 py-3 text-slate-900 shadow-panel outline-none ring-0 transition placeholder:text-slate-400 focus:border-sky-400 dark:border-white/10 dark:bg-slate-900/80 dark:text-white"
          />
          {isLoading && (
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm text-slate-400">Loading…</span>
          )}
        </div>
        <button
          type="button"
          onClick={onLocateMe}
          disabled={disabled}
          className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-600 disabled:cursor-not-allowed disabled:opacity-70 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100"
        >
          Use my location
        </button>
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-10 mt-3 w-full overflow-hidden rounded-3xl border border-slate-200 bg-white/95 shadow-panel dark:border-white/10 dark:bg-slate-900/95"
        >
          {suggestions.map((location, index) => {
            const selected = index === activeIndex

            return (
              <li key={location.id} id={`${listboxId}-${location.id}`} role="option" aria-selected={selected}>
                <button
                  type="button"
                  className={`flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition ${
                    selected ? 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-200' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => void selectLocation(location)}
                >
                  <span>
                    <span className="block font-semibold">{location.name}</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {[location.admin1, location.country].filter(Boolean).join(', ')}
                    </span>
                  </span>
                  <span className="text-xs uppercase tracking-[0.3em] text-slate-400">Select</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
