import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SignupForm } from '../components/SignupForm'

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}))

// Mock auth actions
vi.mock('@/actions/auth', () => ({
  signup: vi.fn(),
  signInWithGoogle: vi.fn(),
}))

describe('SignupForm', () => {
  it('renders email and password fields', () => {
    render(<SignupForm />)
    expect(screen.getByLabelText('email')).toBeInTheDocument()
    expect(screen.getByLabelText('password')).toBeInTheDocument()
  })

  it('renders submit button', () => {
    render(<SignupForm />)
    const buttons = screen.getAllByRole('button', { name: 'signup' })
    expect(buttons.length).toBeGreaterThanOrEqual(1)
  })

  it('renders Google sign-in button', () => {
    render(<SignupForm />)
    const buttons = screen.getAllByText('continueWithGoogle')
    expect(buttons.length).toBeGreaterThanOrEqual(1)
  })
})
