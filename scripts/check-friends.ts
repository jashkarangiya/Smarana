import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🔍 Checking Smarana user and friends...')

    // 1. Check User
    const user = await prisma.user.findFirst({
        where: { email: 'smarana@smarana.app' },
        include: { stats: true }
    })

    if (!user) {
        console.error('❌ User smarana@smarana.app NOT FOUND!')
        return
    }

    console.log(`✅ Found User: ${user.username} (ID: ${user.id})`)
    console.log(`   Stats: Streak=${user.stats?.currentStreak}, XP=${user.xp}`)

    // 2. Check Friendships
    const friendships = await prisma.friendship.findMany({
        where: { userId: user.id },
        include: { friend: true }
    })

    console.log(`🔎 Found ${friendships.length} Friendships`)
    friendships.forEach(f => {
        console.log(`   - Friend: ${f.friend.username} (ID: ${f.friend.id})`)
    })

    if (friendships.length === 0) {
        console.error('❌ No friendships found! Seed script failed to link friends.')
        return
    }

    // 3. Check ReviewLogs for Friends (Today)
    const today = new Date().toISOString().split('T')[0]
    console.log(`📅 Checking ReviewLogs for Today (${today})...`)

    for (const f of friendships) {
        const log = await prisma.reviewLog.findFirst({ // Using findFirst instead of findUnique to be safe
            where: {
                userId: f.friendId,
                day: today
            }
        })

        console.log(`   - Friend ${f.friend.username}: Log for today? ${log ? '✅ YES (' + log.count + ')' : '❌ NO'}`)
    }

    // 4. Test API Logic (findUnique with compound key)
    console.log('🧪 Testing API-style query...')
    const testFriend = friendships[0]
    try {
        const log = await prisma.reviewLog.findUnique({
            where: {
                userId_day: {
                    userId: testFriend.friendId,
                    day: today
                }
            }
        })
        console.log(`   Api Query Result: ${log ? 'Success' : 'Null'}`)
    } catch (e) {
        console.error('   API Query FAILED:', e)
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
