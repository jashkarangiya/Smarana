import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding demo account...')

    // Create demo user
    const demoUser = await prisma.user.upsert({
        where: { email: 'demo@algorecall.com' },
        update: {},
        create: {
            email: 'demo@algorecall.com',
            name: 'Demo User',
            username: 'demo',
            usernameLower: 'demo',
            passwordHash: await bcrypt.hash('demo123', 10),
            image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
            level: 5,
            xp: 1250,
            leetcodeUsername: 'demo_leetcoder',
            profileVisibility: 'PUBLIC',
            showStreakToPublic: true,
            showStreakToFriends: true,
            showPlatformsToPublic: true,
            showPlatformsToFriends: true,
        }
    })

    console.log(`✅ Created demo user: ${demoUser.email}`)

    // Create user stats
    const stats = await prisma.userStats.upsert({
        where: { userId: demoUser.id },
        update: {},
        create: {
            userId: demoUser.id,
            currentStreak: 7,
            longestStreak: 15,
            totalReviews: 42,
            problemsTracked: 18,
            reviewsThisWeek: 5,
            lastReviewedAt: new Date()
        }
    })

    console.log(`✅ Created user stats`)

    // Create sample problems
    const sampleProblems = [
        { title: 'Two Sum', slug: 'two-sum', difficulty: 'Easy', platform: 'leetcode' },
        { title: 'Add Two Numbers', slug: 'add-two-numbers', difficulty: 'Medium', platform: 'leetcode' },
        { title: 'Longest Substring', slug: 'longest-substring-without-repeating-characters', difficulty: 'Medium', platform: 'leetcode' },
        { title: 'Median of Two Sorted Arrays', slug: 'median-of-two-sorted-arrays', difficulty: 'Hard', platform: 'leetcode' },
        { title: 'Valid Parentheses', slug: 'valid-parentheses', difficulty: 'Easy', platform: 'leetcode' },
    ]

    const now = new Date()
    const problems = []

    for (let i = 0; i < sampleProblems.length; i++) {
        const problem = sampleProblems[i]
        const firstSolved = new Date(now.getTime() - (30 - i * 5) * 24 * 60 * 60 * 1000) // Solved 30, 25, 20, 15, 10 days ago
        const lastSolved = new Date(now.getTime() - (7 - i) * 24 * 60 * 60 * 1000) // Last reviewed 7-3 days ago
        const nextReview = new Date(now.getTime() + (i + 1) * 24 * 60 * 60 * 1000) // Due in 1-5 days

        const created = await prisma.revisionProblem.create({
            data: {
                userId: demoUser.id,
                platform: problem.platform,
                problemSlug: problem.slug,
                title: problem.title,
                difficulty: problem.difficulty,
                url: `https://leetcode.com/problems/${problem.slug}/`,
                firstSolvedAt: firstSolved,
                lastSolvedAt: lastSolved,
                nextReviewAt: nextReview,
                interval: i + 1,
                reviewCount: i + 1,
                lastReviewedAt: lastSolved,
                notes: i === 0 ? 'Used hash map approach' : undefined,
                solution: i === 0 ? '```python\nclass Solution:\n    def twoSum(self, nums, target):\n        seen = {}\n        for i, num in enumerate(nums):\n            if target - num in seen:\n                return [seen[target - num], i]\n            seen[num] = i\n```' : undefined
            }
        })
        problems.push(created)
    }

    console.log(`✅ Created ${problems.length} sample problems`)

    // Create review logs for the past 30 days
    const reviewLogs = []
    for (let i = 0; i < 30; i++) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        date.setHours(0, 0, 0, 0)

        // Skip some days to make it realistic
        if (i % 4 === 3) continue

        const count = Math.floor(Math.random() * 5) + 1 // 1-5 reviews per day
        const xp = count * 10

        const log = await prisma.reviewLog.create({
            data: {
                userId: demoUser.id,
                date,
                count,
                xpEarned: xp
            }
        })
        reviewLogs.push(log)
    }

    console.log(`✅ Created ${reviewLogs.length} review logs`)

    // Create a friend user
    const friendUser = await prisma.user.upsert({
        where: { email: 'friend@algorecall.com' },
        update: {},
        create: {
            email: 'friend@algorecall.com',
            name: 'Alex Chen',
            username: 'alexchen',
            usernameLower: 'alexchen',
            passwordHash: await bcrypt.hash('friend123', 10),
            image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
            level: 3,
            xp: 650,
            leetcodeUsername: 'alexchen_lc',
            profileVisibility: 'PUBLIC',
        }
    })

    // Create friendship
    await prisma.friendship.createMany({
        data: [
            { userId: demoUser.id, friendId: friendUser.id },
            { userId: friendUser.id, friendId: demoUser.id }
        ]
    })

    console.log(`✅ Created friend and friendship`)

    // Create a pending friend request
    const pendingUser = await prisma.user.upsert({
        where: { email: 'pending@algorecall.com' },
        update: {},
        create: {
            email: 'pending@algorecall.com',
            name: 'Sarah Kim',
            username: 'sarahkim',
            usernameLower: 'sarahkim',
            passwordHash: await bcrypt.hash('pending123', 10),
            image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
            level: 4,
            xp: 900,
        }
    })

    await prisma.friendRequest.create({
        data: {
            senderId: pendingUser.id,
            receiverId: demoUser.id,
            status: 'PENDING'
        }
    })

    console.log(`✅ Created pending friend request`)

    // Create some notifications
    await prisma.notification.createMany({
        data: [
            {
                userId: demoUser.id,
                type: 'FRIEND_REQUEST_RECEIVED',
                actorId: pendingUser.id,
                title: `${pendingUser.name} sent you a friend request`,
                href: '/friends',
                createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000) // 2 hours ago
            },
            {
                userId: demoUser.id,
                type: 'FRIEND_REQUEST_ACCEPTED',
                actorId: friendUser.id,
                title: `${friendUser.name} accepted your friend request`,
                href: `/u/${friendUser.username}`,
                readAt: new Date(now.getTime() - 1 * 60 * 60 * 1000), // Read 1 hour ago
                createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
            }
        ]
    })

    console.log(`✅ Created notifications`)

    console.log('\n🎉 Demo account seeded successfully!')
    console.log('\n📝 Demo credentials:')
    console.log('   Email: demo@algorecall.com')
    console.log('   Password: demo123')
    console.log('\n👥 Additional accounts:')
    console.log('   Friend: friend@algorecall.com / friend123')
    console.log('   Pending: pending@algorecall.com / pending123')
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
