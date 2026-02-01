import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn utility', () => {
    it('should merge class names correctly', () => {
        const result = cn('c-1', 'c-2')
        expect(result).toBe('c-1 c-2')
    })

    it('should handle conditional classes', () => {
        const result = cn('c-1', true && 'c-2', false && 'c-3')
        expect(result).toBe('c-1 c-2')
    })

    it('should merge tailwind classes properly', () => {
        // tailwind-merge should resolve conflict: p-4 overrides p-2
        const result = cn('p-2', 'p-4')
        expect(result).toBe('p-4')
    })
})
