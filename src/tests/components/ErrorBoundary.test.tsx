import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ErrorBoundary } from '../../components/ErrorBoundary.tsx'

const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>Content rendered successfully</div>
}

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Content rendered successfully')).toBeInTheDocument()
  })

  it('renders the error UI when a child throws', () => {
    // Suppress console.error for this test since ErrorBoundary calls it
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow />
      </ErrorBoundary>,
    )

    expect(screen.getByText(/the forecast hit turbulence/i)).toBeInTheDocument()
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    consoleSpy.mockRestore()
  })

  it('displays a refresh prompt in the error UI', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow />
      </ErrorBoundary>,
    )

    expect(screen.getByText(/refresh the page/i)).toBeInTheDocument()
    consoleSpy.mockRestore()
  })

  it('logs the error to console when a child throws', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow />
      </ErrorBoundary>,
    )

    expect(consoleSpy).toHaveBeenCalledWith(
      'Weather dashboard crashed',
      expect.any(Error),
      expect.any(Object),
    )
    consoleSpy.mockRestore()
  })
})
