const { Command } = require("../../types/command");
const { CallbackType } = require("../../util/interactions");

class SyncCommand extends Command {
	constructor(client) {
		super(client, {
			id: `863133102032683059`,
			name: `sync`,
			group: `misc`,
			memberName: `sync`,
			description: `Sync the client with the database`,
			examples: [`sync`],
		});
	}


	async run(interaction) {
		const ls = await this.client.lessonManager.forceSync();
		return {
			"type": CallbackType.CHANNEL_MESSAGE,
			"data": {
				"content": `Re-synced ${ls.length} lessons from the database`,
				"flags": 64,
			},
		};
	}
}

module.exports = SyncCommand;