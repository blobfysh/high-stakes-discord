import { User } from '@prisma/client'
import { Command } from '../types/Commands'
import { reply } from '../utils/messageUtils'

export const command: Command = {
	name: 'coinflip',
	aliases: ['cf'],
	description: 'Bet some credits for a 45% chance of winning!',
	category: 'game',
	permissions: ['sendMessages'],
	guildOnly: true,
	async execute(app, message, { args }) {
		const userData = await app.prisma.user.findUnique({
			where: {
				id: message.author.id
			}
		}) as User
		const cooldown = await app.cd.getCooldown(message.author.id, 'COINFLIP')
		let gambleAmount = app.parse.numbers(args)[0]

		if (!gambleAmount && args[0] && args[0].toLowerCase() === 'all') {
			gambleAmount = userData.balance >= 1000000 ? 1000000 : userData.balance
		}

		// validations
		if (cooldown) {
			return reply(message, {
				content: `You need to wait \`${cooldown}\` before flipping another coin.`
			})
		}
		else if (!gambleAmount || gambleAmount < 100) {
			return reply(message, {
				content: 'Please specify an amount of at least **100 credits** to gamble!'
			})
		}
		else if (gambleAmount > userData.balance) {
			return reply(message, {
				content: `❌ You don't have that many credits! You currently have **${userData.balance} credits**.`
			})
		}
		else if (gambleAmount > 1000000) {
			return reply(message, {
				content: '❌ Chill out!! You can only bet up to 1,000,000 credits here.'
			})
		}

		if (Math.random() < 0.45) {
			await app.prisma.user.update({
				where: {
					id: message.author.id
				},
				data: {
					balance: {
						increment: gambleAmount
					}
				}
			})

			await reply(message, {
				content: `🤯 You just won **${gambleAmount * 2}**!`
			})
		}
		else {
			await app.prisma.user.update({
				where: {
					id: message.author.id
				},
				data: {
					balance: {
						decrement: gambleAmount
					}
				}
			})

			await reply(message, {
				content: `You suck at this, give me your **${gambleAmount} credits**...`
			})
		}

		await app.cd.createCooldown(message.author.id, 'COINFLIP', 60)
	}
}
