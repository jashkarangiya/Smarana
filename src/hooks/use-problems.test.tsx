import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useStats } from './use-problems'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
})

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

describe('useStats', () => {
    beforeEach(() => {
        vi.resetAllMocks()
        queryClient.clear()
    })

    it('should fetch and return stats successfully', async () => {
        const mockStats = {
            total: 100,
            easy: 30,
            medium: 50,
            hard: 20,
            reviewedToday: 5,
            streak: 10,
            xp: 500,
            level: 5,
            xpForNextLevel: 1000,
            xpProgress: 50,
            heatmapData: {},
            achievements: [],
        }

        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockStats,
        } as Response)

        const { result } = renderHook(() => useStats(), { wrapper })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.data).toEqual(mockStats)
        expect(global.fetch).toHaveBeenCalledWith('/api/stats')
    })
})
