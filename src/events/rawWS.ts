import { RawPacket } from 'eris'
import fetch from 'node-fetch'
import { Interaction, InteractionType } from 'slash-commands'
import App from '../app'

export async function run(this: App, packet: RawPacket, id: number): Promise<void> {
	// interactions stuff
	if (packet.t === 'INTERACTION_CREATE') {
		const interaction: Interaction = packet.d

		if (interaction.type === InteractionType.APPLICATION_COMMAND) {
			const command = this.slashCommands.find(cmd => cmd.name === interaction.data.name)

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
