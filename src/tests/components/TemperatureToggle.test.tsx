import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TemperatureToggle } from '../../components/TemperatureToggle.tsx'

describe('TemperatureToggle', () => {
  it('renders both °C and °F buttons', () => {
    render(<TemperatureToggle unit="celsius" onChange={vi.fn()} />)
    expect(screen.getByText('°C')).toBeInTheDocument()
    expect(screen.getByText('°F')).toBeInTheDocument()
  })

  it('marks the active unit button as pressed', () => {
    render(<TemperatureToggle unit="celsius" onChange={vi.fn()} />)
    const celsiusBtn = screen.getByText('°C').closest('button')!
    const fahrenheitBtn = screen.getByText('°F').closest('button')!
    expect(celsiusBtn).toHaveAttribute('aria-pressed', 'true')
    expect(fahrenheitBtn).toHaveAttribute('aria-pressed', 'false')
  })

  it('marks fahrenheit as pressed when unit is fahrenheit', () => {
    render(<TemperatureToggle unit="fahrenheit" onChange={vi.fn()} />)
    const celsiusBtn = screen.getByText('°C').closest('button')!
    const fahrenheitBtn = screen.getByText('°F').closest('button')!
    expect(celsiusBtn).toHaveAttribute('aria-pressed', 'false')
    expect(fahrenheitBtn).toHaveAttribute('aria-pressed', 'true')
  })

  it('calls onChange with "fahrenheit" when °F is clicked', async () => {
    const onChange = vi.fn()
    render(<TemperatureToggle unit="celsius" onChange={onChange} />)

    await userEvent.click(screen.getByText('°F'))
    expect(onChange).toHaveBeenCalledWith('fahrenheit')
  })

  it('calls onChange with "celsius" when °C is clicked', async () => {
    const onChange = vi.fn()
    render(<TemperatureToggle unit="fahrenheit" onChange={onChange} />)

    await userEvent.click(screen.getByText('°C'))
    expect(onChange).toHaveBeenCalledWith('celsius')
  })

  it('has accessible role group with label', () => {
    render(<TemperatureToggle unit="celsius" onChange={vi.fn()} />)
    expect(screen.getByRole('group', { name: /temperature unit toggle/i })).toBeInTheDocument()
  })
})
