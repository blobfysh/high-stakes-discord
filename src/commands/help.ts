import { Command } from '../types/Commands'

export const command: Command = {
	name: 'help',
	aliases: ['hello'],
	description: 'Shows all available commands',
	category: 'info',
	permissions: ['sendMessages'],
	guildOnly: false,
	async execute(app, message) {
		await message.channel.createMessage('hello!')
	}
}
