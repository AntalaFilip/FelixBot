const { MessageEmbed } = require("discord.js");
const { Command } = require("../../types/command");
const { CallbackType } = require("../../util/interactions");

module.exports = class OngoingLessonsCommand extends Command {
	constructor(client) {
		super(client, {
			id: `863748135820984330`,
			name: `ongoing`,
			group: `lesson`,
			memberName: `ongoing`,
			description: `Prints out all ongoing lessons`,
			examples: [ `ongoing` ],
			guildOnly: true,
		});
	}

	run(interaction) {
		const guild = this.client.guilds.resolve(interaction.guild_id);
		const member = guild.members.resolve(interaction.member.user.id);
		const lessons = this.client.lessonManager.lessons;
		const args = interaction.data.options || [];
		const embed = new MessageEmbed()
			.setTitle(`Ongoing lessons:`)
			.setAuthor(member.displayName, member.user.avatarURL())
			.setColor(`#ffffff`)
			.setDescription(`List of ongoing lessons:`);
		lessons.forEach(les => {
			embed.addField(`${les.lessonid}@${les.classid}`, `Teacher: ${les.teacher.name}\nStarted at: \`${les.startedAt.toLocaleTimeString('en-GB')}\``);
		});
		const silent = (args[0] && typeof args[0].value === 'boolean' ? args[0].value : true);
		const res = {
			"type": CallbackType.CHANNEL_MESSAGE,
			"data": {
				"flags": silent ? 64 : null,
				"embeds": [
					embed.toJSON(),
				],
			},
		};
		return res;
	}
};