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
			ownerOnly: true,
		});
	}

	run(message) {
		const member = message.member;
		const chan = member.voice.channel;
		if (!chan) return message.reply(`You have to be in a voice channel to use this command!`).then(res => {res.delete({ timeout: 10000 }); message.delete({ timeout: 10000 });});
		const clsid = chan.name.slice(0, 2);
		const lessons = this.client.lessons;
		const lesson = lessons.find(les => les.class === clsid);
		if (lesson) {
			const msg = message.content.substr(message.content.indexOf(' ') + 1);
			const teacher = lesson.teacher;
			let content;
			if (msg.startsWith(`!`)) content = `wants to ask a question!`;
			else if (msg) content = `asked: ${msg}`;
			teacher.createDM().then(dm => dm.send(`${member.nickname || member.user.username} ${content}`));
			message.reply(`Question sent!`).then(res => {res.delete({ timeout: 3000 }); message.delete();});
		}
		else {return message.reply(`There has to be an ongoing lesson in this channel!`).then(res => {res.delete({ timeout: 10000 }); message.delete({ timeout: 10000 });});}
	}
};