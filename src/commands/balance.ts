import { Command } from '../types/Commands'
import { reply } from '../utils/messageUtils'

export const command: Command = {
	name: 'balance',
	aliases: ['bal', 'credits', 'money'],
	description: 'View your current balance.',
	category: 'info',
	permissions: ['sendMessages'],
	guildOnly: true,
	async execute(app, message, { args }) {
		const member = app.parse.members(message, args)[0]

		if (!member && args.length) {
			return reply(message, {
				content: '❌ Could not find anyone matching that description!\nYou can mention someone, use their Discord#tag, or type their user ID'
			})
		}
		else if (member) {
			const userData = await app.prisma.user.findUnique({
				where: {
					id: member.id
				},
				select: {
					balance: true
				}
			})

			if (!userData) {
				return reply(message, {
					content: `❌ ${member.username}#${member.discriminator} does not have an account!`
				})
			}

			return reply(message, {
				content: `${member.username}#${member.discriminator} currently has ${userData.balance} credits.`
			})
		}

		const userData = await app.prisma.user.findUnique({
			where: {
				id: message.author.id
			},
			select: {
				balance: true
			}
		})

		await reply(message, {
			content: `You currently have **${userData?.balance ?? 0} credits**.`
		})
	}
}
