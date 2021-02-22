const { Command, CommandoMessage } = require("discord.js-commando");

class RandomMemberCommand extends Command {
	constructor(client) {
		super(client, {
			name: `member`,
			group: `random`,
			memberName: `member`,
			description: `Gets a random member`,
			examples: [`member`],
			guildOnly: true,
			args: [
				{
					key: `scope`,
					prompt: `From which scope do you want to get a member?`,
					label: `scope`,
					type: `string`,
					oneOf: [`lesson`, `voice`, `class`, `server`],
				},
			],
		});
	}

	/**
	 *
	 * @param {CommandoMessage} message
	 * @param {{scope: 'lesson' | 'voice' | 'class' | 'server'}} args
	 */
	run(message, args) {
		const lesson = this.client.lessonManager.lessons.find(ls => ls.teacher.member == message.member || ls.students.find(st => st.member == message.member));
		let member;
		switch(args.scope) {
		case `lesson`:
			if (!lesson) return message.reply(`You are not attending a lesson!`);
			member = lesson.students[Math.floor(Math.random() * lesson.students.length)].member;
			break;
		case `voice`:
			if (!message.member.voice) return message.reply(`You have to be in a voice channel!`);
			member = message.member.voice.channel.members.random();
			break;
		case `class`:
			try {
				member = message.guild.roles.cache.find(role => role.name.toLowerCase().startsWith(message.channel.name.slice(0, 2))).members.random();
			}
			catch (e) {
				return message.channel.send(`I couldn't find a role/class in this channel`);
			}
			break;
		case `server`:
			member = message.guild.members.cache.random();
			break;
		}

		if (member) {
			message.channel.send(`The randomly chosen member is:`);
			message.channel.send(`${member.displayName}!`);
		}
		else {
			message.channel.send(`I couldn't find anyone!`);
		}
	}
}

module.exports = RandomMemberCommand;