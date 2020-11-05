const commando = require(`discord.js-commando`);

module.exports = class QuestionCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: `question`,
			group: `lesson`,
			memberName: `question`,
			aliases: [ `q` ],
			description: `Ask the teacher a question`,
			examples: [ `q ako sa máš?` ],
			guildOnly: true,
		});
	}

	run(message) {
		// Get the member
		const member = message.member;
		// Get the member's voice channel
		const chan = member.voice.channel;
		// Return if the voice channel does not exist
		if (!chan) return message.reply(`You have to be in a voice channel to use this command!`).then(res => {res.delete({ timeout: 10000 }); message.delete({ timeout: 10000 });});
		// Get the chan initials
		const clsid = chan.name.slice(0, 2);
		// Get the lessons map and search for a lesson in this channel
		const lessons = this.client.provider.get(message.guild, `lessons`);
		const lesson = lessons.find(les => les.class === clsid);
		// If the lesson was found
		if (lesson) {
			// Get the message and remove the command from it
			const msg = message.content.substr(message.content.indexOf(' ') + 1);
			// Get the lesson's teacher
			const teacher = lesson.teacher;
			// Create a var with the message
			let content;
			// If the content is empty then set the text to 'wants to ask a question', else set the content to the question
			if (msg.startsWith(`!`)) content = `wants to ask a question!`;
			else if (msg) content = `asked: ${msg}`;
			// Send the question to the teacher
			teacher.createDM().then(dm => dm.send(`${member.nickname || member.user.username} ${content}`));
			// Reply, then delete it
			message.reply(`Question sent!`).then(res => {res.delete({ timeout: 3000 }); message.delete();});
		}
		// Else return
		else {return message.reply(`There has to be an ongoing lesson in this channel!`).then(res => {res.delete({ timeout: 10000 }); message.delete({ timeout: 10000 });});}
	}
};