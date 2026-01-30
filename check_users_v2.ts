import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  try {
    const users = await prisma.user.findMany({
      take: 5,
      select: { username: true, usernameLower: true }
    })
    console.log("Users found:", JSON.stringify(users, null, 2))
  } catch (err) {
    console.error("Error querying users:", err)
  }
}
main()
  .finally(async () => await prisma.$disconnect())
