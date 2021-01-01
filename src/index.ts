import { PrismaClient, User } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
	const allUsers: User[] = await prisma.user.findMany()

	console.log(allUsers)
}

for (let i = 1; i <= 10; i++) {
	console.log(`HELLO #${i}!`)
}

main()
