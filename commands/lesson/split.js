const { MessageEmbed, GuildMember, VoiceChannel } = require(`discord.js`);
const { Command, CommandoMessage } = require("discord.js-commando");
const { lessonShouldEnd } = require("../../util/timeutils");
const SplitAudit = require('../../types/audit/splitaudit');

class SplitCommand extends Command {
	constructor(client) {
		super(client, {
			name: `split`,
			group: `lesson`,
			memberName: `split`,
			description: `Split people into random groups`,
			examples: [ `split 2`, `split 4` ],
			guildOnly: true,
			userPermissions: [ `MOVE_MEMBERS` ],
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
		 * @type {Array<Array<GuildMember>}
		 */
		const users = [];
		to.forEach(ch => users.push([]));

		for (let ii = 0; ii < size; ii++) {
			if (mem == initiator) continue;
			const mem = from.members.random();
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