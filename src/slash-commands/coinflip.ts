import { InteractionResponseType, MessageFlags, ApplicationCommandOptionType } from 'slash-commands'
import { SlashCommand } from '../types/SlashCommands'
import { User } from '@prisma/client'

export const command: SlashCommand = {
	name: 'coinflip',
	description: 'Bet some credits for a 45% chance of winning!',
	options: [
		{
			type: ApplicationCommandOptionType.INTEGER,
			name: 'amount',
			description: 'Amount to bet.',
			required: true
		}
	],
	async execute(app, i) {
		const userData = await app.prisma.user.findUnique({
			where: {
				id: i.member.user.id
			}
		}) as User
		const cooldown = await app.cd.getCooldown(i.member.user.id, 'COINFLIP')
		const gambleAmount = i.data?.options?.find(opt => opt.name === 'amount')?.value as number

		// validations
		if (cooldown) {
			return i.respond({
				type: InteractionResponseType.CHANNEL_MESSAGE,
				data: {
					content: `❌ You need to wait \`${cooldown}\` before flipping another coin.`,
					flags: MessageFlags.EPHEMERAL
				}
			})
		}
		else if (gambleAmount < 100) {
			return i.respond({
				type: InteractionResponseType.CHANNEL_MESSAGE,
				data: {
					content: '❌ Please specify an amount of at least **100 credits** to gamble!',
					flags: MessageFlags.EPHEMERAL
				}
			})
		}
		else if (gambleAmount > userData.balance) {
			return i.respond({
				type: InteractionResponseType.CHANNEL_MESSAGE,
				data: {
					content: `❌ You don't have that many credits! You currently have **${userData.balance} credits**.`,
					flags: MessageFlags.EPHEMERAL
				}
			})
		}
		else if (gambleAmount > 1000000) {
			return i.respond({
				type: InteractionResponseType.CHANNEL_MESSAGE,
				data: {
					content: '❌ Chill out!! You can only bet up to 1,000,000 credits here.',
					flags: MessageFlags.EPHEMERAL
				}
			})
		}

		if (Math.random() < 0.45) {
			await app.prisma.user.update({
				where: {
					id: i.member.user.id
				},
				data: {
					balance: {
						increment: gambleAmount
					}
				}
			})

			await i.respond({
				type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
				data: {
					content: `🤯 You just won **${gambleAmount * 2}**!`
				}
			})
		}
		else {
			await app.prisma.user.update({
				where: {
					id: i.member.user.id
				},
				data: {
					balance: {
						decrement: gambleAmount
					}
				}
			})

			await i.respond({
				type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
				data: {
					content: `You suck at this, give me your **${gambleAmount} credits**...`
				}
			})
		}

		await app.cd.createCooldown(i.member.user.id, 'COINFLIP', 60)
	}
}
