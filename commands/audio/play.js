const { Message } = require("discord.js");
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
					oneOf: [ `link`, `local`, `youtube` ],
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
				{
					key: `seek`,
					type: `number`,
					default: 0,
				},
			],
		});
	}
	/**
	 *
	 * @param {Message} message
	 * @param {*} args
	 */
	async run(message, args) {
		// Get the voice connections, find if there is one in this guild, if it exists, return with a reply
		const vcon = this.client.voice.connections;
		const vconhere = vcon.find(con => con.channel.guild.id === message.guild.id);
		if (vconhere) return message.reply(`I am already playing in another channel! (${vconhere.channel.name})`);
		// If the member is in a voice channel
		if (message.member.voice.channel) {
			const chan = message.member.voice.channel;
			// Check if there is an ongoing lesson in this voice channel, if true, return with a reply
			const lesson = this.client.lessonManager.lessons.find(les => les.class === this.client.stringUtils.getChanName(chan).slice(0, 2));
			if (lesson && message.member != lesson.teacher.member) return message.reply(`Only the teacher can play audio during the lesson!`).then(res => {res.delete({ timeout: 5000 }); message.delete({ timeout: 5000 });});
			// If YouTube was specified
			if (args.type === `youtube`) {
				// Join the channel
				const connection = await chan.join();
				// Use ytdl to play the specified link
				const dispatcher = connection.play(ytdl(args.loc, { filter: "audioonly" }), { volume: args.vol / 10, seek: args.seek });
				// When playback ends, send a message and disconnect
				dispatcher.on(`finish`, () => {
					message.reply(`I have finished playing!`);
					dispatcher.destroy();
					connection.disconnect();
				});
			}
			// Else if link/local was specified
			else if (args.type === `local` || args.type === `link`) {
				// Join the channel
				const connection = await chan.join();
				// Play the specified link
				const dispatcher = connection.play(`${args.loc}`, { volume: args.vol / 10, seek: args.seek });
				// When playback ends, send a message and disconnect
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