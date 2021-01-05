import Eris from 'eris'
import { PrismaClient } from '@prisma/client'
import { Command } from './types/Commands'
import ArgParser from './utils/ArgParser'
import { DiscordInteractions } from 'slash-commands'
import { SlashCommand } from './types/SlashCommands'
import * as fs from 'fs'
import * as path from 'path'
import { botToken, clientId, debug } from './config'

interface Sets {
	adminUsers: Set<string>
	spamCooldown: Set<string | unknown>
}

class App {
	bot: Eris.Client
	prisma: PrismaClient
	commands: Command[]
	slashCommands: SlashCommand[]
	parse: ArgParser
	sets: Sets

	constructor(token: string, options: Eris.ClientOptions) {
		this.bot = new Eris.Client(token, options)
		this.prisma = new PrismaClient()
		this.commands = []
		this.slashCommands = []
		this.parse = new ArgParser(this)
		this.sets = this.loadSets()
	}

	async launch(): Promise<void> {
		const eventFiles = fs.readdirSync(path.join(__dirname, '/events'))

		// load all commands to array
		this.commands = await this.loadCommands()

		// load slash commands - new discord feature
		this.slashCommands = await this.loadSlashCommands()

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

	async loadSlashCommands(): Promise<SlashCommand[]> {
		const interactions = new DiscordInteractions({
			applicationId: clientId,
			publicKey: '',
			authToken: botToken
		})
		const commandFiles = fs.readdirSync(path.join(__dirname, '/slash-commands'))
		const commandsArr: SlashCommand[] = []

		// remove current slash commands
		const currentInteractions = await interactions.getApplicationCommands(debug ? '497302646521069568' : undefined)
		for (const i of currentInteractions) {
			await interactions.deleteApplicationCommand(i.id, debug ? '497302646521069568' : undefined)
		}

		console.log(`Removed ${currentInteractions.length} slash commands.`)

		// loop through slash-commands files and create interactions
		for (const file of commandFiles) {
			try {
				delete require.cache[require.resolve(`./slash-commands/${file}`)]
			}
			catch (err) {
				console.warn(err)
			}

			const { command }: { command: SlashCommand } = await import(`./slash-commands/${file}`)

			await interactions.createApplicationCommand(command, debug ? '497302646521069568' : undefined)

			console.log(`Created slash command - ${command.name}`)

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
