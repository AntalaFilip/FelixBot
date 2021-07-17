const { CommandInteraction, MessageButton, MessageComponentInteraction, GuildMember, MessageActionRow } = require("discord.js");
const { Command } = require("../../types/command");
const { removeStartingDot } = require("../../util/stringutils");

class RandomMemberCommand extends Command {
	constructor(client) {
		super(client, {
			id: `863141019021606912`,
			name: `member`,
			group: `random`,
			memberName: `member`,
			description: `Gets a random member`,
			examples: [`member`],
			guildOnly: true,
			components: [`member_reroll_edit`, `member_reroll_new`],
		});

		this.components = {
			rerollNew: (member, scope) => (
				new MessageButton({
					style: 'PRIMARY',
					label: 'Reroll in new message',
					emoji: '🔄',
					customId: `member_reroll_new/${member.id}/${scope}`,
				})
			),
			rerollEdit: (member, scope) => (
				new MessageButton({
					style: 'DANGER',
					label: 'Reroll this message',
					emoji: '🔄',
					customId: `member_reroll_edit/${member.id}/${scope}`,
				})
			),
		};
	}

	/**
	 * @param {CommandInteraction} interaction
	 * @returns
	 */
	async run(interaction) {
		const guild = interaction.guild;
		const instantiator = interaction.member;
		const channel = interaction.channel;
		const args = interaction.options;
		const scope = args.get('scope');
		const LMGR = this.client.lessonManager;
		const lesson = LMGR.isTeachingLesson(instantiator) || LMGR.isInLesson(instantiator);

		try {
			const member = await this.exec(scope.value, { channel, lesson, voice: instantiator.voice.channel, guild });

			if (member) {
				await interaction.reply({
					content: `The randomly chosen member is:\n${removeStartingDot(member.displayName)}`,
					components: [
						new MessageActionRow()
							.addComponents(
								this.components.rerollNew(instantiator, scope.value),
								this.components.rerollEdit(instantiator, scope.value),
							),
					],
				});
				return;
			}
			else {
				await interaction.reply({ ephemeral: true, content: `I couldn't find anyone!` });
				return;
			}
		}
		catch (err) {
			await interaction.reply({ ephemeral: true, content: err.message });
			return;
		}
	}

	/**
	 *
	 * @param {string} scope
	 * @param {*} param1
	 * @returns
	 */
	async exec(scope, { channel, lesson, voice, guild }) {
		/** @type {GuildMember} */
		let member;
		switch (scope) {
			case `lesson`:
				if (!lesson) {
					throw new Error('You are not attending a lesson!');
				}
				member = lesson.students[Math.floor(Math.random() * lesson.students.length)].member;
				break;
			case `voice`:
				if (!voice) {
					throw new Error('You have to be in a voice channel!');
				}
				member = voice.members.random();
				break;
			case `class`:
				try {
					member = guild.roles.cache.find(role => role.name.toLowerCase().startsWith(channel.name.slice(0, 2))).members.random();
				}
				catch (e) {
					throw new Error(`I couldn't resolve this channel to a class`);
				}
				break;
			case `server`:
				member = (await guild.members.fetch()).random();
				break;
		}
		if (!member) throw new Error(`I couldn't find anybody!`);
		return member;
	}

	/**
	 * @param {string} rawid
	 * @param {MessageComponentInteraction} interaction
	 * @returns
	 */
	async component(rawid, interaction) {
		const split = rawid.split('/');
		const id = split[0];
		const args = split.slice(1);

		if (id.includes('member_reroll')) {
			if (args[0] == interaction.member.id) {
				const ar = { name: 'scope', value: args[1] };
				const LMGR = this.client.lessonManager;
				const lesson = LMGR.isTeachingLesson(interaction.member) || LMGR.isInLesson(interaction.member);
				interaction.data ? interaction.data.options = [ar] : interaction.data = { options: [ar] };
				try {
					const member = await this.exec(args[1], { channel: interaction.channel, lesson, voice: interaction.member.voice.channel, guild: interaction.guild });
					if (id === 'member_reroll_edit') {
						await interaction.update({ content: `The randomly chosen member is:\n${removeStartingDot(member.displayName)}` });
						return;
					}
					await interaction.reply({
						content: `The randomly chosen member is:\n${removeStartingDot(member.displayName)}`,
						components: [
							new MessageActionRow()
								.addComponents(
									this.components.rerollNew(member, args[1]),
									this.components.rerollEdit(member, args[1]),
								),
						],
					});
					return;
				}
				catch (err) {
					await interaction.reply({ ephemeral: true, content: err.message });
					return;
				}
			}
			else {
				await interaction.reply({ ephemeral: true, content: `Only the original author may reroll the command` });
				return;
			}
		}
	}
}

module.exports = RandomMemberCommand;