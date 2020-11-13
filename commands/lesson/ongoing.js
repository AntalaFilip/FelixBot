const { MessageEmbed } = require("discord.js");
const commando = require(`discord.js-commando`);

module.exports = class OngoingLessonsCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: `ongoing`,
			group: `lesson`,
			memberName: `ongoing`,
			description: `Prints out all ongoing lessons`,
			examples: [ `ongoing` ],
			guildOnly: true,
		});
	}

	run(message) {
		const lessons = this.client.lessons;
		const embed = new MessageEmbed()
			.setTitle(`Ongoing lessons:`)
			.setAuthor(message.member.displayName, message.author.avatarURL())
			.setColor(`#ffffff`)
			.setDescription(`List of ongoing lessons:`);
		lessons.each((les, key) => {
			embed.addField(key, [`Teacher: ${les.teacherName}`, `Started at: ${les.startedAt.time}`]);
		});
		message.embed(embed);
	}
};