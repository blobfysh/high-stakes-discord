import { User } from '@prisma/client'
import { Command } from '../types/Commands'
import { reply } from '../utils/messageUtils'
import Embed from '../structures/Embed'

interface Card {
	face: string
	suit: string
	value: number
	display: string
}

const suits = ['♥', '♠', '♦', '♣']
const faces = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A', 'J', 'K', 'Q']

export const command: Command = {
	name: 'blackjack',
	aliases: ['bj'],
	description: 'Play a game of blackjack. Type hit to draw a random card from the deck or type stand to stop drawing cards and see if the dealer gets closer to 21 than you. Whoever gets closer to 21 without going over, wins!',
	category: 'game',
	permissions: ['sendMessages'],
	guildOnly: true,
	async execute(app, message, { args }) {
		const userData = await app.prisma.user.findUnique({
			where: {
				id: message.author.id
			}
		}) as User
		const cooldown = await app.cd.getCooldown(message.author.id, 'BLACKJACK')
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
				content: `❌ You just played!!! Wait \`${cooldown}\` before starting another blackjack.`
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

		const col = app.msgCollector.createChannelCollector(message.channel.id, m => m.author.id === message.author.id, 60000)
		const deck = initDeck()
		const playerCards = [drawCard(deck), drawCard(deck)]
		const dealerCards = [drawCard(deck)]
		let playerFinal = 0
		let dealerFinal = 0

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
		await app.cd.createCooldown(message.author.id, 'BLACKJACK', 90)

		await message.channel.createMessage({
			embed: genEmbed(message.author.username, playerCards, dealerCards, gambleAmount).embed
		})

		col.e.on('collect', async m => {
			if (m.content.toLowerCase().startsWith('hit')) {
				playerCards.push(drawCard(deck))

				const playerScore = getScore(playerCards)

				if (playerScore.minScore > 21) {
					app.msgCollector.stopCollector(col)

					message.channel.createMessage({
						embed: loserEmbed(message.author.username, playerCards, dealerCards, gambleAmount).embed
					})
				}
				else {
					message.channel.createMessage({
						embed: genEmbed(message.author.username, playerCards, dealerCards, gambleAmount).embed
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
							id: message.author.id
						},
						data: {
							balance: {
								increment: gambleAmount * 2
							}
						}
					})

					message.channel.createMessage({
						embed: winnerEmbed(message.author.username, playerCards, dealerCards, gambleAmount).embed
					})
				}
				else if (playerFinal < dealerFinal) {
					// player lost
					message.channel.createMessage({
						embed: loserEmbed(message.author.username, playerCards, dealerCards, gambleAmount).embed
					})
				}
				else {
					// tie
					await app.prisma.user.update({
						where: {
							id: message.author.id
						},
						data: {
							balance: {
								increment: gambleAmount
							}
						}
					})

					message.channel.createMessage({
						embed: tieEmbed(message.author.username, playerCards, dealerCards).embed
					})
				}
			}
		})
		col.e.on('end', reason => {
			if (reason === 'time') {
				return reply(message, {
					content: '**You took too long to make a decision!** Your game of blackjack has expired.'
				})
			}
		})
	}
}

export function drawCard(deck: Card[]): Card {
	const index = Math.floor(Math.random() * deck.length)
	const card = deck[index]
	deck.splice(index, 1) // Removes card from original array

	return card
}

export function initDeck(): Card[] {
	const deck: Card[] = []

	for (let i = 0; i < suits.length; i++) {
		for (let i2 = 0; i2 < faces.length; i2++) {
			let tmpVal

			if (faces[i2] === 'J' || faces[i2] === 'Q' || faces[i2] === 'K') {
				tmpVal = 10
			}
			else if (faces[i2] === 'A') {
				tmpVal = 11
			}
			else {
				tmpVal = parseInt(faces[i2])
			}

			const card: Card = {
				face: faces[i2],
				suit: suits[i],
				value: tmpVal,
				display: faces[i2] + suits[i]
			}

			deck.push(card)
		}
	}

	return deck
}

export function genEmbed(username: string, playerCards: Card[], dealerCards: Card[], gambleAmount: number): Embed {
	const playerVal = getScore(playerCards)
	const dealerVal = getScore(dealerCards)
	let playerString = ''
	let dealerString = ''

	for (let i = 0; i < playerCards.length; i++) {
		playerString += playerCards[i].display
	}
	for (let i = 0; i < dealerCards.length; i++) {
		dealerString += dealerCards[i].display
	}

	const embed = new Embed()
		.setAuthor('Blackjack')
		.setDescription('Type `hit` to draw another card or `stand` to pass.')
		.addField('__Bet__', `${gambleAmount} credits`)
		.addBlankField()
		.addField(`${username} - **${playerCards.filter(card => card.face === 'A').length && playerVal.score <= 21 ? `${playerVal.score}/${playerVal.minScore}` : playerVal.minScore}**`, playerString)
		.addField(`😎 Dealer - **${dealerVal.score > 21 ? dealerVal.minScore : dealerVal.score}**`, dealerString)
		.setFooter('You have 60 seconds to finish this game.')

	return embed
}


export function getScore(playersHand: Card[]): { score: number, minScore: number } {
	let score = 0
	let minScore = 0 // Used if player has aces...

	for (let i = 0; i < playersHand.length; i++) {
		if (playersHand[i].face === 'A') {
			minScore -= 10
		}

		score += playersHand[i].value
		minScore += playersHand[i].value
	}

	return { score, minScore }
}

export function winnerEmbed(username: string, playerCards: Card[], dealerCards: Card[], gambleAmount: number): Embed {
	const playerVal = getScore(playerCards)
	const dealerVal = getScore(dealerCards)
	let playerString = ''
	let dealerString = ''

	for (let i = 0; i < playerCards.length; i++) {
		playerString += playerCards[i].display
	}
	for (let i = 0; i < dealerCards.length; i++) {
		dealerString += dealerCards[i].display
	}

	const embed = new Embed()
		.setAuthor('Blackjack')
		.setDescription(`The dealer busted! You won **${gambleAmount * 2} credits**`)
		.addBlankField()
		.addField(`${username} - **${playerCards.filter(card => card.face === 'A').length && playerVal.score <= 21 ? `${playerVal.score}/${playerVal.minScore}` : playerVal.minScore}**`, playerString)
		.addField(`😡 Dealer - **${dealerVal.score > 21 ? dealerVal.minScore : dealerVal.score}**`, dealerString)
		.setColor(720640)

	return embed
}

export function loserEmbed(username: string, playerCards: Card[], dealerCards: Card[], gambleAmount: number): Embed {
	const playerVal = getScore(playerCards)
	const dealerVal = getScore(dealerCards)
	let playerString = ''
	let dealerString = ''

	for (let i = 0; i < playerCards.length; i++) {
		playerString += playerCards[i].display
	}
	for (let i = 0; i < dealerCards.length; i++) {
		dealerString += dealerCards[i].display
	}

	const embed = new Embed()
		.setAuthor('Blackjack')
		.setDescription(`You lost **${gambleAmount} credits**...`)
		.addBlankField()
		.addField(`${username} - **${playerCards.filter(card => card.face === 'A').length && playerVal.score <= 21 ? `${playerVal.score}/${playerVal.minScore}` : playerVal.minScore}**`, playerString)
		.addField(`😂 Dealer - **${dealerVal.score > 21 ? dealerVal.minScore : dealerVal.score}**`, dealerString)
		.setColor(13632027)

	return embed
}

export function tieEmbed(username: string, playerCards: Card[], dealerCards: Card[]): Embed {
	const playerVal = getScore(playerCards)
	const dealerVal = getScore(dealerCards)
	let playerString = ''
	let dealerString = ''

	for (let i = 0; i < playerCards.length; i++) {
		playerString += playerCards[i].display
	}
	for (let i = 0; i < dealerCards.length; i++) {
		dealerString += dealerCards[i].display
	}

	const embed = new Embed()
		.setAuthor('Blackjack')
		.setDescription('It\'s a tie! You lost no credits')
		.addBlankField()
		.addField(`${username} - **${playerCards.filter(card => card.face === 'A').length && playerVal.score <= 21 ? `${playerVal.score}/${playerVal.minScore}` : playerVal.minScore}**`, playerString)
		.addField(`😡 Dealer - **${dealerVal.score > 21 ? dealerVal.minScore : dealerVal.score}**`, dealerString)
		.setColor(10395294)

	return embed
}
