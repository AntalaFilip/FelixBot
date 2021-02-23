const { GuildMember, VoiceChannel, TextChannel, MessageEmbed } = require("discord.js");
const { Command, CommandoClient, CommandoMessage } = require("discord.js-commando");
const MergeAudit = require("../../types/audit/mergeaudit");

const reactions = require('../../util/reactions');
const { getChanName } = require("../../util/stringutils");

class MergeCommand extends Command {
	/**
	 *
	 * @param {CommandoClient} client
	 */
	constructor(client) {
		super(client, {
			name: `merge`,
			group: `lesson`,
			memberName: `merge`,
			description: `Merges people from all subchannels back into the main one`,
			examples: [`merge 20`],
			guildOnly: true,
			userPermissions: [`MOVE_MEMBERS`],
			args: [
				{
					key: `time`,
					prompt: `Enter merge delay (0 for instant merge):`,
					label: `delay`,
					type: `integer`,
					default: 5,
				},
			],
		});
	}

	/**
	 *
	 * @param {CommandoMessage} message
	 * @param {{time: number}} args
	 */
	async run(message, args) {
		const member = message.member;
		const to = message.member.voice.channel;
		if (!to) return message.reply(`You have to be in a voice channel`);
		let lesson = this.client.lessonManager.isTeachingLesson(message.member);
		if (!lesson) lesson = this.client.lessonManager.isInLesson(message.member);
		let from = to.parent.children.filter(ch => ch.type == `voice` && ch.id != to.id);
		if (lesson) from = lesson.allocated;
		if (from.size == 0) return message.reply(`I didn't find any channels to merge from!`);
		const embedmsg = await message.channel.send(`Merging...`);
		setTimeout(() => {
			this.exec(member, to, from)
				.then(embed => {
					embedmsg.edit(embed[1])
						.then(msg => {
							if (lesson) reactions.addFunctionalReaction(`end`, msg, [lesson.teacher.member.user], lesson);
							reactions.addFunctionalReaction([`split`], msg, [lesson ? lesson.teacher.member.user : member], lesson ? lesson : undefined);
						});
				});
		}, args.time * 1000);
	}

	/**
	 *
	 * @param {GuildMember} initiator
	 * @param {VoiceChannel} to
	 * @param {VoiceChannel[]} from
	 */
	async exec(initiator, to, from) {
		const list = new Map();
		let i = 0;
		from.forEach(chan => {
			const users = [];
			for (const usr of chan.members) {
				try {
					if (!usr[1].voice.channel) continue;
					usr[1].voice.setChannel(to, `Merged; ${initiator.displayName}`);
					users.push(usr[1].displayName);
					i++;
				}
				catch (e) {
					global.clientlogger.error(e);
				}
			}
			if (users.length != 0) list.set(chan.id, users);
		});
		const embed = new MessageEmbed()
			.setColor(`#0099ff`)
			.setTitle(`Merge`)
			.setDescription(`Merged ${i} users from ${list.size} groups`)
			.setAuthor(initiator.displayName, initiator.user.avatarURL())
			.setThumbnail(`https://cdn.discordapp.com/attachments/371283762853445643/768906541277380628/Felix-logo-01.png`)
			.setFooter(``)
			.setTimestamp();
		list.forEach((val, key) => {
			embed.addField(to.guild.channels.resolve(key).name, val, true);
		});
		this.client.auditManager.newAudit(new MergeAudit(initiator, to, from, list));
		return [list, embed];
	}
}

module.exports = MergeCommand;