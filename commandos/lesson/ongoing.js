const commando = require(`discord.js-commando`);

module.exports = class OngoingLessonsCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: `ongoing`,
			group: `lesson`,
			memberName: `ongoing`,
			description: `Prints out all ongoing lessons`,
			examples: [ `ongoing` ],
			guildOnly: true,
		});
	}

	run(message) {
		message.say(`Ongoing lessons: ${this.client.lessons.size}`);
	}
};