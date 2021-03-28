const { MessageEmbed, GuildMember, VoiceChannel, CategoryChannel } = require(`discord.js`);
const { Command, CommandoMessage } = require("discord.js-commando");
const { lessonShouldEnd } = require("../../util/timeutils");
const SplitAudit = require('../../types/audit/splitaudit');
const reactionUtils = require("../../util/reactions");

class SplitCommand extends Command {
	constructor(client) {
		super(client, {
			name: `split`,
			group: `lesson`,
			memberName: `split`,
			description: `Split people into random groups`,
			examples: [`split 2`, `split 4`],
			guildOnly: true,
			userPermissions: [`MOVE_MEMBERS`],
			args: [
				{
					key: `gsize`,
					prompt: `Enter group size:`,
					label: `groupsize`,
					type: `integer`,
					min: 2,
				},
			],
		});
	}

	/**
	 *
	 * @param {CommandoMessage} message
	 * @param {*} args
	 */
	async run(message, args) {
		const mem = message.member;
		const lesson = this.client.lessonManager.lessons.find(ls => ls.teacher.member.id == mem.id);
		if (!mem.voice.channel) return message.reply(`You have to be in a voice channel!`);
		const chan = mem.voice.channel;
		const ctg = chan.parent;
		let chans = ctg.children.filter(ch => ch.type === 'voice' && !ch.name.includes('*') && ch.id != chan.id);
		if (lesson) chans = lesson.allocated.filter(ch => ch.id != chan.id);
		if (!ctg.children.has(message.channel.id)) return message.reply(`Command aborted! For safety reasons you may only run commands in the same category as the one you are trying to execute them in. For reference, you were trying to run a command in the category '${ctg.name}', but sent the command in category '${message.channel.parent.name}'`);
		this.exec(mem, chan, chans)
			.then((val) => {
				const [map, embed] = val;
				message.channel.send(embed)
					.then(msg => {
						reactionUtils.addFunctionalReaction(`merge`, msg, [lesson ? lesson.teacher.member.user : mem], lesson);
						if (lesson) reactionUtils.addFunctionalReaction(`end`, msg, [lesson ? lesson.teacher.member.user : mem], lesson);
					});
			});
	}

	/**
	 * Executes the SplitCommand
	 * @param {GuildMember} initiator The member that initiated the command
	 * @param {VoiceChannel} from The VoiceChannel from which to split the members
	 * @param {VoiceChannel[]} to The VoiceChannels to which to split the members
	 */
	async exec(initiator, from, to) {
		to = to.sort((a, b) => a.position - b.position);
		let i = 0;
		const size = from.members.size;
		/**
		 * @type {Array<Array<GuildMember>>}
		 */
		const users = [];
		to.forEach(ch => users.push([]));

		for (let ii = 0; ii < size; ii++) {
			const mem = from.members.random();
			if (mem == initiator) continue;
			mem.voice.setChannel(to[i], `Split; ${initiator.displayName}`);
			users[i].push(mem);
			i++;
			if (i > to.length) i = 0;
		}

		const map = new Map();
		to.forEach((ch, index) => map.set(ch.id, users[index]));

		const embed = new MessageEmbed()
			.setColor(`#0099ff`)
			.setTitle(`Split`)
			.setDescription(`Split ${i} users from ${map.size} groups`)
			.setAuthor(initiator.displayName, initiator.user.avatarURL())
			.setThumbnail(`https://cdn.discordapp.com/attachments/371283762853445643/768906541277380628/Felix-logo-01.png`)
			.setFooter(`Use !merge or press the leftwards arrow to move everyone back!`)
			.setTimestamp();
		this.client.auditManager.newAudit(new SplitAudit(initiator, from, to, map));
		return [map, embed];
	}
}

module.exports = SplitCommand;