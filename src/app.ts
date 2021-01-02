import Eris from 'eris'
import { PrismaClient } from '@prisma/client'
import { Command } from './types/Commands'
import ArgParser from './utils/ArgParser'
import * as fs from 'fs'
import * as path from 'path'

interface Sets {
	adminUsers: Set<string>
	spamCooldown: Set<string | unknown>
}

class App {
	bot: Eris.Client
	prisma: PrismaClient
	commands: Command[]
	parse: ArgParser
	sets: Sets

	constructor(token: string, options: Eris.ClientOptions) {
		this.bot = new Eris.Client(token, options)
		this.prisma = new PrismaClient()
		this.commands = []
		this.parse = new ArgParser(this)
		this.sets = this.loadSets()
	}

	async launch(): Promise<void> {
		const eventFiles = fs.readdirSync(path.join(__dirname, '/events'))

		// load all commands to array
		this.commands = await this.loadCommands()

		for (const event of eventFiles) {
			const { run } = await import(`./events/${event}`)

			this.bot.on(event.replace(/.js|.ts/, ''), run.bind(this))
		}

		console.info('[APP] Listening for events')
		await this.bot.connect()
	}

	async loadCommands(): Promise<Command[]> {
		const commandFiles = fs.readdirSync(path.join(__dirname, '/commands'))
		const commandsArr: Command[] = []

		for (const file of commandFiles) {
			try {
				// remove command file cache so you can reload commands while bot is running: eval app.commands = app.loadCommands();
				delete require.cache[require.resolve(`./commands/${file}`)]
			}
			catch (err) {
				console.warn(err)
			}

			const { command }: { command: Command } = await import(`./commands/${file}`)

			commandsArr.push(command)
		}

		return commandsArr
	}

	loadSets(): Sets {
		return {
			adminUsers: new Set(['168958344361541633']),
			spamCooldown: new Set()
		}
	}
}

export default App
