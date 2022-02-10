const { MessageEmbed, GuildMember, VoiceChannel, Collection } = require(`discord.js`);
const SplitAudit = require('../../types/audit/splitaudit');
const { Command } = require("../../types/command");
const { CmdMessageResponse, CallbackType, MessageComponent, ButtonStyle } = require("../../util/interactions");
const shuffle = require("../../util/shuffle");

class SplitCommand extends Command {
	constructor(client) {
		super(client, {
			id: `826025881280446476`,
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

		this.components = {
			runRes: (member, audit) => (
				MessageComponent.actionRow(
					MessageComponent.button(
						ButtonStyle.Primary, { label: 'Merge back', emoji: { name: '↩' } }, `merge_run/${member.id}/${audit.id}`,
					),
					MessageComponent.button(
						ButtonStyle.Link, { label: 'Learn more about splitting', emoji: { name: '📖' } }, null, `${process.env.URL}/go/learn-split`,
					),
				)
			),
		};
	}

	async run(interaction) {
		// Resolve the interaction guild
		const guild = this.client.guilds.resolve(interaction.guild_id);
		if (!guild) return CmdMessageResponse(`This command may only be used in guilds!`, true);

		// Resolve the member that sent the interaction, and try to get a lesson he's teaching
		const member = guild.members.resolve(interaction.member.user.id);
		const lesson = this.client.lessonManager.lessons.find(ls => ls.teacher.member.id == member.id);

		// Get the interaction channel
		const intrchan = guild.channels.resolve(interaction.channel_id);
		// Get the member's current voice channel
		const chan = member.voice.channel;
		if (!chan) return CmdMessageResponse(`You have to be in a voice channel!`);

		const args = interaction.data.options || [];
		/** @type {?number} */
		const groupcount = args[0];

		// Get the channel's category and get the channels to split to
		const ctg = chan.parent;
		let chans = ctg.children.filter(ch => ch.type === 'voice' && !ch.name.includes('*') && ch.id != chan.id).toJSON();
		if (lesson) chans = lesson.allocated.filter(ch => ch.id != chan.id);

		// Sort the channels by their position, and if the user provided a groupcount, reduce them to that count.
		// This way we split into the topmost channel first, and continue downwards
		chans.sort((a, b) => a.position - b.position);
		if (groupcount) chans.splice(groupcount);

		// Check if the category where the command was executed is the same as the user's voice channel, if not, abort the command
		if (!ctg.children.has(intrchan.id)) return CmdMessageResponse(`Command aborted! For safety reasons you may only run commands in the same category as the one you are trying to execute them in. \nFor reference, you were trying to run a command in the category '${ctg.name}', but sent the command in category '${intrchan.parent.name}'`, true);

		// Execute the action
		const val = await this.exec(member, chan, chans);
		const [collection, embed, audit] = val;
		const res = {
			"type": CallbackType.CHANNEL_MESSAGE,
			"data": {
				"embeds": [
					embed.toJSON(),
				],
				"components": [
					this.components.runRes(member, audit),
				],
			},
		};

		return res;
	}

	/**
	 * Executes the SplitCommand
	 * @param {GuildMember} initiator The member that initiated the command
	 * @param {VoiceChannel} from The VoiceChannel from which to split the members
	 * @param {VoiceChannel[]} to The VoiceChannels to which to split the members
	 * @param {GuildMember[]} userlist
	 */
	async exec(initiator, from, to, userlist) {
		// Sort the destination channels by their position, so we split members from top to bottom channel
		to.sort((a, b) => a.position - b.position);

		/** @type {GuildMember[][]} */
		// Initialize an empty array and fill it with an empty array for each of the destination channels
		const users = new Array(to.length);
		users.fill([], 0, to.length);

		// Either use the given userlist or create an *uncached* array from the members to split and shuffle it using the util Fisher-Yates Shuffle
		const randomized = userlist || shuffle([...from.members.values()]);

		// Initialize an index variable.
		let i = 0;
		for (const member of randomized) {
			// If the member is the one who ran the command, skip them.
			if (member == initiator) continue;
			// Set the member's channel to the channel with the given index
			await member.voice.setChannel(to[i], `Split; ${initiator.displayName}`);
			// Add them to the user array, to the channel's index
			users[i].push(member);
			// Up the index by one
			i++;
			// If the index is higher than the length of the destination channels, set it back to zero.
			if (i > to.length) i = 0;
		}

		// Create a new collection of channel IDs and users split to that channel
		const collection = new Collection();
		to.forEach((ch, index) => users[index].length && collection.set(ch.id, users[index]));

		const embed = new MessageEmbed()
			.setColor(`#0099ff`)
			.setTitle(`Split`)
			.setDescription(`Split ${i} users from ${collection.size} groups.`)
			.setAuthor(initiator.displayName, initiator.user.avatarURL())
			.setThumbnail(`https://cdn.discordapp.com/attachments/371283762853445643/768906541277380628/Felix-logo-01.png`)
			.setFooter(`Moving users is limited to 10 users per 10 seconds, thus in larger groups you may experience longer split times.`)
			.setTimestamp();

		// Populate the embed with fields of
		const fields = collection.map((val, key) => {
			const name = to.find(c => c.id === key).name;
			const value = val.map(m => m.displayName).join('\n');
			return {
				name,
				value,
				inline: true,
			};
		});
		embed.addFields(fields);
		const audit = await this.client.auditManager.newAudit(new SplitAudit(initiator, from, to, collection));

		return [collection, embed, audit];
	}
}

module.exports = SplitCommand;