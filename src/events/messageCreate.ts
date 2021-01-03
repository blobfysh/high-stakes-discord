import { Message } from 'eris'
import { prefix, debug } from '../config'
import App from '../app'

export async function run(this: App, message: Message): Promise<void> {
	if (message.author.bot) return

	if (!message.content.toLowerCase().startsWith(prefix)) return

	const args = message.content.slice(prefix.length).split(/ +/)
	const commandName = args.shift()?.toLowerCase()

	const command = this.commands.find(cmd => cmd.name === commandName || (cmd.aliases.length && cmd.aliases.includes(commandName ?? '')))

	// no command was found
	if (!command) return

	/* TODO add categories to commands and check if user is admin here
	if (command.category == 'admin' && !this.sets.adminUsers.has(message.author.id)) return
	*/

	/* TODO check for required permissions to run command here
	if (message.guildID && !botHasPermissions(message, message.channel.permissionsOf(this.bot.user.id), this.config.requiredPerms)) return
	*/

	// check if user has spam cooldown
	if (this.sets.spamCooldown.has(message.author.id)) {
		const botMsg = await message.channel.createMessage('⏱ HEY SLOW IT DOWN `2 seconds`')
		setTimeout(() => {
			botMsg.delete()
		}, 2000)

		return
	}

	// execute command
	try {
		console.log(`${message.author.id} ran command: ${command.name}`)

		await command.execute(this, message, { args, prefix })

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

/*
function botHasPermissions(message, botPerms, requiredPerms) {
	const neededPerms = []

	for (const perm of Object.keys(requiredPerms)) {
		if (!botPerms.has(perm)) {
			neededPerms.push(requiredPerms[perm])
		}
	}

	if (neededPerms.length) {
		const permsString = neededPerms.map(perm => neededPerms.length > 1 && neededPerms.indexOf(perm) == (neededPerms.length - 1) ? `or \`${perm}\`` : `\`${perm}\``).join(', ')
		if (!neededPerms.includes('Send Messages')) message.channel.createMessage(`I don't have permission to ${permsString}... Please reinvite me or give me those permissions :(`)
		return false
	}
	return true
}
*/
