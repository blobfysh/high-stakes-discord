import { InteractionType, PartialApplicationCommand, InteractionResponse, AllowedMentions, MessageFlags, GuildMember } from 'slash-commands'
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

interface ApplicationCommand {
	id: string
    type: InteractionType
    data: ApplicationCommandInteractionData
    guild_id: string
    channel_id: string
    member: GuildMember
	token: string
	version: number
}

interface BaseInteraction {
	id: string
    type: Exclude<InteractionType, InteractionType.APPLICATION_COMMAND>
    data?: ApplicationCommandInteractionData
    guild_id: string
    channel_id: string
    member: GuildMember
	token: string
	version: number
}

export type Interaction = ApplicationCommand | BaseInteraction

interface ApplicationCommandInteractionData {
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
	execute(app: App, i: Interaction): Promise<SlashCommandResponse>
}
