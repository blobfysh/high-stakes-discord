import { InteractionResponseType, MessageFlags, ApplicationCommandOptionType } from 'slash-commands'
import { SlashCommand } from '../types/SlashCommands'

export const command: SlashCommand = {
	name: 'balance',
	description: 'View your current balance.',
	options: [
		{
			type: ApplicationCommandOptionType.USER,
			name: 'user',
			description: 'User to retrieve balance of.'
		}
	],
	async execute(app, i) {
		const userInput = i.data?.options?.find(opt => opt.name === 'user')?.value as string | undefined

		if (userInput) {
			const user = app.bot.users.get(userInput)

			// user mentions in normal messages would cause bot to cache the user, but user inputs with slash commands won't be cached
			// kinda sucks tbh
			if (!user) {
				return {
					type: InteractionResponseType.CHANNEL_MESSAGE,
					data: {
						content: '😭 I could not find that user! (this can happen if I haven\'t seen the user type before)',
						flags: MessageFlags.EPHEMERAL
					}
				}
			}

			const userData = await app.prisma.user.findUnique({
				where: {
					id: user.id
				},
				select: {
					balance: true
				}
			})

			if (!userData) {
				return {
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						content: `❌ ${user.username}#${user.discriminator} does not have an account!`
					}
				}
			}

			return {
				type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
				data: {
					content: `${user.username}#${user.discriminator} currently has ${userData.balance} credits.`
				}
			}
		}

		const user = await app.prisma.user.findUnique({
			where: {
				id: i.member.user.id
			},
			select: {
				balance: true
			}
		})

		return {
			type: InteractionResponseType.CHANNEL_MESSAGE,
			data: {
				content: `You currently have ${user?.balance ?? 0} credits.`,
				flags: MessageFlags.EPHEMERAL
			}
		}
	}
}
