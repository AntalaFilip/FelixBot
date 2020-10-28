const commando = require(`discord.js-commando`);

module.exports = class AudioCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: `pause`,
			group: `audio`,
			memberName: `pause`,
			description: `(Un)pauses current playback`,
			guildOnly: true,
			examples: [ `pause` ],
		});
	}
	async run(message) {
		if (message.member.voice.channel) {
			const memchan = message.member.voice.channel;
			const con = this.client.voice.connections.find(col => col.channel == memchan);
			if (con) {
				const dispatcher = con.dispatcher;
				if (dispatcher) {
					if (dispatcher.paused) {
						dispatcher.resume();
						message.reply(`Playback resumed!`);
					}
					else {
						dispatcher.pause();
						message.reply(`Playback paused!`);
					}
				}
				else {
					message.reply(`I am not playing anything!`);
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