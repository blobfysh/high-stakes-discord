import { RawPacket } from 'eris'
import fetch from 'node-fetch'
import { InteractionType } from 'slash-commands'
import { Interaction } from '../types/SlashCommands'
import App from '../app'

export async function run(this: App, packet: RawPacket, id: number): Promise<void> {
	// interactions stuff
	if (packet.t === 'INTERACTION_CREATE') {
		const interaction: Interaction = packet.d

		if (interaction.member.user.bot) return

		if (interaction.type === InteractionType.APPLICATION_COMMAND) {
			const command = this.slashCommands.find(cmd => cmd.name === interaction.data.name)

			// add user entry to database
			try {
				await this.prisma.user.create({
					data: {
						id: interaction.member.user.id
					}
				})
			}
			catch (err) {
				// user already has account
			}

			const response = await command?.execute(this, interaction)

			if (response) {
				try {
					await fetch(`https://discord.com/api/v8/interactions/${interaction.id}/${interaction.token}/callback`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify(response)
					})
				}
				catch (err) {
					console.error(err)
				}
			}
		}
	}
}
