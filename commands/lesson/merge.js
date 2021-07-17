const { GuildMember, VoiceChannel, TextChannel, MessageEmbed, Collection } = require("discord.js");
const MergeAudit = require("../../types/audit/mergeaudit");
const SplitAudit = require("../../types/audit/splitaudit");
const { Command } = require("../../types/command");
const { CmdMessageResponse, CallbackType, MessageComponent, ButtonStyle } = require("../../util/interactions");

class MergeCommand extends Command {
	constructor(client) {
		super(client, {
			id: `826025201376559124`,
			name: `merge`,
			group: `lesson`,
			memberName: `merge`,
			description: `Merges people from all subchannels back into the main one`,
			examples: [`merge 20`],
			guildOnly: true,
			userPermissions: [`MOVE_MEMBERS`],
			components: [`merge_cancel`, `merge_resplit`, `merge_run`],
		});

		this.components = {
			runFinal: (member, audit) => (
				MessageComponent.actionRow(
					MessageComponent.button(
						ButtonStyle.Secondary, { label: 'Resplit', emoji: { name: '🔀' } }, `merge_resplit/${member.id}/${audit.id}`,
					),
					MessageComponent.button(
						ButtonStyle.Link, { label: 'Learn more about merging', emoji: { name: '📖' } }, null, 'https://felixbot.antala.tk/go/learn-merge',
					),
				)
			),
			runWait: (member, tid) => (
				MessageComponent.actionRow(
					MessageComponent.button(
						ButtonStyle.Destructive, { label: 'CANCEL', emoji: { name: '❌' } }, `merge_cancel/${member.id}/${tid}`,
					),
				)
			),
			runError: (ts) => (
				MessageComponent.actionRow(
					MessageComponent.button(
						ButtonStyle.Link, { label: 'Report an error', emoji: { name: '💥' } }, null, `https://felixbot.antala.tk/go/report-error?data=timestamp:${ts}`,
					),
				)
			),
		};
	}

	/**
	 *
	 * @param {CommandoMessage} message
	 * @param {{time: number}} args
	 */
	async run(interaction) {
		const guild = this.client.guilds.resolve(interaction.guild_id);
		const member = guild.members.resolve(interaction.member.user.id);

		const args = interaction.data.options || [];
		const time = (args[0] && Number(args[0].value)) || 10;
		if (time > 600) return CmdMessageResponse(`The maximum timeout is 10 minutes (600s)!`, true);

		const to = member.voice.channel;
		if (!to) return CmdMessageResponse(`You have to be in a voice channel`, true);

		let lesson = this.client.lessonManager.isTeachingLesson(member);
		if (!lesson) lesson = this.client.lessonManager.isInLesson(member);

		let from = to.parent.children.filter(ch => ch.type == `GUILD_VOICE` && ch.id != to.id);
		if (lesson) from = lesson.allocated;

		if (from.size == 0) return CmdMessageResponse(`I didn't find any channels to merge from!`, true);

		const timeout = setTimeout(async () => {
			try {
				const data = await this.exec(member, to, from.array());
				const edit = {
					"content": null,
					"embeds": [
						data[1].toJSON(),
					],
					"components": [
						this.components.runFinal(member, data[2]),
					],
				};
				await this.client.interactionManager.editOriginal(interaction.token, edit);
			}
			catch (err) {
				this.client.logger.error(err);
				const ts = Date.now();
				const edit = {
					"content": `An error occurred while running this command at \`${ts}\``,
					"components": [
						this.components.runError(ts),
					],
				};
				await this.client.interactionManager.editOriginal(interaction.token, edit);
			}
		}, time * 1000);
		const tid = timeout[Symbol.toPrimitive]();
		const res = {
			"type": CallbackType.CHANNEL_MESSAGE,
			"data": {
				"content": `Merging ${from.size} channels into ${to.name} in ${time} seconds`,
				"components": [
					this.components.runWait(member, tid),
				],
			},
		};
		return res;
	}

	/**
	 *
	 * @param {GuildMember} initiator
	 * @param {VoiceChannel} to
	 * @param {VoiceChannel[]} from
	 */
	async exec(initiator, to, from) {
		const list = new Collection();
		let i = 0;
		for (const chan of from) {
			const users = [];
			for (const usr of chan.members) {
				try {
					if (!usr[1].voice.channel) continue;
					await usr[1].voice.setChannel(to, `Merged; ${initiator.displayName}`);
					users.push(usr[1].displayName);
					i++;
				}
				catch (e) {
					this.client.logger.error(e);
				}
			}
			if (users.length != 0) list.set(chan.id, users);
		}
		const embed = new MessageEmbed()
			.setColor(`#0099ff`)
			.setTitle(`Merge`)
			.setDescription(`Merged ${i} users from ${list.size} groups`)
			.setAuthor(initiator.displayName, initiator.user.avatarURL())
			.setThumbnail(`https://cdn.discordapp.com/attachments/371283762853445643/768906541277380628/Felix-logo-01.png`)
			.setFooter(`Moving users is limited to 10 users per 10 seconds, thus in larger groups you will experience longer merge times.`)
			.setTimestamp();
		list.forEach((val, key) => {
			embed.addField(to.guild.channels.resolve(key).name, val, true);
		});
		const audit = await this.client.auditManager.newAudit(new MergeAudit(initiator, to, from, list));
		return [list, embed, audit];
	}

	async component(rawid, interaction) {
		const split = rawid.split('/');
		const id = split[0];
		const args = split.slice(1);

		if (id === `merge_cancel`) {
			const member_id = args[0];
			const timeout = args[1];

			if (member_id != interaction.member.user.id) {
				return CmdMessageResponse(`Only the initiating member can cancel the merge!`, true);
			}

			clearTimeout(timeout);

			const res = {
				"type": CallbackType.UPDATE_MESSAGE,
				"data": {
					"content": `This merge was cancelled`,
					"components": [],
				},
			};
			return res;
		}
		else if (id === `merge_resplit`) {
			const SplitCommand = require("./split");
			const member_id = args[0];
			const audit_id = Number(args[1]);

			if (member_id != interaction.member.user.id) {
				return CmdMessageResponse(`Only the initiating member can resplit`, true);
			}

			const guild = this.client.guilds.resolve(interaction.guild_id);
			const member = guild.members.resolve(interaction.member.user.id);
			/** @type {MergeAudit} */
			const audit = this.client.auditManager.audits.find(a => a.id == audit_id);
			if (!audit) {
				this.client.logger.error(new Error(`Cannot find audit ${audit_id} @ ${id}`), interaction);
				return CmdMessageResponse(`Something went wrong, sorry!`, true);
			}

			const arr = [...audit.data.list.values()];
			let array = [];
			arr.forEach(a => array = array.concat(a));
			const Split = new SplitCommand(this.client);
			const [_, embed, audt] = await Split.exec(member, audit.data.to, audit.data.from, array);

			const res = {
				"type": CallbackType.CHANNEL_MESSAGE,
				"data": {
					"content": "Resplit successfully",
					"embeds": [
						embed.toJSON(),
					],
					"components": [
						Split.components.runRes(member, audt),
					],
				},
			};
			return res;
		}
		else if (id === `merge_run`) {
			const member_id = args[0];
			const audit_id = Number(args[1]);

			if (member_id != interaction.member.user.id) {
				return CmdMessageResponse(`Only the initiating member can remerge`, true);
			}

			const guild = this.client.guilds.resolve(interaction.guild_id);
			const member = guild.members.resolve(interaction.member.user.id);
			/** @type {SplitAudit} */
			const audit = this.client.auditManager.audits.find(a => a.id == audit_id);
			if (!audit) {
				this.client.logger.error(new Error(`Cannot find audit ${audit_id} @ ${id}`), interaction);
				return CmdMessageResponse(`Something went wrong, sorry!`, true);
			}

			const [_, embed, audt] = await this.exec(member, audit.data.from, audit.data.to);
			const res = {
				"type": CallbackType.CHANNEL_MESSAGE,
				"data": {
					"embeds": [
						embed.toJSON(),
					],
					"components": [
						this.components.runFinal(member, audt),
					],
				},
			};
			return res;
		}
	}
}

module.exports = MergeCommand;