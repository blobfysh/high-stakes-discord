import { User } from '@prisma/client'
import { Command } from '../types/Commands'
import { reply } from '../utils/messageUtils'

export const command: Command = {
	name: 'daily',
	aliases: [],
	description: 'Claim 500 free credits every day.',
	category: 'game',
	permissions: ['sendMessages'],
	guildOnly: true,
	async execute(app, message, { args }) {
		const userData = await app.prisma.user.findUnique({
			where: {
				id: message.author.id
			}
		}) as User
		const cooldown = await app.cd.getCooldown(message.author.id, 'DAILY')

		// validations
		if (cooldown) {
			return reply(message, {
				content: `❌ You need to wait \`${cooldown}\` before claiming more daily credits.`
			})
		}

		await app.prisma.user.update({
			where: {
				id: message.author.id
			},
			data: {
				balance: {
					increment: 500
				}
			}
		})

		reply(message, {
			content: `✅ ***500 credits** have been added to your pocket.*\n\nYou now have **${userData.balance + 500} credits**.`
		})

		await app.cd.createCooldown(message.author.id, 'DAILY', 24 * 60 * 60)
	}
}
