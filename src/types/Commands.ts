import { Message, GuildTextableChannel, TextableChannel, Constants } from 'eris'
import App from '../app'

interface CommandArguments {
	prefix: string
	args: string[]
}

export type CommandPermission = keyof typeof Constants.Permissions

type CommandCategory = 'admin' | 'game' | 'info'

// Discriminating union based on guildOnly field which allows me to get the correct message channel types
interface DMCommand {
	name: string
	aliases: string[]
	description: string
	category: CommandCategory
	permissions: CommandPermission[]
	guildOnly: false
	execute(app: App, message: Message<TextableChannel>, commandArgs: CommandArguments): Promise<void | any>
}
interface GuildCommand {
	name: string
	aliases: string[]
	description: string
	category: CommandCategory
	permissions: CommandPermission[]
	guildOnly: true
	execute(app: App, message: Message<GuildTextableChannel>, commandArgs: CommandArguments): Promise<void | any>
}

export type Command = DMCommand | GuildCommand
