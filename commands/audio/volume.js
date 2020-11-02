const commando = require(`discord.js-commando`);

module.exports = class AudioCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: `volume`,
			group: `audio`,
			memberName: `volume`,
			description: `Controls volume`,
			aliases: [ `vol` ],
			guildOnly: true,
			examples: [ `stop` ],
			args: [
				{
					key: `vol`,
					prompt: `Volume (1-20)`,
					type: `integer`,
					min: 1,
					max: 20,
				},
			],
		});
	}
	async run(message, args) {
		if (message.member.voice.channel) {
			const memchan = message.member.voice.channel;
			const con = this.client.voice.connections.find(col => col.channel == memchan);
			if (con) {
				const dispatcher = con.dispatcher;
				if (dispatcher) {
					dispatcher.setVolume(args.vol / 10);
					message.reply(`Set volume to ${args.vol}!`).then(res => {
						message.delete({ timeout: 10000 });
						res.delete({ timeout: 10000 });
					});
				}
				else {
					message.reply(`I am not playing anything!`).then(res => {
						message.delete({ timeout: 10000 });
						res.delete({ timeout: 10000 });
					});
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