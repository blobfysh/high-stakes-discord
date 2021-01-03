import { Message, Member, GuildTextableChannel } from 'eris'
import App from '../app'

class ArgParser {
	private app: App

	constructor(app: App) {
		this.app = app
	}

	/**
     *
     * @param {string[]} args Array of args to find numbers from
     */
	numbers(args: string[]): number[] {
		const numbers = []

		for (let arg of args) {
			arg = arg.replace(/,/g, '')

			if (this.isNumber(arg)) {
				if (arg.endsWith('m')) {
					numbers.push(Math.floor(parseFloat(arg) * 1000000))
				}
				else if (arg.endsWith('k')) {
					numbers.push(Math.floor(parseFloat(arg) * 1000))
				}
				else {
					numbers.push(Math.floor(Number(arg)))
				}
			}
		}

		return numbers.filter(num => num >= 0)
	}

	members(message: Message<GuildTextableChannel>, args: string[]): (Member | undefined)[] {
		const newArgs = args.slice(0, 6)

		const userArgs = newArgs.map((arg, i) => {
			// regex tests for <@!1234etc>, will pass when player mentions someone or types a user id
			if (/^<?@?!?(\d+)>?$/.test(arg)) {
				// remove <, @, !, > characters from arg to leave only numbers
				const userRegex = arg.match(/^<?@?!?(\d+)>?$/)
				const userId = userRegex ? userRegex[1] : ''

				// find member matching id
				const member = message.channel.guild.members.find(m => m.id === userId)

				return member
			}
			else if (/^(.*)#([0-9]{4})$/.test(arg)) {
				const userTag = arg.split('#')
				// check for usernames with space
				const previousArgs = newArgs.slice(0, i)

				previousArgs.push(userTag[0])

				for (let i2 = 1; i2 < previousArgs.length + 1; i2++) {
					// start checking args backwards, starting from the arg that had # in it, ie. big blob fysh#4679, it would check blob fysh then check big blob fysh
					const userToCheck = previousArgs.slice(i2 * -1).join(' ')

					const member = message.channel.guild.members.find(m => !!(m.username.toLowerCase() === userToCheck.toLowerCase() && m.discriminator === userTag[1]) ||
                        !!((m.nick && m.nick.toLowerCase() === userToCheck) && m.discriminator === userTag[1]))

					if (member) return member
				}

				return undefined
			}

			// no user found
			return undefined
		})

		return userArgs.filter(arg => arg !== undefined)
	}

	private isNumber(arg: string) {
		if (!isNaN(Number(arg)) && !arg.includes('.')) {
			return true
		}
		else if (arg.endsWith('m') && !isNaN(Number(arg.slice(0, -1)))) {
			return true
		}
		else if (arg.endsWith('k') && !isNaN(Number(arg.slice(0, -1)))) {
			return true
		}

		return false
	}
}

export default ArgParser
