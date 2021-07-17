const { entersState } = require("@discordjs/voice");
const { Message } = require("discord.js");
const ytdl = require(`ytdl-core`);
const { Command } = require("../../types/command");
const { CmdMessageResponse } = require("../../util/interactions");
const str = require('../../util/stringutils');

class AudioCommand extends Command {
	constructor(client) {
		super(client, {
			name: `play`,
			aliases: [`p`],
			group: `audio`,
			memberName: `play`,
			description: `Plays custom audio`,
			guildOnly: true,
			examples: [ `play local /etc/felixai/FelixBot/audio.mp3`, `play link http://example.com/audio.mp3`, `play youtube https://youtube.com/watch?v=dQw4w9WgXcQ` ],
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
					prompt: `Specify time to start at`,
					type: `integer`,
					default: 0,
				},
			],
		});
	}

	async run(interaction) {
		const guild = this.client.guilds.resolve(interaction.guild_id);
		const member = guild.members.resolve(interaction.member.user.id);
		// Get the voice connections, find if there is one in this guild, if it exists, return with a reply
		const vcon = this.client.voice.adapters;
		const vconhere = vcon.find(con => con.channel.guild.id === guild.id);
		if (vconhere) return CmdMessageResponse(`I am already playing in another channel! (${vconhere.channel.name})`, true);
		// If the member is in a voice channel
		const chan = member.voice.channel;
		if (!chan) return CmdMessageResponse(`You need to join a voice channel first!`, true);

		// Check if there is an ongoing lesson in this voice channel, if true, return with a reply
		const lesson = this.client.lessonManager.lessons.find(les => les.class === str.getChanName(chan).slice(0, 2));
		if (lesson && member.id != lesson.teacher.member.id) {
			return message.reply(`Only the teacher can play audio during the lesson!`);
		}
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
};