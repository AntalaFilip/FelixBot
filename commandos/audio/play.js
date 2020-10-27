const commando = require(`discord.js-commando`);
const ytdl = require(`ytdl-core`);

module.exports = class AudioCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: `play`,
			aliases: [`p`],
			group: `audio`,
			memberName: `play`,
			description: `Play custom audio`,
			guildOnly: true,
			ownerOnly: true,
			examples: [ `date seconds`, `date minutes` ],
			args: [
				{
					key: `type`,
					prompt: `What audio type do you want to play?`,
					type: `string`,
					oneOf: [ `local`, `youtube` ],
				},
				{
					key: `loc`,
					prompt: `Specify audio location (link, or local path)`,
					type: `string`,
				},
				{
					key: `vol`,
					prompt: `Specify volume (0-2)`,
					type: `integer`,
					min: `0.1`,
					max: `2`,
					default: `1`,
				},
			],
		});
	}
	async run(message, args) {
		if (message.member.voice.channel) {
			if (args.type === `youtube`) {
				const connection = await message.member.voice.channel.join();
				const dispatcher = connection.play(ytdl(args.loc, { filter: "audioonly" }));
				dispatcher.on(`finish`, () => {
					message.reply(`I have finished playing!`);
					dispatcher.destroy();
				});
			}
			else if (args.type === `local`) {
				const connection = await message.member.voice.channel.join();
				const dispatcher = connection.play(`${args.loc}`);
				dispatcher.on(`finish`, () => {
					message.reply(`I have finished playing!`);
					dispatcher.destroy();
				});
			}
		}
		else {
			message.reply(`You need to join a voice channel first!`);
		}
	}
};