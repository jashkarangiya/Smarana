import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const users = await prisma.user.findMany({
    select: { username: true, usernameLower: true }
  })
  console.log("Users in DB:", users)
}
main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
