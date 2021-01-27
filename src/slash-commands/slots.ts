import { InteractionResponseType, MessageFlags, ApplicationCommandOptionType } from 'slash-commands'
import { SlashCommand } from '../types/SlashCommands'
import { User } from '@prisma/client'
import { icons } from '../config'
import Embed from '../structures/Embed'
import { getSlot } from '../commands/slots'

export const command: SlashCommand = {
	name: 'slots',
	description: 'Bet some credits on a game of slots!',
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
		const cooldown = await app.cd.getCooldown(i.member.user.id, 'SLOTS')
		const gambleAmount = i.data?.options?.find(opt => opt.name === 'amount')?.value as number

		// validations
		if (cooldown) {
			return i.respond({
				type: InteractionResponseType.CHANNEL_MESSAGE,
				data: {
					content: `❌ You need to wait \`${cooldown}\` before playing another game of slots.`,
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
					id: i.member.user.id
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

		await i.respond({
			type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				embeds: [slotsEmbed.embed]
			}
		})

		setTimeout(() => {
			const newEmbed = new Embed()
				.setTitle('Slots')
				.setDescription(`${col1.top}${icons.slotsTop.repeat(2)}\n${col1.mid}${icons.slotsMid.repeat(2)}\n${col1.bot}${icons.slotsBot.repeat(2)}`)

			i.editResponse({
				embeds: [newEmbed.embed]
			})
		}, 1000)

		setTimeout(() => {
			const newEmbed = new Embed()
				.setTitle('Slots')
				.setDescription(`${col1.top}${col2.top}${icons.slotsTop}\n${col1.mid}${col2.mid}${icons.slotsMid}\n${col1.bot}${col2.bot}${icons.slotsBot}`)

			i.editResponse({
				embeds: [newEmbed.embed]
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

			i.editResponse({
				content: endString,
				embeds: [newEmbed.embed]
			})
		}, 3500)

		await app.cd.createCooldown(i.member.user.id, 'SLOTS', 60)
	}
}
