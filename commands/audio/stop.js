const commando = require(`discord.js-commando`);

module.exports = class AudioCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: `stop`,
			group: `audio`,
			memberName: `stop`,
			description: `Stops current playback`,
			guildOnly: true,
			examples: [ `stop` ],
		});
	}
	async run(message) {
		if (message.member.voice.channel) {
			const lesson = this.client.provider.get(message.guild, `lessons`).find(les => les.class === message.member.voice.channel.name.slice(0, 2));
			if (lesson && message.member != lesson.teacher) return message.reply(`Only the teacher can play audio during the lesson!`).then(res => {res.delete({ timeout: 5000 }); message.delete({ timeout: 5000 });});

			const memchan = message.member.voice.channel;
			const con = this.client.voice.connections.find(col => col.channel == memchan);
			if (con) {
				const dispatcher = con.dispatcher;
				if (dispatcher) {
					dispatcher.destroy();
					con.disconnect();
					message.reply(`Playback stopped!`).then(res => {
						message.delete({ timeout: 10000 });
						res.delete({ timeout: 10000 });
					});
				}
				else {
					con.disconnect();
					message.delete();
				}
			}
			else {
				message.reply(`You have to be in the same channel as me!`).then(res => {
					message.delete({ timeout: 10000 });
					res.delete({ timeout: 10000 });
				});
			}
		}
		else {
			message.reply(`You need to join a voice channel first!`).then(res => {
				message.delete({ timeout: 10000 });
				res.delete({ timeout: 10000 });
			});
		}
	}
};