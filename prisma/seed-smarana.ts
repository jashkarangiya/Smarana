import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

// Specific ID for the Smarana demo user
const SMARANA_USER_ID = 'smarana-demo-user'

// LeetCode problems with realistic data (Same as seed-demo.ts)
const leetcodeProblems = [
    { slug: 'two-sum', title: 'Two Sum', difficulty: 'Easy' },
    { slug: 'add-two-numbers', title: 'Add Two Numbers', difficulty: 'Medium' },
    { slug: 'longest-substring-without-repeating-characters', title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium' },
    { slug: 'median-of-two-sorted-arrays', title: 'Median of Two Sorted Arrays', difficulty: 'Hard' },
    { slug: 'reverse-integer', title: 'Reverse Integer', difficulty: 'Medium' },
    { slug: 'palindrome-number', title: 'Palindrome Number', difficulty: 'Easy' },
    { slug: 'container-with-most-water', title: 'Container With Most Water', difficulty: 'Medium' },
    { slug: 'roman-to-integer', title: 'Roman to Integer', difficulty: 'Easy' },
    { slug: 'longest-common-prefix', title: 'Longest Common Prefix', difficulty: 'Easy' },
    { slug: '3sum', title: '3Sum', difficulty: 'Medium' },
    { slug: 'valid-parentheses', title: 'Valid Parentheses', difficulty: 'Easy' },
    { slug: 'merge-two-sorted-lists', title: 'Merge Two Sorted Lists', difficulty: 'Easy' },
    { slug: 'remove-duplicates-from-sorted-array', title: 'Remove Duplicates from Sorted Array', difficulty: 'Easy' },
    { slug: 'search-insert-position', title: 'Search Insert Position', difficulty: 'Easy' },
    { slug: 'maximum-subarray', title: 'Maximum Subarray', difficulty: 'Medium' },
    { slug: 'climbing-stairs', title: 'Climbing Stairs', difficulty: 'Easy' },
    { slug: 'merge-sorted-array', title: 'Merge Sorted Array', difficulty: 'Easy' },
    { slug: 'binary-tree-inorder-traversal', title: 'Binary Tree Inorder Traversal', difficulty: 'Easy' },
    { slug: 'symmetric-tree', title: 'Symmetric Tree', difficulty: 'Easy' },
    { slug: 'maximum-depth-of-binary-tree', title: 'Maximum Depth of Binary Tree', difficulty: 'Easy' },
    { slug: 'best-time-to-buy-and-sell-stock', title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy' },
    { slug: 'valid-palindrome', title: 'Valid Palindrome', difficulty: 'Easy' },
    { slug: 'single-number', title: 'Single Number', difficulty: 'Easy' },
    { slug: 'linked-list-cycle', title: 'Linked List Cycle', difficulty: 'Easy' },
    { slug: 'intersection-of-two-linked-lists', title: 'Intersection of Two Linked Lists', difficulty: 'Easy' },
    { slug: 'majority-element', title: 'Majority Element', difficulty: 'Easy' },
    { slug: 'reverse-linked-list', title: 'Reverse Linked List', difficulty: 'Easy' },
    { slug: 'contains-duplicate', title: 'Contains Duplicate', difficulty: 'Easy' },
    { slug: 'product-of-array-except-self', title: 'Product of Array Except Self', difficulty: 'Medium' },
    { slug: 'move-zeroes', title: 'Move Zeroes', difficulty: 'Easy' },
    { slug: 'coin-change', title: 'Coin Change', difficulty: 'Medium' },
    { slug: 'house-robber', title: 'House Robber', difficulty: 'Medium' },
    { slug: 'number-of-islands', title: 'Number of Islands', difficulty: 'Medium' },
    { slug: 'course-schedule', title: 'Course Schedule', difficulty: 'Medium' },
    { slug: 'implement-trie-prefix-tree', title: 'Implement Trie (Prefix Tree)', difficulty: 'Medium' },
    { slug: 'kth-smallest-element-in-a-bst', title: 'Kth Smallest Element in a BST', difficulty: 'Medium' },
    { slug: 'lowest-common-ancestor-of-a-binary-tree', title: 'Lowest Common Ancestor of a Binary Tree', difficulty: 'Medium' },
    { slug: 'serialize-and-deserialize-binary-tree', title: 'Serialize and Deserialize Binary Tree', difficulty: 'Hard' },
    { slug: 'word-search-ii', title: 'Word Search II', difficulty: 'Hard' },
    { slug: 'trapping-rain-water', title: 'Trapping Rain Water', difficulty: 'Hard' },
    { slug: 'merge-intervals', title: 'Merge Intervals', difficulty: 'Medium' },
    { slug: 'group-anagrams', title: 'Group Anagrams', difficulty: 'Medium' },
    { slug: 'top-k-frequent-elements', title: 'Top K Frequent Elements', difficulty: 'Medium' },
    { slug: 'find-median-from-data-stream', title: 'Find Median from Data Stream', difficulty: 'Hard' },
    { slug: 'word-ladder', title: 'Word Ladder', difficulty: 'Hard' },
]

// Sample notes for problems
const sampleNotes: Record<string, string> = {
    'two-sum': '## Approach\nUse a hashmap to store complement values.\n\n## Time Complexity\nO(n) - single pass\n\n## Key Insight\nCheck if complement exists before adding current number.',
    '3sum': '## Approach\nSort array, then use two pointers for each element.\n\n## Time Complexity\nO(n²)\n\n## Key Points\n- Skip duplicates\n- Move pointers based on sum comparison',
    'coin-change': '## Approach\nDynamic Programming - bottom up\n\n## Recurrence\ndp[i] = min(dp[i], dp[i - coin] + 1)\n\n## Base Case\ndp[0] = 0',
    'number-of-islands': '## Approach\nDFS/BFS to mark visited cells\n\n## Key Points\n- Modify grid in-place or use visited set\n- Count connected components',
    'trapping-rain-water': '## Approach\nTwo pointers or prefix max arrays\n\n## Formula\nwater[i] = min(leftMax[i], rightMax[i]) - height[i]',
}

// Sample solutions
const sampleSolutions: Record<string, string> = {
    'two-sum': `def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
    'valid-parentheses': `def isValid(s):
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    for char in s:
        if char in mapping:
            if not stack or stack.pop() != mapping[char]:
                return False
        else:
            stack.append(char)
    return len(stack) == 0`,
    'climbing-stairs': `def climbStairs(n):
    if n <= 2:
        return n
    a, b = 1, 2
    for _ in range(3, n + 1):
        a, b = b, a + b
    return b`,
}

function randomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function daysAgo(days: number): Date {
    const date = new Date()
    date.setDate(date.getDate() - days)
    date.setHours(0, 0, 0, 0)
    return date
}

function daysFromNow(days: number): Date {
    const date = new Date()
    date.setDate(date.getDate() + days)
    date.setHours(0, 0, 0, 0)
    return date
}

async function main() {
    console.log('🌱 Seeding Smarana demo user data...')

    const hashedPassword = await hash('smarana123', 10)

    // Create or Update Smarana user
    const user = await prisma.user.upsert({
        where: { email: 'smarana@smarana.app' },
        update: {
            name: 'Smarana',
            username: 'smarana',
            image: '/logo.png', // The requested logo
            passwordHash: hashedPassword,
            passwordUpdatedAt: new Date(),
            leetcodeUsername: 'smarana_demo',
            codeforcesUsername: 'smarana_cf',
            xp: 12450, // High XP for demo
            level: 42, // Meaningful number
            profileVisibility: 'PUBLIC',
            showStreakToPublic: true,
            showPlatformsToPublic: true,
        },
        create: {
            id: SMARANA_USER_ID,
            email: 'smarana@smarana.app',
            name: 'Smarana',
            username: 'smarana',
            image: '/logo.png',
            passwordHash: hashedPassword,
            passwordUpdatedAt: new Date(),
            leetcodeUsername: 'smarana_demo',
            codeforcesUsername: 'smarana_cf',
            xp: 12450,
            level: 42,
            profileVisibility: 'PUBLIC',
            showStreakToPublic: true,
            showPlatformsToPublic: true,
        },
    })
    console.log('✅ Created/Updated Smarana user profile')

    // Create UserStats
    await prisma.userStats.upsert({
        where: { userId: user.id },
        update: {
            currentStreak: 42,
            longestStreak: 100,
            totalReviews: 856,
            problemsTracked: 128,
            reviewsThisWeek: 45,
            lastReviewedAt: new Date(),
        },
        create: {
            userId: user.id,
            currentStreak: 42,
            longestStreak: 100,
            totalReviews: 856,
            problemsTracked: 128,
            reviewsThisWeek: 45,
            lastReviewedAt: new Date(),
        },
    })
    console.log('✅ Created user stats')

    // Create Pomodoro Settings
    await prisma.pomodoroSettings.upsert({
        where: { userId: user.id },
        update: {
            focusDuration: 25,
            shortBreakDuration: 5,
            longBreakDuration: 15,
            longBreakInterval: 4,
            autoStartBreaks: true,
            autoStartPomodoros: false,
        },
        create: {
            userId: user.id,
            focusDuration: 25,
            shortBreakDuration: 5,
            longBreakDuration: 15,
            longBreakInterval: 4,
            autoStartBreaks: true,
            autoStartPomodoros: false,
        },
    })
    console.log('✅ Created pomodoro settings')

    // Delete existing problems for demo user to ensure fresh state
    await prisma.revisionProblem.deleteMany({
        where: { userId: user.id },
    })
    await prisma.reviewEvent.deleteMany({
        where: { userId: user.id },
    })

    // Create RevisionProblems with varied states
    const intervals = [1, 3, 7, 14, 30, 90] // Added 90 for mastery
    const problems = []

    for (let i = 0; i < leetcodeProblems.length; i++) {
        const p = leetcodeProblems[i]
        // Make many problems reviewed to populate the dashboard
        const reviewCount = Math.floor(Math.random() * 10)
        const interval = intervals[Math.min(reviewCount, intervals.length - 1)]

        // Distribute problems
        let nextReviewAt: Date
        let lastReviewedAt: Date | null = null

        if (i < 8) {
            // Due today (Review Queue)
            nextReviewAt = new Date()
            nextReviewAt.setHours(0, 0, 0, 0) // Should match "today" query logic
            lastReviewedAt = daysAgo(interval)
        } else if (i < 12) {
            // Overdue (past due)
            nextReviewAt = daysAgo(Math.floor(Math.random() * 5) + 1)
            lastReviewedAt = daysAgo(interval + 10)
        } else if (i < 30) {
            // Upcoming
            nextReviewAt = daysFromNow(Math.floor(Math.random() * 7) + 1)
            lastReviewedAt = daysAgo(Math.floor(Math.random() * 3))
        } else {
            // Far future / Mastered look
            nextReviewAt = daysFromNow(Math.floor(Math.random() * 60) + 14)
            lastReviewedAt = daysAgo(10)
        }

        const firstSolvedAt = randomDate(daysAgo(180), daysAgo(30))
        const lastSolvedAt = lastReviewedAt || firstSolvedAt

        problems.push({
            userId: user.id,
            platform: 'leetcode',
            problemSlug: p.slug,
            title: p.title,
            difficulty: p.difficulty,
            url: `https://leetcode.com/problems/${p.slug}/`,
            firstSolvedAt,
            lastSolvedAt,
            nextReviewAt,
            interval,
            reviewCount,
            lastReviewedAt,
            notes: sampleNotes[p.slug] || (Math.random() > 0.7 ? 'Great problem for practicing pattern X.' : ''),
            solution: sampleSolutions[p.slug] || '',
        })
    }

    await prisma.revisionProblem.createMany({
        data: problems,
    })
    console.log(`✅ Created ${problems.length} revision problems`)

    // Get created problems for review events
    const createdProblems = await prisma.revisionProblem.findMany({
        where: { userId: user.id },
    })

    // Create ReviewEvents
    const reviewEvents = []
    for (const problem of createdProblems) {
        if (problem.reviewCount > 0) {
            for (let r = 0; r < problem.reviewCount; r++) {
                const reviewDate = daysAgo(Math.floor(Math.random() * 90) + 1)
                reviewEvents.push({
                    userId: user.id,
                    problemId: problem.id,
                    rating: Math.floor(Math.random() * 3) + 3, // 3-5 rating
                    interval: intervals[Math.min(r, intervals.length - 1)],
                    xpEarned: 25 + Math.floor(Math.random() * 25),
                    reviewedAt: reviewDate,
                    dateKey: reviewDate.toISOString().split('T')[0],
                    timezone: 'UTC',
                })
            }
        }
    }

    if (reviewEvents.length > 0) {
        await prisma.reviewEvent.createMany({
            data: reviewEvents,
        })
        console.log(`✅ Created ${reviewEvents.length} review events`)
    }

    // Create ReviewLogs for the past 60 days (rich activity calendar)
    await prisma.reviewLog.deleteMany({
        where: { userId: user.id },
    })

    const reviewLogs = []
    for (let i = 0; i < 90; i++) {
        // Fill most days to look active
        if (Math.random() > 0.85) continue

        const date = daysAgo(i)
        // ensure date string format matches schema
        const dayString = date.toISOString().split('T')[0]

        reviewLogs.push({
            userId: user.id,
            day: dayString,
            count: Math.floor(Math.random() * 12) + 2, // 2-14 reviews per day
            xpEarned: (Math.floor(Math.random() * 12) + 2) * 25,
        })
    }

    await prisma.reviewLog.createMany({
        data: reviewLogs,
    })
    console.log(`✅ Created ${reviewLogs.length} review logs`)

    // Notifications
    await prisma.notification.deleteMany({
        where: { userId: user.id },
    })

    const notifications = [
        {
            userId: user.id,
            type: 'SYSTEM',
            title: 'Welcome to Smarana! 🎉',
            body: 'Start tracking your LeetCode problems and build a consistent practice habit.',
            createdAt: daysAgo(30),
            readAt: daysAgo(30),
        },
        {
            userId: user.id,
            type: 'SYSTEM',
            title: 'Weekly Review Complete',
            body: 'You crushed 45 problems this week. Keep the momentum!',
            createdAt: daysAgo(2),
            readAt: null,
        },
        {
            userId: user.id,
            type: 'SYSTEM',
            title: 'Level 42 Reached! 🚀',
            body: 'You represent the answer to life, the universe, and everything.',
        },
    ]

    // Create Friends
    const friendUsernames = ['alex_dev', 'sarah_codes', 'mike_algo', 'emma_tech']
    const friends = []

    for (const username of friendUsernames) {
        const friend = await prisma.user.upsert({
            where: { username },
            update: {
                name: username.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
                image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
                level: Math.floor(Math.random() * 20) + 5,
                xp: Math.floor(Math.random() * 5000) + 1000,
                showStreakToPublic: true,
                showPlatformsToPublic: true,
            },
            create: {
                email: `${username}@example.com`,
                username,
                name: username.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
                image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
                level: Math.floor(Math.random() * 20) + 5,
                xp: Math.floor(Math.random() * 5000) + 1000,
                showStreakToPublic: true,
                showPlatformsToPublic: true,
            },
        })
        friends.push(friend)

        // Create stats for friend
        await prisma.userStats.upsert({
            where: { userId: friend.id },
            update: { currentStreak: Math.floor(Math.random() * 50) + 1 },
            create: {
                userId: friend.id,
                currentStreak: Math.floor(Math.random() * 50) + 1
            }
        })
    }
    console.log(`✅ Created ${friends.length} friends`)

    // Create Friendships
    console.log('Cleaning up old friendships...')
    await prisma.friendship.deleteMany({
        where: {
            OR: [
                { userId: user.id },
                { friendId: user.id }
            ]
        }
    })

    console.log(`Creating friendships for ${friends.length} friends...`)
    for (const friend of friends) {
        try {
            await prisma.friendship.create({
                data: {
                    userId: user.id,
                    friendId: friend.id
                }
            })
            // Mutual friendship
            await prisma.friendship.create({
                data: {
                    userId: friend.id,
                    friendId: user.id
                }
            })
            console.log(`   - Linked ${friend.username}`)
        } catch (e) {
            console.error(`   - Failed to link ${friend.username}:`, e)
        }
    }
    console.log(`✅ Created friendships`)

    // Create Friend Review Activities
    // We need to create problems for friends first to have review events
    for (const friend of friends) {
        // Create a dummy problem for the friend
        const p = leetcodeProblems[Math.floor(Math.random() * leetcodeProblems.length)]

        const friendProblem = await prisma.revisionProblem.create({
            data: {
                userId: friend.id,
                platform: 'leetcode',
                problemSlug: p.slug,
                title: p.title,
                difficulty: p.difficulty,
                url: `https://leetcode.com/problems/${p.slug}/`,
                firstSolvedAt: daysAgo(10),
                nextReviewAt: daysFromNow(1),
                lastSolvedAt: daysAgo(10),
                reviewCount: 5,
            }
        })

        // Create a review event TODAY or YESTERDAY for the friend so it shows in pulse
        await prisma.reviewEvent.create({
            data: {
                userId: friend.id,
                problemId: friendProblem.id,
                rating: 5,
                interval: 14,
                xpEarned: 50,
                reviewedAt: new Date(new Date().getTime() - Math.floor(Math.random() * 1000 * 60 * 60 * 4)), // Last 4 hours
                dateKey: new Date().toISOString().split('T')[0],
                timezone: 'UTC',
            }
        })

        const todayStr = new Date().toISOString().split('T')[0]
        try {
            // Create ReviewLog for friend for today so it shows in API
            await prisma.reviewLog.upsert({
                where: {
                    userId_day: {
                        userId: friend.id,
                        day: todayStr
                    }
                },
                update: {
                    count: { increment: 5 },
                    xpEarned: { increment: 50 }
                },
                create: {
                    userId: friend.id,
                    day: todayStr,
                    count: 5,
                    xpEarned: 50
                }
            })
            console.log(`   - Created ReviewLog for ${friend.username} for ${todayStr}`)
        } catch (e) {
            console.error(`   - Failed to create ReviewLog for ${friend.username}:`, e)
        }
    }
    console.log('✅ Created friend activities')

    await prisma.notification.createMany({
        data: notifications,
    })
    console.log(`✅ Created ${notifications.length} notifications`)

    // LeetCode Subs
    // Create some LeetCode submissions (for activity history)
    await prisma.leetCodeSubmission.deleteMany({
        where: { userId: user.id },
    })

    const submissions = []
    const langs = ['python3', 'javascript', 'typescript', 'java', 'cpp']

    for (let i = 0; i < 150; i++) {
        const problem = leetcodeProblems[Math.floor(Math.random() * leetcodeProblems.length)]
        const submittedAt = randomDate(daysAgo(120), new Date())

        submissions.push({
            userId: user.id,
            submissionId: `sub_${Date.now()}_${i}`,
            problemSlug: problem.slug,
            problemTitle: problem.title,
            status: 'ACCEPTED',
            lang: langs[Math.floor(Math.random() * langs.length)],
            runtime: `${Math.floor(Math.random() * 100) + 20}ms`,
            memory: `${(Math.random() * 20 + 10).toFixed(1)}MB`,
            submittedAt,
        })
    }

    await prisma.leetCodeSubmission.createMany({
        data: submissions,
    })
    console.log(`✅ Created ${submissions.length} LeetCode submissions`)


    console.log('\n🎉 Smarana demo user seeding complete!')
    console.log('📧 Email: smarana@smarana.app')
    console.log('🔑 Password: smarana123')
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
