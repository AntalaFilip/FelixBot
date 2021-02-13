const { GuildMember, VoiceChannel, TextChannel, MessageEmbed } = require("discord.js");
const { Command, CommandoClient, CommandoMessage } = require("discord.js-commando");
const Lesson = require("../../types/lesson/lesson");

const reactions = require('../../util/reactions');

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
		const lesson = this.client.lessonManager.isInLesson(message.member);
		let from = to.parent.children.filter(ch => ch.type == `voice`);
		if (lesson) from = lesson.allocated;
		setTimeout(() => {
			this.exec(member, to, lesson.allocated)
				.then(embed => {
					message.channel.send(embed)
						.then(msg => {
							if (lesson) reactions.addFunctionalReaction(`end`, msg, [lesson.teacher.member.user], lesson);
							reactions.addFunctionalReaction([`split`], msg, [lesson ? lesson.teacher.member.user : member]);
						});
				});
		}, args.time * 1000);
	}

	/**
	 *
	 * @param {GuildMember} initiator
	 * @param {VoiceChannel} targetchan
	 * @param {VoiceChannel[]} from
	 */
	async exec(initiator, targetchan, from) {
		const list = new Map();
		let i = 0;
		from.forEach(chan => {
			const users = [];
			for (const usr of chan.members) {
				try {
					usr[1].voice.setChannel(targetchan, `Merged; ${initiator.displayName}`);
					users.push(usr[1].displayName);
					i++;
				}
				catch (e) {
					global.clientlogger.error(e);
				}
			}
			list.set(chan.name, users);
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
			embed.addField(key, val, true);
		});
		return embed;
	}
}