import { InteractionResponseType, MessageFlags } from 'slash-commands'
import { SlashCommand } from '../types/SlashCommands'
import { User } from '@prisma/client'

export const command: SlashCommand = {
	name: 'daily',
	description: 'Claim your daily 500 credits.',
	options: [],
	async execute(app, i) {
		const userData = await app.prisma.user.findUnique({
			where: {
				id: i.member.user.id
			}
		}) as User
		const cooldown = await app.cd.getCooldown(i.member.user.id, 'DAILY')

		// validations
		if (cooldown) {
			return i.respond({
				type: InteractionResponseType.CHANNEL_MESSAGE,
				data: {
					content: `❌ You need to wait \`${cooldown}\` before claiming more daily credits.`,
					flags: MessageFlags.EPHEMERAL
				}
			})
		}

		await app.prisma.user.update({
			where: {
				id: i.member.user.id
			},
			data: {
				balance: {
					increment: 500
				}
			}
		})

		await i.respond({
			type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				content: `✅ ***500 credits** have been added to your pocket.*\n\nYou now have **${userData.balance + 500} credits**.`
			}
		})

		await app.cd.createCooldown(i.member.user.id, 'DAILY', 24 * 60 * 60)
	}
}
