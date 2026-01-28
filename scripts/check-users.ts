// Quick script to check users - run with: npx tsx scripts/check-users.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            username: true,
            usernameLower: true,
            name: true,
        }
    })

    console.log("Users in database:")
    console.table(users)

    // Check for users with null usernameLower
    const broken = users.filter(u => !u.usernameLower)
    if (broken.length > 0) {
        console.log("\n⚠️ Users with missing usernameLower:")
        console.table(broken)
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
