const { Command, CommandoMessage } = require('discord.js-commando');
const timetable = require('../../timetable');
const Lesson = require('../../types/lesson/lesson');

class TeachCommand extends Command {
	constructor(client) {
		super(client, {
			name: `teach`,
			group: `lesson`,
			memberName: `teach`,
			description: `Starts or ends the specified lesson`,
			aliases: [`lesson`],
			examples: [`teach sjl`, `teach end`, `teach mat`],
			guildOnly: true,
			userPermissions: [`MOVE_MEMBERS`, `MANAGE_CHANNELS`],
			args: [
				{
					key: `name`,
					prompt: `What lesson do you want to start? Use 'end' to end the current lesson`,
					type: `string`,
					oneOf: [`sjl`, `mat`, `anj`, `anjp`, `bio`, `chem`, `dej`, `fyz`, `geo`, `huv`, `inf`, `nej`, `obn`, `rk`, `end`],
				},
				{
					key: `override`,
					prompt: `Do you wish to override the timetable?`,
					type: `boolean`,
					default: false,
				},
				{
					key: `teacher`,
					prompt: `Mention the teacher:`,
					type: `user`,
					default: `self`,
				},
			],
		});
	}

	/**
	 * Runs the Teach command with the specified Message and arguments
	 * @param {CommandoMessage} message The Message that initiated this command
	 * @param {Object} args The arguments supplied to this command
	 */
	async run(message, args) {
		// Get the lessons array
		const lessons = this.client.lessonManager.lessons;
		// Get the teacher (member that instantiated the command)
		const teacher = message.member;
		// If the lesson is being started
		if (args.name !== `end`) {
			// If the teacher is not in a channel, return with a warning
			if (!teacher.voice.channel) return message.reply(`You have to be in a voice channel to start a lesson!`);

			// Get the lesson id
			const lesson = args.name;
			// Get the voice channel
			const chan = teacher.voice.channel;
			// Get the class ID
			let clsid = chan.name.slice(0, 2);
			// Special exception for Ko&Pa lessons
			if (chan.parentID == `770594101002764330`) clsid = `ko&pa`;
			// Check if there aren't lessons running already
			const already = lessons.find(les => les.teacher.member.id === teacher.id);
			if (already) return message.reply(`You are already teaching a lesson ${already.lessonid}@${already.classid}! Type !teach end to end it!`);
			// Check if the lesson is in the timetable and set the lessonId
			const lsid = await this.client.lessonManager.checkTimetable(lesson, clsid, teacher);
			// If the lesson isn't in the timetable and the teacher didn't override, return with a warning
			let group = 'manual';
			if (!lsid && !args.override) {
				return message.reply(`this lesson is not in the timetable!\nAre you sure it is time for your lesson?\nIf you wish to override the timetable, add true to the end of your command!`);
			}
			else if (!args.override) {
				group = lsid.substring(lsid.indexOf('$') + 1, lsid.indexOf('%'));
			}
			// Start the lesson
			this.client.lessonManager.start(new Lesson(null, null, teacher, lesson, clsid, group, this.client.timeUtils.getCurrentPeriod(), Array.from(chan.members.values())));
			message.reply(`Started!`);
		}
		// Else if the lesson is being ended
		else if (args.name === `end`) {
			// Find the lesson that is being ended
			const lesson = lessons.find(ls => ls.teacher.member.id === teacher.id);
			// If the teacher is teaching a lesson:
			if (lesson) {
				// End the lesson
				this.client.lessonManager.end(lesson);
			}
			// Else send a warning
			else {
				message.reply(`You do not have any ongoing lessons`).then(newmsg => newmsg.delete({ timeout: 10000 }));
				message.delete({ reason: `Invalid command` });
			}
		}
	}
}

module.exports = TeachCommand;