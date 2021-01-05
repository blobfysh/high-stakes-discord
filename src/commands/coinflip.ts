import { Command } from '../types/Commands'
import { reply } from '../utils/messageUtils'

export const command: Command = {
	name: 'coinflip',
	aliases: ['cf'],
	description: 'Bet some credits for a 50% chance of winning!',
	category: 'game',
	permissions: ['sendMessages'],
	guildOnly: true,
	async execute(app, message, { args }) {
		await reply(message, {
			content: 'Work in progress...'
		})
	}
}
