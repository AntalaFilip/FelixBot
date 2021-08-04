const { MessageEmbed, CommandInteraction, MessageActionRow, MessageSelectMenu, Message, MessageComponentInteraction, GuildMember, Role } = require("discord.js");
const { Command } = require("../../types/command");
const { getChanName, removeStartingDot: rsd } = require("../../util/stringutils");
const config = require('../../config.json');
const EduStudent = require("../../types/edu/edustudent");
const EduTeacher = require("../../types/edu/eduteacher");
const EduClass = require("../../types/edu/educlass");
const TimetableUtil = require("../../util/timetable");
const EduBase = require("../../types/edu/edubase");

class TimetableCommand extends Command {
	constructor(client) {
		super(client, {
			id: `863726535490666536`,
			name: `timetable`,
			group: `lesson`,
			memberName: `timetable`,
			description: `Prints the specified timetable`,
			examples: [`timetable`],
			components: [`timetable_select_class`],
		});

		this.components = {
			/**
			 * @param {GuildMember} member
			 * @param {EduBase[]} edu
			 * @returns
			 */
			timetableSelect: (member, edu, def) => (
				new MessageSelectMenu({
					placeholder: 'Select class:',
					minValues: 1,
					maxValues: 1,
					customId: `timetable_select_class/${member.id}`,
				})
					.addOptions(
						edu.map(e => ({
							label: (e.member && rsd(e.member.displayName)) || e.name || e.short,
							value: e.id,
							default: def && def === e.id,
						})).reverse(),
					)
			),
		};
	}

	/**
	 *
	 * @param {CommandInteraction} interaction
	 * @returns
	 */
	async run(interaction) {
		const guild = interaction.guild;
		// TODO: future-proof: return in DM's
		const member = interaction.member;
		const chan = interaction.channel;
		const args = interaction.options;
		const target = args.getMentionable('target') || member;
		const silent = args.getBoolean('silent');
		const EDU = this.client.edupageManager;

		const edu = (target instanceof Role)
			? EDU.classes.find(c => c.role === target)
			: (EDU.teachers.find(t => t.member && t.member === target) || EDU.students.find(s => s.member && s.member === target));

		if (!edu) {
			if (target instanceof Role) return await interaction.reply({ ephemeral: true, content: `This role does not have a timetable!` });
			else return await interaction.reply({ ephemeral: true, content: `This user is not linked to an EduPage user!` });
		}

		const embed = await this.exec(edu, member);

		const ephemeral = silent ?? true;
		const classes = EDU.classes;
		const me = EDU.teachers.find(t => t.member === member) || EDU.students.find(s => s.member === member);
		const choices = classes.concat(me).filter(o => o);
		await interaction.reply({
			ephemeral: ephemeral,
			embeds: [embed],
			components: [
				new MessageActionRow()
					.addComponents(
						this.components.timetableSelect(member, choices, edu.id),
					),
			],
		});
	}

	/**
	 * @param {EduStudent | EduTeacher | EduClass} edu
	 * @param {GuildMember} member
	 * @returns
	 */
	async exec(edu, member) {
		const EDU = this.client.edupageManager;
		const cards = EDU.cards.filter(c => c.lesson.teacherids.includes(edu.id) || c.lesson.studentids.includes(edu.id) || c.lesson.classids.includes(edu.id));
		/** @type {string} */
		const name = (edu.member && rsd(edu.member.displayName)) || edu.name || edu.short;
		/** @type {Role | GuildMember} */
		const mention = (edu instanceof EduClass) ? edu.role : edu.member;
		const mtext = mention && `<@${mention instanceof Role ? '&' : ''}${mention.id}>`;
		const embed = new MessageEmbed()
			.setColor(`FUCHSIA`)
			.setTitle(`Timetable for ${name}`)
			.setURL(`https://felix.edupage.org/timetable/`)
			.setAuthor(this.client.user.username, this.client.user.avatarURL())
			.setDescription(`${mtext || name}'s timetable, requested by <@${member.id}>`)
			.setThumbnail(`https://cdn.discordapp.com/attachments/371283762853445643/768906541277380628/Felix-logo-01.png`)
			.setFooter(`Timetable - ${EDU.raw[0].data_rows[0].reg_name} - version ${EDU.currenttt.text}`)
			.setTimestamp();

		const textcards = TimetableUtil.cardsToText(cards, edu instanceof EduTeacher).sort(
			(_, __, c1, c2) => {
				const card1 = EDU.cards.find(c => c.id === c1);
				const card2 = EDU.cards.find(c => c.id === c2);
				return card1.period.period - card2.period.period;
			});
		const mappedcards = textcards.map(
			(text, id) => {
				const card = EDU.cards.find(c => c.id === id);
				const days = EDU.daydefs.filter(dd => dd.matches(card.rawdays)).map(dd => dd.day).filter(o => o);
				const weeks = EDU.weekdefs.filter(wd => wd.matches(card.rawweeks)).map(wd => wd.week).filter(o => o);
				text = `${card.period.name}: ${text}`;
				return [text, days, weeks];
			});

		const filtered = mappedcards.filter(([_, __, w]) => w.includes(EDU.currentWeek));
		const timetable = [];
		for (let i = 0; i < EDU.days.length; i++) timetable.push([]);

		for (const card of filtered) {
			for (const day of card[1]) {
				const d = Number(day.id);
				timetable[d].push(card[0]);
			}
		}

		embed.addFields(
			timetable.map(
				(t, i) => ({
					name: EDU.days.find(d => d.id == i).name,
					value: t.join('\n'),
				}),
			),
		);

		return embed;
	}

	/**
	 *
	 * @param {MessageComponentInteraction} interaction
	 * @returns
	 */
	async component(interaction) {
		const split = interaction.customId.split('/');
		const id = split[0];
		const args = split.slice(1);
		if (id === `timetable_select_class` && interaction.isSelectMenu()) {
			const EDU = this.client.edupageManager;
			const member = interaction.member;
			const isOriginalAuthor = (args[0] == member.id);
			const eduid = interaction.values[0];
			const edu = EDU.classes.find(c => c.id === eduid) || EDU.teachers.find(t => t.id === eduid) || EDU.students.find(s => s.id === eduid);

			const classes = EDU.classes;
			const me = EDU.teachers.find(t => t.member === member) || EDU.students.find(s => s.member === member);
			const choices = classes.concat(me).filter(o => o);

			const embed = await this.exec(edu, member);

			if (isOriginalAuthor) {
				await interaction.update({
					embeds: [embed],
					components: [
						new MessageActionRow()
							.addComponents(this.components.timetableSelect(member, choices, edu.id)),
					],
				});
				return;
			}
			else {
				await interaction.reply({
					ephemeral: true,
					embeds: [embed],
					components: [
						new MessageActionRow()
							.addComponents(this.components.timetableSelect(member, choices, edu.id)),
					],
				});
				return;
			}
		}
	}
}

module.exports = TimetableCommand;