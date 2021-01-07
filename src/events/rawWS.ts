import { RawPacket } from 'eris'
import { InteractionType } from 'slash-commands'
import Interaction from '../structures/Interaction'
import App from '../app'

export async function run(this: App, packet: RawPacket, id: number): Promise<void> {
	// interactions stuff
	if (packet.t === 'INTERACTION_CREATE') {
		const interaction = new Interaction(packet.d)

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

			try {
				await command?.execute(this, interaction)
			}
			catch (err) {
				console.error(err)
			}
		}
	}
}
