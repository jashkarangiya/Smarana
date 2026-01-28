import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import CryptoJS from 'crypto-js'

const prisma = new PrismaClient()

// Encryption helper (matches src/lib/encryption.ts)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET || 'fallback-key'
function encrypt(text: string | null | undefined): string | null {
    if (!text) return null
    return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString()
}

async function main() {
    console.log('🌱 Seeding demo account...')

    // Delete existing demo users first to avoid conflicts
    await prisma.user.deleteMany({
        where: {
            OR: [
                { email: 'demo@smarana.app' },
                { username: 'demo' },
                { email: 'friend@smarana.app' },
                { username: 'alexchen' },
                { email: 'pending@smarana.app' },
                { username: 'sarahkim' }
            ]
        }
    })
    console.log('🗑️  Cleaned up existing demo data')

    // Create demo user
    const demoUser = await prisma.user.create({
        data: {
            email: 'demo@smarana.app',
            name: 'Demo User',
            username: 'demo',
            usernameLower: 'demo',
            passwordHash: await bcrypt.hash('demo123', 10),
            image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
            level: 7,
            xp: 2450,
            leetcodeUsername: 'leetcode_demo',
            profileVisibility: 'PUBLIC',
            showStreakToPublic: true,
            showStreakToFriends: true,
            showPlatformsToPublic: true,
            showPlatformsToFriends: true,
        }
    })

    console.log(`✅ Created demo user: ${demoUser.email}`)

    const now = new Date()

    // Create user stats with impressive streak
    await prisma.userStats.create({
        data: {
            userId: demoUser.id,
            currentStreak: 12,
            longestStreak: 21,
            totalReviews: 156,
            problemsTracked: 45,
            reviewsThisWeek: 18,
            lastReviewedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000) // 2 hours ago
        }
    })

    console.log(`✅ Created user stats`)

    // Create LeetCode account link
    await prisma.leetCodeAccount.create({
        data: {
            userId: demoUser.id,
            username: 'leetcode_demo',
            authType: 'PUBLIC',
            lastSyncedAt: new Date(now.getTime() - 30 * 60 * 1000), // 30 mins ago
            syncStatus: 'OK'
        }
    })

    console.log(`✅ Created LeetCode account link`)

    // Comprehensive problem list covering different patterns and difficulties
    const sampleProblems = [
        // Due today (for review queue)
        { title: 'Two Sum', slug: 'two-sum', difficulty: 'Easy', daysUntilReview: 0, interval: 7, reviewCount: 4 },
        { title: 'Valid Parentheses', slug: 'valid-parentheses', difficulty: 'Easy', daysUntilReview: 0, interval: 3, reviewCount: 2 },
        { title: 'Merge Two Sorted Lists', slug: 'merge-two-sorted-lists', difficulty: 'Easy', daysUntilReview: 0, interval: 5, reviewCount: 3 },

        // Due tomorrow
        { title: 'Best Time to Buy and Sell Stock', slug: 'best-time-to-buy-and-sell-stock', difficulty: 'Easy', daysUntilReview: 1, interval: 7, reviewCount: 4 },
        { title: 'Maximum Subarray', slug: 'maximum-subarray', difficulty: 'Medium', daysUntilReview: 1, interval: 14, reviewCount: 5 },

        // Due this week
        { title: 'Binary Search', slug: 'binary-search', difficulty: 'Easy', daysUntilReview: 2, interval: 10, reviewCount: 4 },
        { title: 'Reverse Linked List', slug: 'reverse-linked-list', difficulty: 'Easy', daysUntilReview: 3, interval: 14, reviewCount: 5 },
        { title: 'Climbing Stairs', slug: 'climbing-stairs', difficulty: 'Easy', daysUntilReview: 3, interval: 21, reviewCount: 6 },
        { title: 'Invert Binary Tree', slug: 'invert-binary-tree', difficulty: 'Easy', daysUntilReview: 4, interval: 14, reviewCount: 5 },
        { title: 'Linked List Cycle', slug: 'linked-list-cycle', difficulty: 'Easy', daysUntilReview: 5, interval: 21, reviewCount: 6 },

        // Medium problems
        { title: 'Add Two Numbers', slug: 'add-two-numbers', difficulty: 'Medium', daysUntilReview: 2, interval: 7, reviewCount: 3 },
        { title: 'Longest Substring Without Repeating Characters', slug: 'longest-substring-without-repeating-characters', difficulty: 'Medium', daysUntilReview: 4, interval: 10, reviewCount: 4 },
        { title: '3Sum', slug: '3sum', difficulty: 'Medium', daysUntilReview: 5, interval: 7, reviewCount: 3 },
        { title: 'Container With Most Water', slug: 'container-with-most-water', difficulty: 'Medium', daysUntilReview: 6, interval: 14, reviewCount: 4 },
        { title: 'Group Anagrams', slug: 'group-anagrams', difficulty: 'Medium', daysUntilReview: 7, interval: 10, reviewCount: 3 },
        { title: 'Longest Palindromic Substring', slug: 'longest-palindromic-substring', difficulty: 'Medium', daysUntilReview: 8, interval: 7, reviewCount: 2 },
        { title: 'Product of Array Except Self', slug: 'product-of-array-except-self', difficulty: 'Medium', daysUntilReview: 10, interval: 14, reviewCount: 4 },
        { title: 'Valid Sudoku', slug: 'valid-sudoku', difficulty: 'Medium', daysUntilReview: 12, interval: 21, reviewCount: 5 },
        { title: 'Rotate Image', slug: 'rotate-image', difficulty: 'Medium', daysUntilReview: 14, interval: 14, reviewCount: 3 },
        { title: 'Spiral Matrix', slug: 'spiral-matrix', difficulty: 'Medium', daysUntilReview: 15, interval: 10, reviewCount: 2 },

        // Hard problems
        { title: 'Median of Two Sorted Arrays', slug: 'median-of-two-sorted-arrays', difficulty: 'Hard', daysUntilReview: 3, interval: 7, reviewCount: 2 },
        { title: 'Merge k Sorted Lists', slug: 'merge-k-sorted-lists', difficulty: 'Hard', daysUntilReview: 7, interval: 10, reviewCount: 3 },
        { title: 'Trapping Rain Water', slug: 'trapping-rain-water', difficulty: 'Hard', daysUntilReview: 10, interval: 7, reviewCount: 2 },
        { title: 'Word Ladder', slug: 'word-ladder', difficulty: 'Hard', daysUntilReview: 14, interval: 14, reviewCount: 3 },
        { title: 'Minimum Window Substring', slug: 'minimum-window-substring', difficulty: 'Hard', daysUntilReview: 20, interval: 21, reviewCount: 4 },

        // Recently solved (future review dates)
        { title: 'Number of Islands', slug: 'number-of-islands', difficulty: 'Medium', daysUntilReview: 25, interval: 30, reviewCount: 5 },
        { title: 'Course Schedule', slug: 'course-schedule', difficulty: 'Medium', daysUntilReview: 28, interval: 30, reviewCount: 5 },
        { title: 'Implement Trie', slug: 'implement-trie-prefix-tree', difficulty: 'Medium', daysUntilReview: 30, interval: 30, reviewCount: 4 },
        { title: 'Word Search', slug: 'word-search', difficulty: 'Medium', daysUntilReview: 35, interval: 45, reviewCount: 6 },
        { title: 'Coin Change', slug: 'coin-change', difficulty: 'Medium', daysUntilReview: 40, interval: 45, reviewCount: 6 },
    ]

    const problems = []
    const solutionExamples: Record<string, { notes: string; solution: string }> = {
        'two-sum': {
            notes: '**Pattern:** Hash Map\n\nKey insight: Use a hash map to store complement values. Time: O(n), Space: O(n)',
            solution: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        seen = {}
        for i, num in enumerate(nums):
            complement = target - num
            if complement in seen:
                return [seen[complement], i]
            seen[num] = i
        return []`
        },
        'valid-parentheses': {
            notes: '**Pattern:** Stack\n\nUse a stack to match opening and closing brackets. Push opening, pop and match for closing.',
            solution: `class Solution:
    def isValid(self, s: str) -> bool:
        stack = []
        mapping = {')': '(', '}': '{', ']': '['}

        for char in s:
            if char in mapping:
                if not stack or stack.pop() != mapping[char]:
                    return False
            else:
                stack.append(char)

        return len(stack) == 0`
        },
        'binary-search': {
            notes: '**Pattern:** Binary Search\n\nClassic binary search template. Remember: left <= right, mid = left + (right - left) // 2',
            solution: `class Solution:
    def search(self, nums: List[int], target: int) -> int:
        left, right = 0, len(nums) - 1

        while left <= right:
            mid = left + (right - left) // 2
            if nums[mid] == target:
                return mid
            elif nums[mid] < target:
                left = mid + 1
            else:
                right = mid - 1

        return -1`
        },
        'reverse-linked-list': {
            notes: '**Pattern:** Linked List Reversal\n\nUse three pointers: prev, curr, next. Update pointers iteratively.',
            solution: `class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        prev = None
        curr = head

        while curr:
            next_node = curr.next
            curr.next = prev
            prev = curr
            curr = next_node

        return prev`
        },
        'maximum-subarray': {
            notes: '**Pattern:** Kadane\'s Algorithm (Dynamic Programming)\n\nTrack current sum and max sum. Reset current sum if it goes negative.',
            solution: `class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        max_sum = curr_sum = nums[0]

        for num in nums[1:]:
            curr_sum = max(num, curr_sum + num)
            max_sum = max(max_sum, curr_sum)

        return max_sum`
        }
    }

    for (const problem of sampleProblems) {
        const firstSolved = new Date(now.getTime() - (60 + Math.random() * 30) * 24 * 60 * 60 * 1000)
        const lastSolved = new Date(now.getTime() - (problem.interval - problem.daysUntilReview) * 24 * 60 * 60 * 1000)
        const nextReview = new Date(now.getTime() + problem.daysUntilReview * 24 * 60 * 60 * 1000)

        // Set time to midnight for today's reviews
        if (problem.daysUntilReview === 0) {
            nextReview.setHours(0, 0, 0, 0)
        }

        const solutionData = solutionExamples[problem.slug]

        const created = await prisma.revisionProblem.create({
            data: {
                userId: demoUser.id,
                platform: 'leetcode',
                problemSlug: problem.slug,
                title: problem.title,
                difficulty: problem.difficulty,
                url: `https://leetcode.com/problems/${problem.slug}/`,
                firstSolvedAt: firstSolved,
                lastSolvedAt: lastSolved,
                nextReviewAt: nextReview,
                interval: problem.interval,
                reviewCount: problem.reviewCount,
                lastReviewedAt: lastSolved,
                notes: encrypt(solutionData?.notes || ''),
                solution: encrypt(solutionData?.solution || '')
            }
        })
        problems.push(created)
    }

    console.log(`✅ Created ${problems.length} sample problems (${problems.filter(p => p.nextReviewAt <= now).length} due today)`)

    // Create review events for some problems
    const reviewEventProblems = problems.slice(0, 10)
    for (const problem of reviewEventProblems) {
        const eventCount = Math.floor(Math.random() * 3) + 1
        for (let i = 0; i < eventCount; i++) {
            const reviewDate = new Date(now.getTime() - (i * 7 + Math.random() * 5) * 24 * 60 * 60 * 1000)
            await prisma.reviewEvent.create({
                data: {
                    userId: demoUser.id,
                    problemId: problem.id,
                    rating: Math.floor(Math.random() * 3) + 3, // 3-5 rating
                    interval: problem.interval,
                    xpEarned: 10 + Math.floor(Math.random() * 20),
                    reviewedAt: reviewDate
                }
            })
        }
    }

    console.log(`✅ Created review events`)

    // Create review logs for the past 60 days (for activity calendar)
    const reviewLogs = []
    for (let i = 0; i < 60; i++) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        date.setHours(0, 0, 0, 0)

        // Create realistic pattern: more reviews on weekdays, occasional gaps
        const dayOfWeek = date.getDay()
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

        // Skip some days randomly (more likely on weekends)
        if (Math.random() < (isWeekend ? 0.4 : 0.15)) continue

        const count = Math.floor(Math.random() * (isWeekend ? 4 : 6)) + 1
        const xp = count * (10 + Math.floor(Math.random() * 10))

        const log = await prisma.reviewLog.create({
            data: {
                userId: demoUser.id,
                day: date.toISOString().split('T')[0],
                count,
                xpEarned: xp
            }
        })
        reviewLogs.push(log)
    }

    console.log(`✅ Created ${reviewLogs.length} review logs (activity history)`)

    // Create Pomodoro settings
    await prisma.pomodoroSettings.create({
        data: {
            userId: demoUser.id,
            focusDuration: 25,
            shortBreakDuration: 5,
            longBreakDuration: 15,
            longBreakInterval: 4,
            autoStartBreaks: true,
            autoStartPomodoros: false
        }
    })

    console.log(`✅ Created Pomodoro settings`)

    // Create friend users with their own stats
    const friendUser = await prisma.user.create({
        data: {
            email: 'friend@smarana.app',
            name: 'Alex Chen',
            username: 'alexchen',
            usernameLower: 'alexchen',
            passwordHash: await bcrypt.hash('friend123', 10),
            image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
            level: 5,
            xp: 1850,
            leetcodeUsername: 'alexchen_lc',
            profileVisibility: 'PUBLIC',
        }
    })

    await prisma.userStats.create({
        data: {
            userId: friendUser.id,
            currentStreak: 8,
            longestStreak: 14,
            totalReviews: 89,
            problemsTracked: 32,
            reviewsThisWeek: 12,
            lastReviewedAt: new Date(now.getTime() - 5 * 60 * 60 * 1000)
        }
    })

    // Create friendship (bidirectional)
    await prisma.friendship.createMany({
        data: [
            { userId: demoUser.id, friendId: friendUser.id },
            { userId: friendUser.id, friendId: demoUser.id }
        ]
    })

    console.log(`✅ Created friend: Alex Chen`)

    // Create pending friend request user
    const pendingUser = await prisma.user.create({
        data: {
            email: 'pending@smarana.app',
            name: 'Sarah Kim',
            username: 'sarahkim',
            usernameLower: 'sarahkim',
            passwordHash: await bcrypt.hash('pending123', 10),
            image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
            level: 6,
            xp: 2100,
            leetcodeUsername: 'sarah_codes',
            profileVisibility: 'PUBLIC',
        }
    })

    await prisma.userStats.create({
        data: {
            userId: pendingUser.id,
            currentStreak: 15,
            longestStreak: 30,
            totalReviews: 120,
            problemsTracked: 48,
            reviewsThisWeek: 20,
            lastReviewedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000)
        }
    })

    await prisma.friendRequest.create({
        data: {
            senderId: pendingUser.id,
            receiverId: demoUser.id,
            status: 'PENDING'
        }
    })

    console.log(`✅ Created pending friend request from Sarah Kim`)

    // Create notifications
    await prisma.notification.createMany({
        data: [
            {
                userId: demoUser.id,
                type: 'FRIEND_REQUEST_RECEIVED',
                actorId: pendingUser.id,
                title: 'Sarah Kim sent you a friend request',
                href: '/friends',
                createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000)
            },
            {
                userId: demoUser.id,
                type: 'FRIEND_REQUEST_ACCEPTED',
                actorId: friendUser.id,
                title: 'Alex Chen accepted your friend request',
                href: `/u/alexchen`,
                readAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
                createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
            },
            {
                userId: demoUser.id,
                type: 'SYSTEM',
                title: '🎉 You reached a 10-day streak!',
                body: 'Keep up the great work! Consistency is key to mastering algorithms.',
                readAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
                createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
            }
        ]
    })

    console.log(`✅ Created notifications`)

    // Summary
    console.log('\n' + '='.repeat(50))
    console.log('🎉 Demo account seeded successfully!')
    console.log('='.repeat(50))
    console.log('\n📝 Demo credentials:')
    console.log('   Email: demo@smarana.app')
    console.log('   Password: demo123')
    console.log('\n📊 Demo data includes:')
    console.log(`   • ${problems.length} problems tracked`)
    console.log(`   • ${problems.filter(p => p.nextReviewAt <= now).length} problems due for review today`)
    console.log(`   • 12-day current streak`)
    console.log(`   • Level 7 with 2,450 XP`)
    console.log(`   • ${reviewLogs.length} days of activity history`)
    console.log(`   • 1 friend (Alex Chen)`)
    console.log(`   • 1 pending friend request (Sarah Kim)`)
    console.log(`   • 3 notifications`)
    console.log('\n👥 Additional test accounts:')
    console.log('   • friend@smarana.app / friend123')
    console.log('   • pending@smarana.app / pending123')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
