const { Command } = require("../../types/command");
const config = require('../../config.json');

class EvalCommand extends Command {
	/**
	 *
	 * @param {import("../../client")} client
	 */
	constructor(client) {
		super(client, {
			id: ``,
			name: `eval`,
			group: `misc`,
			memberName: `eval`,
			description: `Evaluates javascript code`,
		});
		client.on('messageCreate', async message => {
			if (message.content.startsWith('fbEval')) {
				if (!message.member.permissions.has('ADMINISTRATOR')) return;
				try {
					let res = this.exec(message.content.split(" ").slice(1).join(" "));
					if (res.length > 1990) res = res.slice(0, 1990);
					await message.reply({ content: `\`\`\`${res}\`\`\`` });
				}
				catch (err) {
					this.client.interactionManager.logger.warn('Failed EVAL ', err);
					await message.reply(`An error has occurred: ${err}`);
				}
			}
		});
	}

	async run(interaction) {

	}

	/**
	 * @returns {string}
	 */
	exec(code) {
		let evaled = eval(code);
		if (typeof evaled != 'string') {
			evaled = require('util').inspect(evaled);
		}
		return evaled;
	}
}

module.exports = EvalCommand;