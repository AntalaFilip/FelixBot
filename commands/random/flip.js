const { Command } = require("../../types/command");
const { CommandInteraction } = require("discord.js");

class FlipCommand extends Command {
	constructor(client) {
		super(client, {
			id: `863018388531970078`,
			name: `flip`,
			group: `random`,
			memberName: `flip`,
			description: `Flips a coin`,
		});
	}

	/**
	 *
	 * @param {CommandInteraction} interaction
	 * @returns
	 */
	async run(interaction) {
		const args = interaction.options;
		const silent = args.getBoolean('silent', false);
		const ephemeral = silent ?? false;
		const random = Math.random();
		const rounded = Math.round(random);
		this.client.interactionManager.logger.verbose(`Flip result:`, random, rounded);
		if (rounded == 0) {
			return await interaction.reply({ ephemeral, content: `It's heads! (0)` });
		}
		else if (rounded == 1) {
			return await interaction.reply({ ephemeral, content: `It's tails! (1)` });
		}
	}
}

module.exports = FlipCommand;