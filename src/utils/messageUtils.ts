import { GuildTextableChannel, Message, MessageContent } from 'eris'

// conditional type to determine channel return type
type ChannelType<T> = T extends Message<GuildTextableChannel> ? Message<GuildTextableChannel> : Message

export function reply<T extends Message>(msg: T, content: MessageContent): Promise<ChannelType<T>> {
	if (typeof content === 'string') {
		content = {
			content
		}
	}

	Object.assign(content, {
		message_reference: {
			message_id: msg.id
		},
		allowedMentions: {
			replied_user: true
		}
	})

	return msg.channel.createMessage(content) as Promise<ChannelType<T>>
}
