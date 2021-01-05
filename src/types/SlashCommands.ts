import { Interaction, PartialApplicationCommand, InteractionResponse, AllowedMentions, MessageFlags, ApplicationCommandInteractionDataOption } from 'slash-commands'
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
interface SlashCommandResponse extends Omit<InteractionResponse, 'data'> {
	data?: SlashCommandResponseCallbackData
}

export interface SlashCommand extends PartialApplicationCommand {
	execute(app: App, i: Interaction): Promise<SlashCommandResponse>
}

export type ValueData<T> = {
    name: string
    value: T
}
export type NestedData = {
    name: string
    options: ApplicationCommandInteractionDataOption[]
}
