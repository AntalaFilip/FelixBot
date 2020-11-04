const commando = require(`discord.js-commando`);
const ytdl = require(`ytdl-core`);

module.exports = class AudioCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: `play`,
			aliases: [`p`],
			group: `audio`,
			memberName: `play`,
			description: `Plays custom audio`,
			guildOnly: true,
			examples: [ `play local /etc/felixai/FelixBot/audio.mp3`, `play link http://example.com/audio.mp3`, `play youtube http://youtube.com/watch?v=...` ],
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
					prompt: `Specify volume (1-20)`,
					type: `integer`,
					min: 1,
					max: 20,
					default: 4,
				},
			],
		});
	}
	async run(message, args) {
		if (message.member.voice.channel) {
			const lesson = this.client.lessons.find(les => les.class === message.member.voice.channel.name.slice(0, 2));
			if (lesson && message.member != lesson.teacher) return message.reply(`Only the teacher can play audio during the lesson!`).then(res => {res.delete({ timeout: 5000 }); message.delete({ timeout: 5000 });});

			if (args.type === `youtube`) {
				const connection = await message.member.voice.channel.join();
				const dispatcher = connection.play(ytdl(args.loc, { filter: "audioonly" }), { volume: args.vol / 10 });
				dispatcher.on(`finish`, () => {
					message.reply(`I have finished playing!`);
					dispatcher.destroy();
					connection.disconnect();
				});
			}
			else if (args.type === `link`) {
				const connection = await message.member.voice.channel.join();
				const dispatcher = connection.play(`${args.loc}`, { volume: args.vol / 10 });
				dispatcher.on(`finish`, () => {
					message.reply(`I have finished playing!`);
					dispatcher.destroy();
					connection.disconnect();
				});
			}
		}
		else {
			message.reply(`You need to join a voice channel first!`);
		}
	}
};