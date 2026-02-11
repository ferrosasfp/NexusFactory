import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { LoginForm } from '../components/LoginForm'

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}))

// Mock navigation
vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) =>
    <a href={href}>{children}</a>,
}))

// Mock auth actions with controllable fns
const mockLogin = vi.fn()
const mockSignInWithGoogle = vi.fn()

vi.mock('@/actions/auth', () => ({
  login: (...args: unknown[]) => mockLogin(...args),
  signInWithGoogle: (...args: unknown[]) => mockSignInWithGoogle(...args),
}))

describe('LoginForm', () => {
  beforeEach(() => {
    mockLogin.mockReset()
    mockSignInWithGoogle.mockReset()
  })

  afterEach(() => {
    cleanup()
  })

  // --- Render Tests ---

  it('renders email and password fields', () => {
    // Arrange & Act
    render(<LoginForm />)

    // Assert
    expect(screen.getByLabelText('email')).toBeInTheDocument()
    expect(screen.getByLabelText('password')).toBeInTheDocument()
  })

  it('renders submit button', () => {
    // Arrange & Act
    render(<LoginForm />)

    // Assert
    expect(screen.getByRole('button', { name: 'login' })).toBeInTheDocument()
  })

  it('renders Google sign-in button', () => {
    // Arrange & Act
    render(<LoginForm />)

    // Assert
    expect(screen.getByText('continueWithGoogle')).toBeInTheDocument()
  })

  it('renders forgot password link', () => {
    // Arrange & Act
    render(<LoginForm />)

    // Assert
    expect(screen.getByText('forgotPassword')).toBeInTheDocument()
  })

  // --- Interaction Tests ---

  it('calls login action on form submit', async () => {
    // Arrange
    mockLogin.mockResolvedValue({ error: 'test' })
    render(<LoginForm />)

    const emailInput = screen.getByLabelText('email')
    const passwordInput = screen.getByLabelText('password')

    // Act
    fireEvent.change(emailInput, { target: { value: 'user@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: 'login' }))

    // Assert
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledTimes(1)
    })

    const formData = mockLogin.mock.calls[0][0] as FormData
    expect(formData.get('email')).toBe('user@example.com')
    expect(formData.get('password')).toBe('password123')
    expect(formData.get('locale')).toBe('en')
  })

  it('displays error message from server action', async () => {
    // Arrange
    mockLogin.mockResolvedValue({ error: 'Invalid credentials' })
    render(<LoginForm />)

    const emailInput = screen.getByLabelText('email')
    const passwordInput = screen.getByLabelText('password')

    // Act
    fireEvent.change(emailInput, { target: { value: 'user@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(screen.getByRole('button', { name: 'login' }))

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
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
    render(<LoginForm />)

    // Act
    fireEvent.click(screen.getByText('continueWithGoogle'))

    // Assert - buttons show loading state and are disabled
    await waitFor(() => {
      const googleButton = screen.getByText('continueWithGoogle').closest('button')!
      expect(googleButton).toBeDisabled()
    })

    // The submit button should also be disabled due to shared loading state
    const submitButton = screen.getByRole('button', { name: 'signingIn' })
    expect(submitButton).toBeDisabled()

    // Cleanup - resolve the promise so React doesn't warn
    resolveGoogle!({ error: 'done' })
  })

  it('calls signInWithGoogle on Google button click', async () => {
    // Arrange
    mockSignInWithGoogle.mockResolvedValue({ error: 'OAuth failed' })
    render(<LoginForm />)

    // Act
    fireEvent.click(screen.getByText('continueWithGoogle'))

    // Assert
    await waitFor(() => {
      expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1)
      expect(mockSignInWithGoogle).toHaveBeenCalledWith('en')
    })
  })
})
