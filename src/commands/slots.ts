import { User } from '@prisma/client'
import { Command } from '../types/Commands'
import { reply } from '../utils/messageUtils'
import { icons } from '../config'
import Embed from '../structures/Embed'

interface slotsColumn {
	top: string
	mid: string
	bot: string
	multi: number
}

export const command: Command = {
	name: 'slots',
	aliases: [],
	description: 'Bet some credits on a game of slots!',
	category: 'game',
	permissions: ['sendMessages', 'embedLinks'],
	guildOnly: true,
	async execute(app, message, { args }) {
		const userData = await app.prisma.user.findUnique({
			where: {
				id: message.author.id
			}
		}) as User
		const cooldown = await app.cd.getCooldown(message.author.id, 'SLOTS')
		let gambleAmount = app.parse.numbers(args)[0]

		if (!gambleAmount && args[0] && args[0].toLowerCase() === 'all') {
			gambleAmount = userData.balance >= 1000000 ? 1000000 : userData.balance
		}
		else if (!gambleAmount && args[0] && args[0].toLowerCase() === 'half') {
			gambleAmount = Math.floor(userData.balance / 2) >= 1000000 ? 1000000 : Math.floor(userData.balance / 2)
		}

		// validations
		if (cooldown) {
			return reply(message, {
				content: `❌ You need to wait \`${cooldown}\` before playing another game of slots.`
			})
		}
		else if (!gambleAmount || gambleAmount < 100) {
			return reply(message, {
				content: '❌ Please specify an amount of at least **100 credits** to gamble!'
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

		const col1 = getSlot(Math.random())
		const col2 = getSlot(Math.random())
		const col3 = getSlot(Math.random())
		let multiplier = 0

		// all columns matching
		if (col1.multi === col2.multi && col1.multi === col3.multi) {
			multiplier = col1.multi
		}
		// only 2 columns matching
		else if (col1.multi === col2.multi || col2.multi === col3.multi) {
			// make sure to use col2.multi as it is sure to match to either col1 or col3
			multiplier = col2.multi / 2
		}

		const winnings = Math.floor(gambleAmount * multiplier)

		if (winnings > 0) {
			await app.prisma.user.update({
				where: {
					id: message.author.id
				},
				data: {
					balance: {
						increment: winnings
					}
				}
			})
		}

		const slotsEmbed = new Embed()
			.setTitle('Slots')
			.setDescription(`${icons.slotsTop.repeat(3)}\n${icons.slotsMid.repeat(3)}\n${icons.slotsBot.repeat(3)}`)

		console.log(`${icons.slotsTop.repeat(3)}\n${icons.slotsMid.repeat(3)}\n${icons.slotsBot.repeat(3)}`)
		const botMessage = await message.channel.createMessage({
			embed: slotsEmbed.embed
		})

		setTimeout(() => {
			const newEmbed = new Embed()
				.setTitle('Slots')
				.setDescription(`${col1.top}${icons.slotsTop.repeat(2)}\n${col1.mid}${icons.slotsMid.repeat(2)}\n${col1.bot}${icons.slotsBot.repeat(2)}`)

			botMessage.edit({
				embed: newEmbed.embed
			})
		}, 1000)

		setTimeout(() => {
			const newEmbed = new Embed()
				.setTitle('Slots')
				.setDescription(`${col1.top}${col2.top}${icons.slotsTop}\n${col1.mid}${col2.mid}${icons.slotsMid}\n${col1.bot}${col2.bot}${icons.slotsBot}`)

			botMessage.edit({
				embed: newEmbed.embed
			})
		}, 2000)

		setTimeout(() => {
			const newEmbed = new Embed()
				.setTitle('Slots')
				.setDescription(`${col1.top}${col2.top}${col3.top}\n${col1.mid}${col2.mid}${col3.mid}\n${col1.bot}${col2.bot}${col3.bot}`)
			let endString = ''

			if (winnings > 0) {
				newEmbed.setColor(720640)
				endString = `You won **${winnings} credits** (${multiplier}x)`
			}
			else {
				newEmbed.setColor(13632027)
				endString = 'You lost!'
			}

			botMessage.edit({
				embed: newEmbed.embed,
				content: endString
			})
		}, 3500)

		await app.cd.createCooldown(message.author.id, 'SLOTS', 60)
	}
}

function getSlot(randomInt: number): slotsColumn {
	if (randomInt < 0.1) {
		return {
			top: '💰',
			mid: '💎',
			bot: '💵',
			multi: 10
		}
	}
	else if (randomInt < 0.3) {
		return {
			top: '💸',
			mid: '💰',
			bot: '💎',
			multi: 5
		}
	}
	else if (randomInt < 0.6) {
		return {
			top: '💵',
			mid: '💸',
			bot: '💰',
			multi: 3
		}
	}

	return {
		top: '💎',
		mid: '💵',
		bot: '💸',
		multi: 2
	}
}
