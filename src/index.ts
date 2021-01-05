import { botToken } from './config'
import App from './app'

async function main() {
	const app = new App(`Bot ${botToken}`, {
		disableEvents: {
			GUILD_BAN_ADD: true,
			GUILD_BAN_REMOVE: true,
			MESSAGE_DELETE: true,
			MESSAGE_DELETE_BULK: true,
			MESSAGE_UPDATE: true,
			TYPING_START: true,
			VOICE_STATE_UPDATE: true
		},
		allowedMentions: {
			everyone: false
		},
		messageLimit: 10,
		defaultImageFormat: 'png',
		defaultImageSize: 256,
		restMode: true,
		intents: [
			'guilds',
			'guildMembers',
			'guildMessages',
			'guildMessageReactions',
			'directMessages'
		]
	})

	app.launch()
}

main()
