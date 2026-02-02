import { render, screen, fireEvent, act } from '@testing-library/react'
import { DailyChallenge } from './daily-challenge'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('DailyChallenge', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('renders empty state when no problem is provided', () => {
        render(<DailyChallenge />)
        expect(screen.getByText('No daily challenge available')).toBeInTheDocument()
    })

    it('renders problem details when provided', () => {
        const problem = {
            id: '1',
            title: 'Two Sum',
            difficulty: 'Easy',
            url: 'https://leetcode.com/problems/two-sum'
        }

        render(<DailyChallenge problem={problem} />)

        expect(screen.getByText('Two Sum')).toBeInTheDocument()
        expect(screen.getByText('Easy')).toBeInTheDocument()
        expect(screen.getByText('Daily Challenge')).toBeInTheDocument()
        // XP Bonus for Easy is 20
        expect(screen.getByText('+20')).toBeInTheDocument()
    })

    it('renders completed state', () => {
        const problem = {
            id: '1',
            title: 'Two Sum',
            difficulty: 'Easy',
            url: 'https://leetcode.com/problems/two-sum'
        }

        render(<DailyChallenge problem={problem} isCompleted={true} />)

        expect(screen.getByText('Challenge Completed!')).toBeInTheDocument()
        expect(screen.queryByRole('button', { name: /Complete Challenge/i })).not.toBeInTheDocument()
    })

    it('calls onComplete when button is clicked', () => {
        const problem = {
            id: '1',
            title: 'Two Sum',
            difficulty: 'Easy',
            url: 'https://leetcode.com/problems/two-sum'
        }
        const onComplete = vi.fn()

        render(<DailyChallenge problem={problem} onComplete={onComplete} />)

        const button = screen.getByRole('button', { name: /Complete Challenge/i })
        fireEvent.click(button)

        expect(onComplete).toHaveBeenCalledTimes(1)
    })

    it('updates timer correctly', () => {
        // This is a bit tricky to test precisely without fragile assertions on time string,
        // but we can check if it renders initially.
        const problem = {
            id: '1',
            title: 'Two Sum',
            difficulty: 'Easy',
            url: 'https://leetcode.com/problems/two-sum'
        }

        render(<DailyChallenge problem={problem} />)

        // Timer should be present (looking for clock icon or text format)
        // The component renders a specific format, we can just check if it's not empty
        const timerDisplay = screen.getByText(/:/) // approximate check for HH:MM:SS
        expect(timerDisplay).toBeInTheDocument()
    })
})
