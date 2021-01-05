import App from '../app'
import { CooldownType } from '@prisma/client'

class Cooldowns {
	private app: App

	constructor(app: App) {
		this.app = app
	}

	async getCooldown(userId: string, type: CooldownType): Promise<string | undefined> {
		const cooldown = await this.app.prisma.cooldown.findUnique({
			where: {
				type_userId: {
					userId,
					type
				}
			}
		})


		if (cooldown) {
			const timeLeft = (cooldown.length * 1000) - (Date.now() - cooldown.createdAt.getTime())

			if (timeLeft > 0) {
				return this.formatTime(timeLeft)
			}
		}

		// no cooldown found
		return undefined
	}

	/**
	 * Creates a cooldown record for user in database.
	 * @param {string} userId ID of user to give cooldown to
	 * @param {CooldownType} type Type of cooldown
	 * @param {number} length Length in seconds cooldown lasts
	 */
	async createCooldown(userId: string, type: CooldownType, length: number): Promise<void> {
		// delete previous cooldown if it exists
		await this.app.prisma.cooldown.deleteMany({
			where: {
				user: {
					id: userId
				},
				type
			}
		})

		await this.app.prisma.cooldown.create({
			data: {
				type,
				length,
				user: {
					connect: {
						id: userId
					}
				}
			}
		})
	}

	async clearCooldown(userId: string, type: CooldownType): Promise<string> {
		const response = await this.app.prisma.cooldown.deleteMany({
			where: {
				user: {
					id: userId
				},
				type
			}
		})

		return response.count > 0 ?
			`Successfully removed ${type} cooldown from ${userId}` :
			'No cooldown to remove'
	}

	formatTime(ms: number): string {
		let remaining = ms
		const finalStr = []

		const rawDays = remaining / (1000 * 60 * 60 * 24)
		const days = Math.floor(rawDays)
		remaining %= 1000 * 60 * 60 * 24

		const rawHours = remaining / (1000 * 60 * 60)
		const hours = Math.floor(rawHours)
		remaining %= 1000 * 60 * 60

		const rawMinutes = remaining / (1000 * 60)
		const minutes = Math.floor(rawMinutes)
		remaining %= 1000 * 60

		const seconds = Math.floor(remaining / 1000)

		if (days > 0) {
			finalStr.push(days === 1 ? `${days} day` : `${days} days`)
		}
		if (hours > 0) {
			if (days > 0) {
				finalStr.push(`${rawHours.toFixed(1)} hours`)
				return finalStr.join(' ')
			}
			finalStr.push(hours === 1 ? `${hours} hour` : `${hours} hours`)
		}
		if (minutes > 0) {
			if (hours > 0 || days > 0) {
				finalStr.push(`${rawMinutes.toFixed(1)} minutes`)
				return finalStr.join(' ')
			}
			finalStr.push(minutes === 1 ? `${minutes} minute` : `${minutes} minutes`)
		}

		if (seconds !== 0) finalStr.push(seconds === 1 ? `${seconds} second` : `${seconds} seconds`)
		return finalStr.join(' ')
	}
}

export default Cooldowns
