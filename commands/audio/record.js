const { Command, CommandoMessage } = require("discord.js-commando");
const { clearMessageAfter } = require("../../util/messages");
const { getChanName } = require("../../util/stringutils");

module.exports = class RecordAudioCommand extends Command {
	constructor(client) {
		super(client, {
			name: `record`,
			group: `audio`,
			memberName: `record`,
			description: `Manages recording voice`,
			guildOnly: true,
			examples: [`record start`, `record status`, `record stop`],
			args: [
				{
					key: `command`,
					prompt: `Enter action (start/status/stop)`,
					type: `string`,
					oneOf: [`start`, `status`, `stop`],
				},
			],
		});
	}
	/**
	 *
	 * @param {CommandoMessage} message
	 * @param {{ command: 'start' | 'status' | 'stop' }} args
	 */
	async run(message, args) {
		const chan = message.member.voice.channel;
		const member = message.member;

		if (!chan) clearMessageAfter([message.reply(`You need to join a voice channel first!`), message], 10000);

		// Check if a lesson is ongoing, in that case, return if the member is not the teacher.
		const lesson = this.client.lessonManager.lessons.find(les => les.class === getChanName(chan));
		if (lesson && member != lesson.teacher.member) return clearMessageAfter([message.reply(`Only the teacher can use audio commands during a lesson!`), message]);

		// If there already is a voice connection in this guild, return.
		const con = this.client.voice.connections.find(conns => conns.channel.guild.id === message.guild.id);
		if (con) return clearMessageAfter([message.reply("I am already in another channel!"), message]);


	}
};