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
		const lessons = this.client.lessons.keyArray();
		message.say(`Currently ongoing lessons:\r\n${lessons}`);
	}
};