import { InteractionResponseType, ApplicationCommandOptionType, MessageFlags } from 'slash-commands'
import { SlashCommand } from '../types/SlashCommands'
import Embed from '../structures/Embed'

export const command: SlashCommand = {
	name: 'help',
	description: 'Shows all available commands.',
	options: [
		{
			type: ApplicationCommandOptionType.STRING,
			name: 'command',
			description: 'Command to retrieve help for.'
		}
	],
	async execute(app, i) {
		const commandInput = i.data?.options?.find(opt => opt.name === 'command')?.value as string | undefined

		if (commandInput) {
			const cmd = app.commands.find(c => c.name === commandInput || (c.aliases.length && c.aliases.includes(commandInput)))

			if (!cmd || (cmd.category === 'admin' && !app.sets.adminUsers.has(i.member.user.id))) {
				// new ephemeral message only user can see, would be cool to use them for error messages
				// sadly they don't work with embeds yet :C
				return i.respond({
					type: InteractionResponseType.CHANNEL_MESSAGE,
					data: {
						content: '❌ That command doesn\'t exist!',
						flags: MessageFlags.EPHEMERAL
					}
				})
			}

			const cmdEmbed = new Embed()
				.setTitle(`🔎 ${cmd.name}`)
				.setDescription(cmd.description)

			if (cmd.aliases.length) {
				cmdEmbed.addField('Aliases', cmd.aliases.map(alias => `\`${alias}\``).join(', '))
			}

			return i.respond({
				type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
				data: {
					embeds: [cmdEmbed.embed]
				}
			})
		}

		const cmdEmbed = new Embed()
			.setTitle('High Stakes Gambling!')
			.setDescription('Use `/help <command>` to see more about a specific command.')

		const infoCommands = app.commands.filter(cmd => cmd.category === 'info').map(cmd => `\`${cmd.name}\``)
		const gameCommands = app.commands.filter(cmd => cmd.category === 'game').map(cmd => `\`${cmd.name}\``)

		cmdEmbed.addField('📋 Information', infoCommands.join(', '))
		cmdEmbed.addField('🎲 Gambling', gameCommands.join(', '))

		await i.respond({
			type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				embeds: [cmdEmbed.embed]
			}
		})
	}
}
