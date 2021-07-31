const { CommandInteraction } = require("discord.js");
const { Command } = require("../../types/command");

class SyncCommand extends Command {
	constructor(client) {
		super(client, {
			id: `863133102032683059`,
			name: `sync`,
			group: `misc`,
			memberName: `sync`,
			description: `Sync the client with the database`,
		});
	}

	/**
	 *
	 * @param {CommandInteraction} interaction
	 * @returns
	 */
	async run(interaction) {
		const ls = await this.client.lessonManager.forceSync();
		const ep = await this.client.edupageManager.loadEduPageData();
		return interaction.reply({ content: `Re-synced ${ls.length} lessons from the database & ${ep} objects from EduPage`, ephemeral: true });
	}
}

module.exports = SyncCommand;