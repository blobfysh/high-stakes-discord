import { Command } from '../types/Commands'
import { reply } from '../utils/messageUtils'
import { prefix } from '../config'
import Embed from '../structures/Embed'

export const command: Command = {
	name: 'help',
	aliases: ['hello'],
	description: 'Shows all available commands',
	category: 'info',
	permissions: ['sendMessages'],
	guildOnly: false,
	async execute(app, message, { args }) {
		if (args[0]) {
			const cmd = app.commands.find(c => c.name === args[0] || (c.aliases.length && c.aliases.includes(args[0] ?? '')))

			if (!cmd || (cmd.category === 'admin' && !app.sets.adminUsers.has(message.author.id))) return reply(message, '❌ That command doesn\'t exist!')

			const cmdEmbed = new Embed()
				.setTitle(`🔎 ${cmd.name}`)
				.setDescription(cmd.description)

			if (cmd.aliases.length) {
				cmdEmbed.addField('Aliases', cmd.aliases.map(alias => `\`${alias}\``).join(', '))
			}

			return message.channel.createMessage({
				embed: cmdEmbed.embed
			})
		}

		const cmdEmbed = new Embed()
			.setTitle('High Stakes Gambling!')
			.setDescription(`Use \`${prefix}help <command>\` to see more about a specific command.`)

		const infoCommands = app.commands.filter(cmd => cmd.category === 'info').map(cmd => `\`${cmd.name}\``)
		const gameCommands = app.commands.filter(cmd => cmd.category === 'game').map(cmd => `\`${cmd.name}\``)

		cmdEmbed.addField('📋 Information', infoCommands.join(', '))

		// TODO this conditional will be useless once some game commands have been added
		if (gameCommands.length) {
			cmdEmbed.addField('🎲 Games', gameCommands.join(', '))
		}

		await reply(message, {
			embed: cmdEmbed.embed
		})
	}
}
