const { GuildMember, VoiceChannel, TextChannel, MessageEmbed, Collection, CommandInteraction, MessageComponentInteraction, MessageActionRow, MessageButton } = require("discord.js");
const MergeAudit = require("../../types/audit/mergeaudit");
const SplitAudit = require("../../types/audit/splitaudit");
const { Command } = require("../../types/command");

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
				new MessageActionRow()
					.addComponents(
						new MessageButton({
							style: 'SECONDARY',
							label: 'Resplit',
							emoji: '🔀',
							customId: `merge_resplit/${member.id}/${audit.id}`,
							disabled: true,
						}),
						new MessageButton({
							style: 'LINK',
							label: 'Learn more about merging',
							emoji: '📖',
							url: `${process.env.URL}/go/learn-merge`,
						}),
					)
			),
			runWait: (member, tid) => (
				new MessageActionRow()
					.addComponents(
						new MessageButton({
							style: 'DANGER',
							label: 'CANCEL',
							emoji: '❌',
							customId: `merge_cancel/${member.id}/${tid}`,
						}),
					)
			),
			runError: (ts) => (
				new MessageActionRow(
					new MessageButton({
						style: 'LINK',
						label: 'Report an error',
						emoji: '💥',
						url: `${process.env.URL}/go/report-error?data=timestamp:${ts}`,
					}),
				)
			),
		};
	}

	/**
	 * @param {CommandInteraction} interaction
	 */
	async run(interaction) {
		const guild = interaction.guild;
		/** @type {GuildMember} */
		const member = interaction.member;
		const LMGR = this.client.lessonManager;

		const args = interaction.options;
		const targ = args.getInteger('timeout');
		const time = targ ?? 10;
		if (time > 600) return await interaction.reply({ ephemeral: true, content: `The maximum timeout is 10 minutes (600s)!` });

		const to = member.voice.channel;
		if (!to) return await interaction.reply({ ephemeral: true, content: `You have to be in a voice channel` });

		const lesson = LMGR.isTeachingLesson(member) || LMGR.isInLesson(member);

		let from = to.parent.children.filter(ch => ch.type == `GUILD_VOICE` && ch.id != to.id);
		if (lesson) from = lesson.allocated;

		if (from.size === 0) return interaction.reply({ ephemeral: true, content: `I didn't find any channels to merge from!` });

		const timeout = setTimeout(async () => {
			try {
				const data = await this.exec(member, to, from.array());
				await interaction.editReply({
					content: null,
					embeds: [
						data[1],
					],
					components: [
						this.components.runFinal(member, data[2]),
					],
				});
			}
			catch (err) {
				this.client.interactionManager.logger.error(err);
				const ts = Date.now();
				await interaction.editReply({
					content: `An error occurred while running this command.`,
					embeds: [],
					components: [
						this.components.runError(ts),
					],
				});
			}
		}, time * 1e3);
		const tid = timeout[Symbol.toPrimitive]();
		return await interaction.reply({
			content: `Merging ${from.size} channels into ${to.name} in ${time} seconds`,
			components: [
				this.components.runWait(member, tid),
			],
		});
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

	/**
	 * @param {MessageComponentInteraction} interaction
	 */
	async component(interaction) {
		const split = interaction.customId.split('/');
		const id = split[0];
		const args = split.slice(1);

		if (id === `merge_cancel`) {
			const member_id = args[0];
			const timeout = args[1];

			if (member_id != interaction.member.id) {
				return await interaction.reply({ ephemeral: true, content: `Only the initiating member can cancel the merge!` });
			}

			clearTimeout(timeout);

			return await interaction.update({
				content: `This merge was cancelled by ${interaction.member.displayName}`,
				components: [],
				embeds: [],
			});
		}
		else if (id === `merge_resplit`) {
			const SplitCommand = require("./split");
			const member_id = args[0];
			const audit_id = Number(args[1]);

			if (member_id != interaction.member.user.id) {
				return await interaction.reply({ ephemeral: true, content: `Only the initiating member can resplit` });
			}

			const guild = this.client.guilds.resolve(interaction.guild_id);
			const member = guild.members.resolve(interaction.member.user.id);
			/** @type {MergeAudit} */
			const audit = this.client.auditManager.audits.find(a => a.id == audit_id);
			if (!audit) {
				this.client.logger.error(new Error(`Cannot find audit ${audit_id} @ ${id}`), interaction);
				return await interaction.reply({ ephemeral: true, content: `Something went wrong, sorry!` });
			}

			const arr = [...audit.data.list.values()].flat();
			const Split = new SplitCommand(this.client);
			const [_, embed, audt] = await Split.exec(member, audit.data.to, audit.data.from, arr);

			return await interaction.reply({
				content: `Resplit succesfully`,
				embeds: [
					embed,
				],
				components: [
					Split.components.runRes(member, audt),
				],
			});
		}
		else if (id === `merge_run`) {
			const member_id = args[0];
			const audit_id = Number(args[1]);

			if (member_id != interaction.member.user.id) {
				return await interaction.reply({ ephemeral: true, content: `Only the initiating member can remerge` });
			}

			const guild = this.client.guilds.resolve(interaction.guild_id);
			const member = guild.members.resolve(interaction.member.user.id);
			/** @type {SplitAudit} */
			const audit = this.client.auditManager.audits.find(a => a.id == audit_id);
			if (!audit) {
				this.client.logger.error(new Error(`Cannot find audit ${audit_id} @ ${id}`), interaction);
				return await interaction.reply({ ephemeral: true, content: `Something went wrong, sorry!` });
			}

			const [_, embed, audt] = await this.exec(member, audit.data.from, audit.data.to);
			return await interaction.reply({
				embeds: [
					embed,
				],
				components: [
					this.components.runFinal(member, audt),
				],
			});
		}
	}
}

module.exports = MergeCommand;