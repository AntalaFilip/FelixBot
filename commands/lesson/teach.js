const commando = require(`discord.js-commando`);
const timetable = require(`../../timetable`);

module.exports = class TeachCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: `teach`,
			group: `lesson`,
			memberName: `teach`,
			description: `Starts or ends the specified lesson`,
			examples: [ `teach sjl`, `teach end`, `teach mat` ],
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

	async run(message, args) {
		// Get the lessons map
		const lessons = this.client.lessons;
		// Get the teacher (member that instantiated the command)
		const teacher = message.member;
		// Get the teacher's name & ID
		const teacherId = message.author.id;
		// If the lesson is being started
		if (args.name !== `end`) {
			// If the teacher is in a channel
			if (teacher.voice.channel) {
				// Create a new Date
				const date = new Date();
				const day = date.getDay();
				// Set the lesson type
				const lesson = args.name;
				// Get the voice channel
				const chan = teacher.voice.channel;
				// Get the class ID
				let clsid = chan.name.slice(0, 2);
				// Special exception for Ko&Pa lessons
				if (chan.parentID == `770594101002764330`) clsid = `ko&pa`;
				// Check if there aren't lessons running already
				const already = lessons.find(les => les.teacher === teacher);
				if (already) return message.reply(`You are already teaching a lesson ${already.lesson}@${already.class}! Type !teach end to end it!`);
				// Check if the lesson is in the timetable and set the lessonId
				let lessonId = timetable[day].find(ls => ls.includes(`!${lesson}@${clsid}#${teacherId}`) && ls.includes(`%${this.client.period}`) && ls.includes(`^${this.client.week}`));
				// If the lesson isn't in the timetable:
				if (!lessonId) {
					// And the teacher didn't override, return with a warning
					if (!args.override) return message.reply(`this lesson is not in the timetable!\r\nAre you sure it is time for your lesson?\r\nIf you wish to override the timetable, add true to the end of your command!`);
					// Else, if the teacher did override, create a lessonId
					else lessonId = `!${lesson}@${clsid}#${teacherId}*`;
				}
				// Start the lesson
				this.client.startLesson(teacher, lessonId, chan, message.channel);
			}
			else {
				message.reply(`You have to be in a voice channel!`);
			}
		}
		// Else if the lesson is being ended
		else if (args.name === `end`) {
			// Find the lesson that is being ended
			const key = lessons.findKey(usr => usr.teacher === teacher);
			// If the teacher is teaching a lesson:
			if (key) {
				// Run the endLesson function with that lesson
				this.client.endLesson(key);
			}
			// Else send a warning
			else {
				message.reply(`You do not have any ongoing lessons`).then(newmsg => newmsg.delete({ timeout: 10000 }));
				message.delete({ reason: `Invalid command` });
			}
		}
	}
};