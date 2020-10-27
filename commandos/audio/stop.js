const commando = require(`discord.js-commando`);

module.exports = class AudioCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: `stop`,
			aliases: [`p`],
			group: `audio`,
			memberName: `stop`,
			description: `Stops current audio`,
			guildOnly: true,
			examples: [ `stop` ],
		});
	}
	async run(message) {
		if (message.member.voice.channel) {
			const memchan = message.member.voice.channel;
			const con = this.client.voice.connections.find(col => col.channel == memchan);
			if (con) {
				const dispatcher = con.dispatcher;
				if (dispatcher) {
					dispatcher.destroy();
					const response = message.reply(`Playback stopped!`);
					message.delete({ timeout: 10000 });
					response.delete({ timeout: 10000 });
				}
				else {
					con.disconnect();
				}
			}
			else {
				const response = message.reply(`You have to be in the same channel as me!`);
				message.delete({ timeout: 10000 });
				response.delete({ timeout: 10000 });
			}
		}
		else {
			const response = message.reply(`You need to join a voice channel first!`);
			message.delete({ timeout: 10000 });
			response.delete({ timeout: 10000 });
		}
	}
};