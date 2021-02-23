const { Command, CommandoMessage } = require("discord.js-commando");
const { getChanName } = require("../../util/stringutils");

module.exports = class QuestionCommand extends Command {
	constructor(client) {
		super(client, {
			name: `question`,
			group: `lesson`,
			memberName: `question`,
			aliases: [`q`],
			description: `Ask the teacher a question`,
			examples: [`q ako sa máš?`],
			guildOnly: true,
		});
	}

	/**
	 * @param {CommandoMessage} message
	 */
	run(message) {
		// Get the member
		const member = message.member;
		// Get the member's voice channel
		const chan = member.voice.channel;
		// Return if the voice channel does not exist
		if (!chan) return message.reply(`You have to be in a voice channel to use this command!`).then(res => { res.delete({ timeout: 10000 }); message.delete({ timeout: 10000 }); });
		// Get the chan initials
		const clsid = getChanName(chan);
		// Get the lessons array and search for a lesson with this student.
		const lesson = this.client.lessonManager.lessons.find(ls => ls.students.find(st => st.member.id === member.id));
		// If the lesson wasn't found, return
		if (!lesson) return message.reply(`You are not attending a lesson!`).then(res => { res.delete({ timeout: 10000 }); message.delete({ timeout: 10000 }); });
		// Get the message and remove the command from it
		const msg = message.content.substr(message.content.indexOf(' ') + 1);
		// Get the lesson's teacher
		const teacher = lesson.teacher.member;
		// Create a var with the message, if the content is empty then set the text to 'wants to ask a question', else set the content to the question
		const content = msg.startsWith(`!`) ? `wants to ask a question!` : `asked: ${msg}`;
		// Send the question to the teacher
		teacher.createDM().then(dm => dm.send(`${member.displayName} ${content}`));
		// Reply, then delete it
		message.reply(`Question sent!`)
			.then(res => {
				res.delete({ timeout: 3000 });
				message.delete();
			});
	}
};