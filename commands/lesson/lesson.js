const { MessageActionRow, MessageButton, MessageComponentInteraction } = require('discord.js');
const { CommandInteraction } = require('discord.js');
const timetable = require('../../timetable');
const { Command } = require('../../types/command');
const Lesson = require('../../types/lesson/lesson');
const Logger = require('../../util/logger');
const str = require('../../util/stringutils');
const time = require('../../util/timeutils');
const TimetableCommand = require('./timetable');

class LessonCommand extends Command {
	constructor(client) {
		super(client, {
			name: `lesson`,
			group: `lesson`,
			memberName: `lesson`,
			description: `Starts or ends the specified lesson`,
			examples: [`lesson start sjl`, `lesson end`, `lesson start mat true`],
			guildOnly: true,
			userPermissions: [`MOVE_MEMBERS`, `MANAGE_CHANNELS`],
			args: [
				{
					key: `name`,
					prompt: `What lesson do you want to start? Use 'end' to end the current lesson`,
					type: `string`,
					oneOf: [
						{
							"name": "sjl",
							"value": "sjl",
						},
						{
							"name": "mat",
							"value": "mat",
						},
						{
							"name": "anj",
							"value": "anj",
						},
						{
							"name": "anjp",
							"value": "anjp",
						},
						{
							"name": "bio",
							"value": "bio",
						},
						{
							"name": "chem",
							"value": "chem",
						},
						{
							"name": "dej",
							"value": "dej",
						},
						{
							"name": "fyz",
							"value": "fyz",
						},
						{
							"name": "geo",
							"value": "geo",
						},
						{
							"name": "huv",
							"value": "huv",
						},
						{
							"name": "inf",
							"value": "inf",
						},
						{
							"name": "nej",
							"value": "nej",
						},
						{
							"name": "obn",
							"value": "obn",
						},
						{
							"name": "rk",
							"value": "rk",
						},
					],
				},
				{
					key: `override`,
					prompt: `Do you wish to override the timetable?`,
					type: `boolean`,
					default: false,
				},
			],
		});

		this.components = {
			endLessonButton: (lesson, member) => (
				new MessageButton(
					{
						style: 'DANGER',
						label: 'End lesson',
						emoji: '🏁',
						customID: `lesson_end/${member.id}/${lesson.id}`,
					},
				)
			),
			overrideButton: (member, channel, lsid) => (
				new MessageButton(
					{
						style: 'DANGER',
						label: 'Override',
						customID: `lesson_override/${member.id}/${channel.id}/${lsid}`,
					},
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
		const start = interaction.options.has('start');
		// Get the lessons array
		const lessons = this.client.lessonManager.lessons;
		// Get the teacher (member that instantiated the command)
		const teacher = interaction.member;
		// If the lesson is being started
		if (start) {
			const command = interaction.options.get('start');
			// Get the voice channel
			const chan = teacher.voice.channel;
			// If the teacher is not in a channel, return with a warning
			if (!chan) return await interaction.reply({ ephemeral: true, content: `You have to be in a voice channel to start a lesson!` });

			// Get the lesson id
			const lesson = command.options.get('lesson');
			const override = command.options.get('override');
			// Get the class ID
			let clsid = str.getChanName(chan).slice(0, 2);
			// Special exception for Ko&Pa lessons
			if (chan.parentID == `770594101002764330`) clsid = `ko&pa`;
			// Check if there aren't lessons running already
			const already = lessons.find(les => les.teacher.member.id === teacher.id);
			if (already) {
				return await interaction.reply({
					ephemeral: true,
					content: `You are already teaching a lesson ${already.lessonid}@${already.classid}! Type \`/lesson end\` or use the end button to end it first!`,
					components: [
						new MessageActionRow()
							.addComponents(
								this.components.endLessonButton(already, teacher),
							),
					],
				});
			}
			// Check if the lesson is in the timetable and set the lessonId
			const lsid = await this.client.lessonManager.checkTimetable(lesson.value, clsid, teacher);

			// If the lesson isn't in the timetable and the teacher didn't override, return with a warning
			let group = 'manual';
			if (!lsid && !override) {
				const settings = await this.client.databaseManager.getSettings(guild.id);
				const roles = guild.roles.cache.filter(r => settings.classes.includes(r.name.toLocaleLowerCase()));
				/** @type {TimetableCommand} */
				const timetableCommand = this.client.interactionManager.commands.get('timetable');
				const timetableSelect = timetableCommand.components.timetableSelect({ id: null }, roles);
				timetableSelect.setPlaceholder('Show timetable for:');

				return interaction.reply({
					ephemeral: true,
					content: `This lesson is not in the timetable!\nAre you sure it is time for your lesson?\nIf you wish to override the timetable, run the command with the override options, or press the button!`,
					components: [
						new MessageActionRow()
							.addComponents(
								this.components.overrideButton(teacher, chan, lesson.value),
							),
						new MessageActionRow()
							.addComponents(
								timetableSelect,
							),
					],
				});
			}
			else if (!override) {
				group = lsid.substring(lsid.indexOf('$') + 1, lsid.indexOf('%'));
			}
			// Start the lesson
			await this.client.lessonManager.start(new Lesson(null, null, teacher, lesson.value, clsid, group, time.getCurrentPeriod(), Array.from(chan.members.values())));
			await interaction.reply({ ephemeral: true, content: `The lesson has started, check the subject channel for confirmation.` });
		}
		// Else if the lesson is being ended
		else {
			const command = interaction.options.get('end');
			const lsid = command.options && command.options.get('lessonid');
			// Find the lesson that is being ended
			const lesson = lessons.find(ls => lsid ? ls.id === lsid.value : ls.teacher.member.id === teacher.id);
			// If the teacher is teaching a lesson:
			if (lesson) {
				// End the lesson
				await this.client.lessonManager.end(lesson, interaction.member.displayName);
				await interaction.reply({ ephemeral: true, content: `The lesson was ended.` });
			}
			else if (lsid) {
				await interaction.reply({ ephemeral: true, content: `This lesson does not exist, or has already ended!` });
			}
			// Else send a warning
			else {
				await interaction.reply({ ephemeral: true, content: `You do not have any ongoing lessons` });
			}
		}
	}

	/**
	 *
	 * @param {MessageComponentInteraction} interaction
	 */
	async component(interaction) {

	}
}

module.exports = LessonCommand;