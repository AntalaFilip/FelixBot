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
		const num = Math.round(Math.random());
		if (num == 0) {
			message.say(`It's heads! (0)`);
		}
		else if (num == 1) {
			message.say(`It's tails! (1)`);
		}
	}
};