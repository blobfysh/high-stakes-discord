import { Command } from '../types/Commands'

export const command: Command = {
	name: 'help',
	aliases: ['hello'],
	description: 'Shows all available commands',
	async execute(app, message) {
		await message.channel.createMessage('hello!')
	}
}
