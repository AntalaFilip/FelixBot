const commando = require(`discord.js-commando`);

module.exports = class FlipCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: `flip`,
			group: `fun`,
			memberName: `flip`,
			description: `Flips a coin`,
			examples: [ `flip` ],
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
};