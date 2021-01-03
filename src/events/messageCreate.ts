import { GuildTextableChannel, Message } from 'eris'
import { CommandPermission } from '../types/Commands'
import { prefix, debug } from '../config'
import App from '../app'

export async function run(this: App, message: Message): Promise<void> {
	if (message.author.bot) return

	if (!message.content.toLowerCase().startsWith(prefix)) return

	const args = message.content.slice(prefix.length).split(/ +/)
	const commandName = args.shift()?.toLowerCase()

	const command = this.commands.find(cmd => cmd.name === commandName || (cmd.aliases.length && cmd.aliases.includes(commandName ?? '')))

	// no command was found
	if (!command) { return }

	else if (command.category === 'admin' && !this.sets.adminUsers.has(message.author.id)) { return }

	// check if bot has needed permissions to run command
	else if (message.guildID !== undefined && !botHasPermissions(<Message<GuildTextableChannel>>message, command.permissions)) { return }

	// guildOnly command cannot be used in DM channel
	else if (message.guildID === undefined && command.guildOnly) { return }

	// check if user has spam cooldown
	else if (this.sets.spamCooldown.has(message.author.id)) {
		const botMsg = await message.channel.createMessage('⏱ HEY SLOW IT DOWN `2 seconds`')
		setTimeout(() => {
			botMsg.delete()
		}, 2000)

		return
	}

	// execute command
	try {
		console.log(`${message.author.id} ran command: ${command.name}`)

		// have to do this for proper types in command files
		if (command.guildOnly) {
			await command.execute(this, <Message<GuildTextableChannel>>message, { args, prefix })
		}
		else {
			await command.execute(this, message, { args, prefix })
		}


		// dont add spamCooldown if user is admin
		if (debug || this.sets.adminUsers.has(message.author.id)) return

		const spamCD = 2000
		this.sets.spamCooldown.add(message.author.id)

		setTimeout(() => {
			this.sets.spamCooldown.delete(message.author.id)
		}, spamCD)
	}
	catch (err) {
		console.error(err)
		message.channel.createMessage('Command failed to execute!')
	}
}

function botHasPermissions(message: Message<GuildTextableChannel>, requiredPerms: CommandPermission[]) {
	const botPerms = message.channel.permissionsOf(message.channel.client.user.id)
	const neededPerms: CommandPermission[] = []

	for (const perm of requiredPerms) {
		if (!botPerms.has(perm)) {
			neededPerms.push(perm)
		}
	}

	if (neededPerms.length) {
		const permsString = neededPerms.map(perm => {
			if (neededPerms.length > 1 && neededPerms.indexOf(perm) === (neededPerms.length - 1)) {
				return `or \`${perm}\``
			}

			return `\`${perm}\``
		}).join(', ')

		if (!neededPerms.includes('sendMessages')) message.channel.createMessage(`I don't have permission to ${permsString}... Please reinvite me or give me those permissions :(`)

		return false
	}

	return true
}
