const { CmdMessageResponse } = require("../../util/interactions");
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
			examples: [`flip`],
			throttling: { duration: 60, usages: 3 },
		});
	}

	/**
	 *
	 * @param {CommandInteraction} interaction
	 * @returns
	 */
	async run(interaction) {
		const args = interaction.options;
		const silent = args.get('silent');
		/** @type {boolean} */
		const ephemeral = (silent && silent.value) || false;
		const random = Math.random();
		const rounded = Math.round(random);
		if (rounded == 0) {
			return await interaction.reply({ ephemeral, content: `It's heads! (0)` });
		}
		else if (rounded == 1) {
			return await interaction.reply({ ephemeral, content: `It's heads! (0)` });
		}
	}
}

module.exports = FlipCommand;