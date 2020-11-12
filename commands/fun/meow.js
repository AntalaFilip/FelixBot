const commando = require(`discord.js-commando`);

module.exports = class MeowCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: `meow`,
			group: `fun`,
			memberName: `meow`,
			description: `Sends a meow`,
			examples: [ `meow` ],
			throttling: { duration: 60, usages: 1 },
		});
	}

	run(message) {
		message.say(`Meow!`);
	}
};