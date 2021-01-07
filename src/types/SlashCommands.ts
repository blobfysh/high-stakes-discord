import { PartialApplicationCommand, InteractionResponse, AllowedMentions, MessageFlags } from 'slash-commands'
import Interaction from '../structures/Interaction'
import { EmbedOptions } from 'eris'
import App from '../app'

type SlashCommandContentMessage = {
	tts?: boolean
    content: string
    embeds?: EmbedOptions[]
    allowedMentions?: AllowedMentions
    flags?: MessageFlags
}

type SlashCommandEmbedMessage = {
	tts?: boolean
    content?: string
    embeds: EmbedOptions[]
    allowedMentions?: AllowedMentions
    flags?: MessageFlags
}

type SlashCommandResponseCallbackData = SlashCommandEmbedMessage | SlashCommandContentMessage

// writing my own response type so I can use eris EmbedOptions interface
export interface SlashCommandResponse extends Omit<InteractionResponse, 'data'> {
	data?: SlashCommandResponseCallbackData
}

export interface ApplicationCommandInteractionData {
	id: string
	name: string
	options?: ApplicationCommandInteractionDataOption[]
}

interface ApplicationCommandInteractionDataOption {
	name: string
	value?: string | number | boolean
	options?: ApplicationCommandInteractionDataOption[]

}

export interface SlashCommand extends PartialApplicationCommand {
	execute(app: App, i: Interaction): Promise<void>
}
