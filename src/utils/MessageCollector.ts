import App from '../app'
import { EventEmitter } from 'events'
import { GuildTextableChannel, Message } from 'eris'

interface ChannelCollector {
	channelId: string
	e: EventEmitter
	filter: (m: Message<GuildTextableChannel>) => boolean
	collected: Message[]
	limit?: number
	timeout: NodeJS.Timeout
}

class MessageCollector {
	private app: App
	private channelCollectors: ChannelCollector[]

	constructor(app: App) {
		this.app = app
		this.channelCollectors = []

		this.app.bot.on('messageCreate', this.verify.bind(this))
	}

	verify(msg: Message<GuildTextableChannel>): void {
		if (msg.author.bot) return

		const collectors = this.channelCollectors.filter(c => c.channelId === msg.channel.id)

		for (const collector of collectors) {
			if (collector.filter(msg)) {
				collector.e.emit('collect', msg)
				collector.collected.push(msg)

				if (collector.limit && collector.collected.length >= collector.limit) {
					this.stopCollector(collector, collector.collected)
				}
			}
		}
	}

	/**
	 *
	 * @param channelId ID of channel
	 * @param filter Function to filter messages with
	 * @param time Milliseconds collector should last
	 * @param limit Number of messages to collect, will cause collector to end with an array of messages
	 */
	createChannelCollector(channelId: string, filter: (m: Message<GuildTextableChannel>) => boolean, time = 15000, limit?: number): ChannelCollector {
		const event = new EventEmitter()

		const collectorObj: ChannelCollector = {
			channelId,
			e: event,
			filter,
			collected: [],
			limit,
			timeout: setTimeout(() => {
				this.stopCollector(collectorObj, 'time')
			}, time)
		}

		this.channelCollectors.push(collectorObj)

		return collectorObj
	}

	stopCollector(collector: ChannelCollector, message: string | Message[] = 'forced'): void {
		if (this.channelCollectors.includes(collector)) {
			collector.e.emit('end', message)
			clearTimeout(collector.timeout)
			this.channelCollectors.splice(this.channelCollectors.indexOf(collector), 1)
		}
	}
}

export default MessageCollector
