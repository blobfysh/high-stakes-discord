import { InteractionResponseType, MessageFlags, ApplicationCommandOptionType } from 'slash-commands'
import { SlashCommand } from '../types/SlashCommands'
import { User } from '@prisma/client'
import { initDeck, drawCard, genEmbed, loserEmbed, winnerEmbed, tieEmbed, getScore } from '../commands/blackjack'

export const command: SlashCommand = {
	name: 'blackjack',
	description: 'Play a game of blackjack against the bot. Whoever gets closer to 21 without going over, wins!',
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
		const cooldown = await app.cd.getCooldown(i.member.user.id, 'BLACKJACK')
		const gambleAmount = i.data?.options?.find(opt => opt.name === 'amount')?.value as number

		// validations
		if (cooldown) {
			return i.respond({
				type: InteractionResponseType.CHANNEL_MESSAGE,
				data: {
					content: `❌ You just played!!! Wait \`${cooldown}\` before starting another blackjack.`,
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

		const col = app.msgCollector.createChannelCollector(i.channel_id, m => m.author.id === i.member.user.id, 60000)
		const deck = initDeck()
		const playerCards = [drawCard(deck), drawCard(deck)]
		const dealerCards = [drawCard(deck)]
		let playerFinal = 0
		let dealerFinal = 0

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
		await app.cd.createCooldown(i.member.user.id, 'BLACKJACK', 90)

		// initial interaction response
		await i.respond({
			type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				embeds: [genEmbed(i.member.user.username, playerCards, dealerCards, gambleAmount).embed]
			}
		})

		col.e.on('collect', async m => {
			if (m.content.toLowerCase().startsWith('hit')) {
				playerCards.push(drawCard(deck))

				const playerScore = getScore(playerCards)

				if (playerScore.minScore > 21) {
					app.msgCollector.stopCollector(col)

					i.followUp({
						embeds: [loserEmbed(i.member.user.username, playerCards, dealerCards, gambleAmount).embed]
					})
				}
				else {
					i.followUp({
						embeds: [genEmbed(i.member.user.username, playerCards, dealerCards, gambleAmount).embed]
					})
				}
			}
			else if (m.content.toLowerCase().startsWith('stand')) {
				app.msgCollector.stopCollector(col)

				const playerScore = getScore(playerCards)

				if (playerScore.score > 21) {
					playerFinal = playerScore.minScore
				}
				else {
					playerFinal = playerScore.score
				}

				while (getScore(dealerCards).minScore < 17) {
					dealerCards.push(drawCard(deck))

					const dealer = getScore(dealerCards)

					if (dealer.score > 17 && dealer.score <= 21) {
						dealerFinal = dealer.score
						break
					}

					dealerFinal = dealer.minScore
				}

				if (dealerFinal > 21 || playerFinal > dealerFinal) {
					// player won
					await app.prisma.user.update({
						where: {
							id: i.member.user.id
						},
						data: {
							balance: {
								increment: gambleAmount * 2
							}
						}
					})

					i.followUp({
						embeds: [winnerEmbed(i.member.user.username, playerCards, dealerCards, gambleAmount).embed]
					})
				}
				else if (playerFinal < dealerFinal) {
					// player lost
					i.followUp({
						embeds: [loserEmbed(i.member.user.username, playerCards, dealerCards, gambleAmount).embed]
					})
				}
				else {
					// tie
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

					i.followUp({
						embeds: [tieEmbed(i.member.user.username, playerCards, dealerCards).embed]
					})
				}
			}
		})
		col.e.on('end', reason => {
			if (reason === 'time') {
				return i.followUp({
					content: `<@${i.member.user.id}>, '**You took too long to make a decision!** Your game of blackjack has expired.'`
				})
			}
		})
	}
}
