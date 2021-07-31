const { CommandInteraction } = require("discord.js");
const { Command } = require("../../types/command");

class IdCommand extends Command {
	constructor(client) {
		super(client, {
			id: `870347144693973114`,
			name: `id`,
			group: `misc`,
			memberName: `id`,
			description: `Gets the user's ID`,
		});
	}

	/**
	 *
	 * @param {CommandInteraction} interaction
	 */
	async run(interaction) {
		const args = interaction.options;
		const user = args.getUser('user', false) || interaction.user;
		await interaction.reply({ ephemeral: true, content: `${user.username}'s ID is ${user.id}` });
		return;
	}
}

module.exports = IdCommand;