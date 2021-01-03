interface EmbedField {
	name: string
	value: string
	inline: boolean
}

interface EmbedFooter {
	text: string
	icon_url: string | null
}

interface EmbedAuthor {
	name: string
	icon_url: string | null
	url: string | null
}

interface EmbedImage {
	url: string
}

interface EmbedInterface {
	fields: EmbedField[]
	color: number
	title?: string
	url?: string
	description?: string
	image?: EmbedImage
	thumbnail?: EmbedImage
	footer?: EmbedFooter
	author?: EmbedAuthor
	timestamp?: Date
}

class Embed {
	embed: EmbedInterface

	constructor() {
		this.embed = {
			fields: [],
			color: 7099568
		}
	}

	addField(name: string, value: string, inline = false): this {
		if (!name) {
			return this
		}
		else if (this.embed.fields.length > 25) {
			return this
		}
		else if (!value) {
			return this
		}

		this.embed.fields.push({
			name: name.substring(0, 256),
			value: value.substring(0, 1024),
			inline
		})

		return this
	}

	setTitle(title: string): this {
		if (!title) return this

		this.embed.title = title.substring(0, 256)

		return this
	}

	setURL(url: string): this {
		if (!url) return this

		this.embed.url = url

		return this
	}

	setDescription(desc: string): this {
		if (!desc) return this

		this.embed.description = desc.substring(0, 2048)

		return this
	}

	setImage(url: string): this {
		if (!url) return this

		this.embed.image = {
			url
		}

		return this
	}

	setThumbnail(url: string): this {
		if (!url) return this

		this.embed.thumbnail = {
			url
		}

		return this
	}

	setFooter(text: string, icon: string | undefined): this {
		if (!text) return this

		this.embed.footer = {
			text: text.substring(0, 2048),
			icon_url: icon ?? null
		}

		return this
	}

	setTimestamp(timestamp = new Date()): this {
		this.embed.timestamp = timestamp

		return this
	}

	setAuthor(name: string, icon: string | undefined, url: string | undefined): this {
		if (!name) return this

		this.embed.author = {
			name: name.substring(0, 256),
			icon_url: icon ?? null,
			url: url ?? null
		}

		return this
	}

	setColor(color: string | number): this {
		if (!color) return this

		if (typeof color === 'string') {
			color = parseInt(color.replace('#', ''), 16)
		}

		this.embed.color = color

		return this
	}

	addBlankField(inline = false): this {
		return this.addField('\u200B', '\u200B', inline)
	}
}

export default Embed
