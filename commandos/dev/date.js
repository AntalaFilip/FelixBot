const commando = require(`discord.js-commando`);

module.exports = class DateCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: `date`,
			group: `dev`,
			memberName: `date`,
			description: `Dev date utils`,
			examples: [ `date seconds`, `date minutes` ],
			args: [
				{
					key: `time`,
					prompt: `Specify:`,
					type: `string`,
					oneOf: [`milisec`, `sec`, `min`, `hour`, `day`, `month`, `year`, `time`, `date`],
				},
			],
		});
	}

	run(message, args) {
		switch (args.time) {
		case `milisec`:
			message.say(new Date().getMilliseconds());
			break;
		case `sec`:
			message.say(new Date().getSeconds());
			break;
		case `min`:
			message.say(new Date().getMinutes());
			break;
		case `hour`:
			message.say(new Date().getHours());
			break;
		case `day`:
			message.say(new Date().getDay());
			break;
		case `month`:
			message.say(new Date().getMonth());
			break;
		case `year`:
			message.say(new Date().getFullYear());
			break;
		case `time`:
			message.say(new Date().getTime());
			break;
		case `date`:
			message.say(new Date().getDate());
			break;
		default:
			message.say(`oops, error!`);
			break;
		}
	}
};