import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { SignupForm } from '../components/SignupForm'

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}))

// Mock auth actions with controllable fns
const mockSignup = vi.fn()
const mockSignInWithGoogle = vi.fn()

vi.mock('@/actions/auth', () => ({
  signup: (...args: unknown[]) => mockSignup(...args),
  signInWithGoogle: (...args: unknown[]) => mockSignInWithGoogle(...args),
}))

describe('SignupForm', () => {
  beforeEach(() => {
    mockSignup.mockReset()
    mockSignInWithGoogle.mockReset()
  })

  afterEach(() => {
    cleanup()
  })

  // --- Render Tests ---

  it('renders email and password fields', () => {
    // Arrange & Act
    render(<SignupForm />)

    // Assert
    expect(screen.getByLabelText('email')).toBeInTheDocument()
    expect(screen.getByLabelText('password')).toBeInTheDocument()
  })

  it('renders submit button', () => {
    // Arrange & Act
    render(<SignupForm />)

    // Assert
    expect(screen.getByRole('button', { name: 'signup' })).toBeInTheDocument()
  })

  it('renders Google sign-in button', () => {
    // Arrange & Act
    render(<SignupForm />)

    // Assert
    expect(screen.getByText('continueWithGoogle')).toBeInTheDocument()
  })

  // --- Interaction Tests ---

  it('calls signup action on form submit', async () => {
    // Arrange
    mockSignup.mockResolvedValue({ error: 'test' })
    render(<SignupForm />)

    const emailInput = screen.getByLabelText('email')
    const passwordInput = screen.getByLabelText('password')

    // Act
    fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'securepass123' } })
    fireEvent.click(screen.getByRole('button', { name: 'signup' }))

    // Assert
    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledTimes(1)
    })

    const formData = mockSignup.mock.calls[0][0] as FormData
    expect(formData.get('email')).toBe('newuser@example.com')
    expect(formData.get('password')).toBe('securepass123')
    expect(formData.get('locale')).toBe('en')
  })

  it('displays error from server action', async () => {
    // Arrange
    mockSignup.mockResolvedValue({ error: 'Email already registered' })
    render(<SignupForm />)

    const emailInput = screen.getByLabelText('email')
    const passwordInput = screen.getByLabelText('password')

    // Act
    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: 'signup' }))

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Email already registered')).toBeInTheDocument()
    })
  })

  it('shows loading state during Google sign-in', async () => {
    // Arrange - mock that never resolves to keep loading state visible
    // Note: We test loading via Google button (onClick) instead of form submit,
    // because React 19 form actions defer state updates until the action resolves.
    let resolveGoogle: (value: { error: string }) => void
    mockSignInWithGoogle.mockReturnValue(
      new Promise((resolve) => {
        resolveGoogle = resolve
      })
    )
    render(<SignupForm />)

    // Act
    fireEvent.click(screen.getByText('continueWithGoogle'))

    // Assert - Google button is disabled
    await waitFor(() => {
      const googleButton = screen.getByText('continueWithGoogle').closest('button')!
      expect(googleButton).toBeDisabled()
    })

    // The submit button should also be disabled and show loading text
    const submitButton = screen.getByRole('button', { name: 'creatingAccount' })
    expect(submitButton).toBeDisabled()

    // Cleanup - resolve the promise so React doesn't warn
    resolveGoogle!({ error: 'done' })
  })
})
