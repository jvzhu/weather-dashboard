import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeToggle } from '../../components/ThemeToggle.tsx'
import { ThemeProvider } from '../../context/ThemeContext.tsx'

const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider>{ui}</ThemeProvider>)

beforeEach(() => {
  localStorage.clear()
  // Reset matchMedia mock to return light mode (matches: false) by default
  vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
})

describe('ThemeToggle', () => {
  it('renders a toggle button', () => {
    renderWithTheme(<ThemeToggle />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('has an accessible aria-label', () => {
    renderWithTheme(<ThemeToggle />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label')
  })

  it('shows "Switch to dark theme" label when in light mode', () => {
    renderWithTheme(<ThemeToggle />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Switch to dark theme')
  })

  it('switches theme on button click', async () => {
    renderWithTheme(<ThemeToggle />)
    const button = screen.getByRole('button')
    const initialLabel = button.getAttribute('aria-label')

    await userEvent.click(button)

    // After toggle, aria-label should change
    expect(button.getAttribute('aria-label')).not.toBe(initialLabel)
  })

  it('displays the correct icon and text in light mode', () => {
    renderWithTheme(<ThemeToggle />)
    // In light mode, shows ☀️ icon and "Light mode" text
    expect(screen.getByText('☀️')).toBeInTheDocument()
    expect(screen.getByText('Light mode')).toBeInTheDocument()
  })

  it('displays dark mode icon and text after toggling to dark', async () => {
    renderWithTheme(<ThemeToggle />)
    await userEvent.click(screen.getByRole('button'))
    expect(screen.getByText('🌙')).toBeInTheDocument()
    expect(screen.getByText('Dark mode')).toBeInTheDocument()
  })

  it('shows dark mode when localStorage has dark theme saved', () => {
    localStorage.setItem('weather-dashboard-theme', 'dark')
    renderWithTheme(<ThemeToggle />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Switch to light theme')
  })
})

