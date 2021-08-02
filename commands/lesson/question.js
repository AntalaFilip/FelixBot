const { Command } = require("../../types/command");
const { CmdMessageResponse } = require("../../util/interactions");
const { getChanName } = require("../../util/stringutils");

class QuestionCommand extends Command {
	constructor(client) {
		super(client, {
			id: `864907973473206272`,
			name: `question`,
			group: `lesson`,
			memberName: `question`,
			aliases: [`q`],
			description: `Ask the teacher a question`,
			examples: [`q ako sa máš?`],
			guildOnly: true,
		});
	}

	async run(interaction) {
		const guild = this.client.guilds.resolve(interaction.guild_id);
		// Get the member
		const member = guild.members.resolve(interaction.member.user.id);
		// Get the member's voice channel
		const chan = member.voice.channel;
		// Return if the voice channel does not exist
		if (!chan) return CmdMessageResponse(`You have to be in a voice channel to use this command!`, true);
		// Get the chan initials
		const clsid = getChanName(chan);
		// Get the lessons array and search for a lesson with this student.
		const lesson = this.client.lessonManager.isInLesson(member);
		// If the lesson wasn't found, return
		if (!lesson) return CmdMessageResponse(`You are not attending a lesson!`, true);
		// Get the arguments from the interaction
		const args = interaction.data.options || [];
		// Get the message
		const msg = (args[0] && args[0].value) || null;
		// Get the lesson's teacher
		const teacher = lesson.teacher.member;
		// Create a var with the message, if the content is empty then set the text to 'wants to ask a question', else set the content to the question
		const content = msg == null ? `wants to ask a question!` : `asked: ${msg}`;
		// Send the question to the teacher
		(await teacher.createDM()).send(`${member.displayName} ${content}`);

		return CmdMessageResponse(`Question sent!`, true);
	}
}

module.exports = QuestionCommand;