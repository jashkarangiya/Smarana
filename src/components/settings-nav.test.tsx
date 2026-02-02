import { render, screen } from '@testing-library/react'
import { SettingsNav } from './settings-nav'
import { describe, it, expect, vi } from 'vitest'

// Mock usePathname
vi.mock('next/navigation', () => ({
    usePathname: vi.fn(() => '/profile'),
}))

import { usePathname } from 'next/navigation'

describe('SettingsNav', () => {
    it('renders all navigation items', () => {
        render(<SettingsNav />)
        expect(screen.getByText('Basic Info')).toBeInTheDocument()
        expect(screen.getByText('Platforms')).toBeInTheDocument()
        expect(screen.getByText('Visibility')).toBeInTheDocument()
        expect(screen.getByText('Accounts')).toBeInTheDocument()
    })

    it('highlights the active link based on pathname', () => {
        // Current mock returns '/profile'
        render(<SettingsNav />)

        // Basic Info should have active class (roughly checking for primary color class or aria-current)
        const basicInfoLink = screen.getByRole('link', { name: /Basic Info/i })
        expect(basicInfoLink).toHaveAttribute('aria-current', 'page')

        // Platforms should NOT have active class
        const platformsLink = screen.getByRole('link', { name: /Platforms/i })
        expect(platformsLink).not.toHaveAttribute('aria-current')
    })

    it('highlights correct link when pathname changes', () => {
        // Mock change to /profile/visibility
        vi.mocked(usePathname).mockReturnValue('/profile/visibility')

        // Re-render (testing library cleanup happens automatically)
        // Note: In real app, re-render might keep DOM, but here we just render again
        // To be clean, we can rely on cleanup or just render
        const { unmount } = render(<SettingsNav />)

        const visibilityLink = screen.getByRole('link', { name: /Visibility/i })
        expect(visibilityLink).toHaveAttribute('aria-current', 'page')

        const basicInfoLink = screen.getByRole('link', { name: /Basic Info/i })
        expect(basicInfoLink).not.toHaveAttribute('aria-current')

        unmount()
    })
})
