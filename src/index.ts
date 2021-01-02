import { PrismaClient, User } from '@prisma/client'
import App from './app'

const prisma = new PrismaClient()

async function main() {
	const allUsers: User[] = await prisma.user.findMany()

	console.log(allUsers)

	const app = new App(`Bot ${process.env.BOT_TOKEN}`, {
		disableEvents: {
			GUILD_BAN_ADD: true,
			GUILD_BAN_REMOVE: true,
			MESSAGE_DELETE: true,
			MESSAGE_DELETE_BULK: true,
			MESSAGE_UPDATE: true,
			TYPING_START: true,
			VOICE_STATE_UPDATE: true
		},
		allowedMentions: {
			everyone: false
		},
		messageLimit: 10,
		defaultImageFormat: 'png',
		defaultImageSize: 256,
		restMode: true,
		intents: [
			'guilds',
			'guildMembers',
			'guildMessages',
			'guildMessageReactions',
			'directMessages'
		]
	})

	app.launch()
}

for (let i = 1; i <= 10; i++) {
	console.log(`HELLO #${i}!`)
}

main()
