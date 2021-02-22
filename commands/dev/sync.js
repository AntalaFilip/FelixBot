const { Command, CommandoMessage } = require('discord.js-commando');

class SyncCommand extends Command {
	constructor(client) {
		super(client, {
			name: `sync`,
			group: `dev`,
			memberName: `sync`,
			description: `Sync the client with the database`,
			examples: [`sync`, `sync`],
			userPermissions: [`MANAGE_GUILD`],
		});
	}

	/**
	 * Runs the Sync command with the specified Message and arguments
	 * @param {CommandoMessage} message
	 */
	run(message) {
		global.client.lessonManager.forceSync()
			.then(r => {
				message.reply(`Synced!`)
					.then(msg => msg.delete({ timeout: 5000 }));
				message.delete({ timeout: 5000 });
			})
			.catch(err => {
				message.reply(`An error has ocurred`).then(msg => msg.delete({ timeout: 5000 }));
				message.delete({ timeout: 5000 });
				throw err;
			});
	}
}

module.exports = SyncCommand;