import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
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

// Mock auth actions
vi.mock('@/actions/auth', () => ({
  login: vi.fn(),
  signInWithGoogle: vi.fn(),
}))

describe('LoginForm', () => {
  it('renders email and password fields', () => {
    render(<LoginForm />)
    expect(screen.getByLabelText('email')).toBeInTheDocument()
    expect(screen.getByLabelText('password')).toBeInTheDocument()
  })

  it('renders submit button', () => {
    render(<LoginForm />)
    const buttons = screen.getAllByRole('button', { name: 'login' })
    expect(buttons.length).toBeGreaterThanOrEqual(1)
  })

  it('renders Google sign-in button', () => {
    render(<LoginForm />)
    const buttons = screen.getAllByText('continueWithGoogle')
    expect(buttons.length).toBeGreaterThanOrEqual(1)
  })

  it('renders forgot password link', () => {
    render(<LoginForm />)
    const links = screen.getAllByText('forgotPassword')
    expect(links.length).toBeGreaterThanOrEqual(1)
  })
})
