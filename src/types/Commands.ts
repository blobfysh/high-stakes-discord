import { Message } from 'eris'
import App from '../app'

interface CommandArguments {
	prefix: string
	args: string[]
}

export interface Command {
	name: string
	aliases: string[]
	description: string
	execute(app: App, message: Message, commandArgs: CommandArguments): Promise<void>
}
