import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchBar } from '../../components/SearchBar.tsx'
import type { LocationSuggestion } from '../../types/weather.ts'

// Mock the weatherApi module
vi.mock('../../services/weatherApi.ts', () => ({
  searchLocations: vi.fn(),
}))

import { searchLocations } from '../../services/weatherApi.ts'

const mockSearchLocations = vi.mocked(searchLocations)

const mockSuggestions: LocationSuggestion[] = [
  {
    id: 'london-51.5-0.1',
    name: 'London',
    country: 'United Kingdom',
    admin1: 'England',
    latitude: 51.5,
    longitude: -0.1,
    timezone: 'Europe/London',
  },
  {
    id: 'london-on-42.9-81.2',
    name: 'London',
    country: 'Canada',
    admin1: 'Ontario',
    latitude: 42.9,
    longitude: -81.2,
    timezone: 'America/Toronto',
  },
]

beforeEach(() => {
  vi.clearAllMocks()
})

describe('SearchBar', () => {
  it('renders the search input', () => {
    render(
      <SearchBar onSelect={vi.fn()} onLocateMe={vi.fn()} />,
    )
    expect(screen.getByRole('searchbox')).toBeInTheDocument()
  })

  it('renders the "Use my location" button', () => {
    render(
      <SearchBar onSelect={vi.fn()} onLocateMe={vi.fn()} />,
    )
    expect(screen.getByText('Use my location')).toBeInTheDocument()
  })

  it('calls onLocateMe when "Use my location" is clicked', async () => {
    const onLocateMe = vi.fn()
    render(<SearchBar onSelect={vi.fn()} onLocateMe={onLocateMe} />)

    await userEvent.click(screen.getByText('Use my location'))
    expect(onLocateMe).toHaveBeenCalledTimes(1)
  })

  it('shows initial city name when currentLocationName is provided', () => {
    render(
      <SearchBar currentLocationName="New York" onSelect={vi.fn()} onLocateMe={vi.fn()} />,
    )
    expect(screen.getByRole('searchbox')).toHaveValue('New York')
  })

  it('disables input and button when disabled prop is true', () => {
    render(
      <SearchBar onSelect={vi.fn()} onLocateMe={vi.fn()} disabled />,
    )
    expect(screen.getByRole('searchbox')).toBeDisabled()
    expect(screen.getByText('Use my location')).toBeDisabled()
  })

  it('shows suggestions after typing 2+ characters', async () => {
    mockSearchLocations.mockResolvedValue(mockSuggestions)

    render(<SearchBar onSelect={vi.fn()} onLocateMe={vi.fn()} />)

    await userEvent.type(screen.getByRole('searchbox'), 'Lo')

    await waitFor(() => {
      expect(screen.getAllByRole('option')).toHaveLength(mockSuggestions.length)
    }, { timeout: 1000 })
  })

  it('does not call searchLocations for a single character', async () => {
    render(<SearchBar onSelect={vi.fn()} onLocateMe={vi.fn()} />)

    await userEvent.type(screen.getByRole('searchbox'), 'L')

    // Wait briefly to ensure no debounced calls fire
    await new Promise((r) => setTimeout(r, 300))
    expect(mockSearchLocations).not.toHaveBeenCalled()
  })

  it('calls onSelect when a suggestion is clicked', async () => {
    mockSearchLocations.mockResolvedValue(mockSuggestions)
    const onSelect = vi.fn()

    render(<SearchBar onSelect={onSelect} onLocateMe={vi.fn()} />)

    await userEvent.type(screen.getByRole('searchbox'), 'Lo')

    await waitFor(() => {
      expect(screen.getAllByRole('option')).toHaveLength(mockSuggestions.length)
    }, { timeout: 1000 })

    const firstOption = screen.getAllByRole('option')[0]
    await userEvent.click(firstOption.querySelector('button')!)

    expect(onSelect).toHaveBeenCalledWith(mockSuggestions[0])
  })

  it('closes suggestions on Escape key', async () => {
    mockSearchLocations.mockResolvedValue(mockSuggestions)

    render(<SearchBar onSelect={vi.fn()} onLocateMe={vi.fn()} />)

    await userEvent.type(screen.getByRole('searchbox'), 'Lo')

    await waitFor(() => {
      expect(screen.getAllByRole('option')).toHaveLength(mockSuggestions.length)
    }, { timeout: 1000 })

    await userEvent.keyboard('{Escape}')

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })
})
