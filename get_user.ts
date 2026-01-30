import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const user = await prisma.user.findFirst()
  console.log(user?.username)
}
main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
