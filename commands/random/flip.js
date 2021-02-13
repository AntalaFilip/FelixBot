const { Command, CommandoMessage } = require('discord.js-commando');

class FlipCommand extends Command {
	constructor(client) {
		super(client, {
			name: `flip`,
			group: `random`,
			memberName: `flip`,
			description: `Flips a coin`,
			examples: [ `flip` ],
			throttling: { duration: 60, usages: 3 },
		});
	}

	run(message) {
		const random = Math.random();
		const rounded = Math.round(random);
		if (rounded == 0) {
			message.say(`It's heads! (0)`);
		}
		else if (rounded == 1) {
			message.say(`It's tails! (1)`);
		}
	}
}

module.exports = FlipCommand;