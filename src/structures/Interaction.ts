import { ApplicationCommandInteractionData, SlashCommandResponse } from '../types/SlashCommands'
import { InteractionType, GuildMember } from 'slash-commands'
import fetch from 'node-fetch'
import { WebhookPayload } from 'eris'
import { clientId } from '../config'

class Interaction {
	id: string
	type: InteractionType
	data: ApplicationCommandInteractionData
	guild_id: string
	channel_id: string
	member: GuildMember
	token: string
	version: number

	constructor(i: Interaction) {
		this.id = i.id
		this.type = i.type
		this.data = i.data
		this.guild_id = i.guild_id
		this.channel_id = i.channel_id
		this.member = i.member
		this.token = i.token
		this.version = i.version
	}

	/**
	 * Respond to an interaction. Can only be used once, further responses should use the followUp method
	 * @param response
	 */
	async respond(response: SlashCommandResponse): Promise<void> {
		await fetch(`https://discord.com/api/v8/interactions/${this.id}/${this.token}/callback`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(response)
		})
	}

	// avatarURL and username have no effect on the interaction webhook
	async followUp(options: Omit<WebhookPayload, 'file' | 'auth' | 'avatarURL' | 'username' | 'allowedMentions'>): Promise<void> {
		await fetch(`https://discord.com/api/v8/webhooks/${clientId}/${this.token}${options.wait ? '?wait=true' : ''}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				content: options.content,
				embeds: options.embeds,
				tts: options.tts
			})
		})
	}
}

export default Interaction
