const { CommandoClient } = require("discord.js-commando");
const { MessageEmbed, GuildMember } = require('discord.js');
const Logger = require("./logger");
const Lesson = require("../types/lesson/lesson");

class LessonManager {
	constructor(client) {
		this.client = client;
		this.logger = new Logger("LessonManager");
		this.lessons = client.databaseManager.getOngoingLessons();
		this.logger.log(`Ready!`);
	}

	/**
	 * Forces the manager to sync lessons from the database.
	 * @returns {Lesson[]} The currently ongoing lessons; an array of Lesson object, or an empty array.
	 */
	forceSync() {
		this.lessons = this.client.databaseManager.getOngoingLessons();
		return this.lessons;
	}

	/**
	 * Checks if a lesson should be started with the member as the teacher
	 * @param {GuildMember} member
	 */
	shouldStartLesson(member) {
		if (!this.client.permManager.isTeacher(member)) return false;
		// To-Do
	}

	/* checkTimetable() {

	} */


	/* joinedLesson(member, lessonKey) {
		// Get current time
		const curtimems = new Date().getTime();
		// Get current lesson
		const lesson = this.client.lessons.get(lessonKey);
		// If the member is the teacher
		if (member == lesson.teacher) {
			// Check if teacher was not present to prevent DMs being sent on lesson start
			if (!lesson.teacherPresent) {
				// Notify teacher
				member.createDM().then(dm => {
					dm.send(`You have reconnected to ${lesson.lesson.toUpperCase()}@${lesson.class.charAt(0).toUpperCase() + lesson.class.slice(1)}`);
				});
			}
			// Set teacher presence
			lesson.teacherPresent = true;
			// Debug log
			console.log(`The teacher (${lesson.teacherName}) has rejoined!`);
		}
		// Else if it is a student
		else {
			// Fetch student from lesson
			const student = lesson.students.find(mem => mem.id === member.id);
			// Get current channel
			const chan = member.voice.channel;
			// If the student joined for the first time
			if (!student) {
				// Push new student array
				lesson.students.push({
					user: member,
					id: member.id,
					name: member.nickname || member.user.username,
					chan: chan,
					attendance: {
						joined: [curtimems],
						left: [],
					},
				});
				// Debug log
				console.log(`${member.id} joined the lesson for the first time [${curtimems}]`);
			}
			// Else...
			else {
				// Push new join time to attendance
				student.attendance.joined.push(curtimems);
				// Set current channel
				student.chan = chan;
				// Debug log
				console.log(`${student.name} (${student.id}) joined the lesson again (${student.attendance.joined.length}) [${curtimems}]`);
			}
		}
	}

	leftLesson(member, lessonKey) {
		// Get current lesson
		const lesson = this.client.lessons.get(lessonKey);
		// If the member is the teacher
		if (member == lesson.teacher) {
			// Get class ID
			const clsid = lesson.class;
			// Set teacher presence
			lesson.teacherPresent = false;
			// Warn teacher
			member.createDM().then(dm => {
				dm.send(`You disconnected from an ongoing lesson (${lesson.lesson.toUpperCase()}@${clsid.charAt(0).toUpperCase() + clsid.slice(1)})! Please reconnect or end the lesson (!teach end). The lesson is going to be ended automatically in 5 minutes`);
				// Set the five min timeout
				setTimeout(() => {
					// If the lesson still exists
					if (this.client.lessons.get(lessonKey)) {
						// And if the teacher is still not present
						if (!lesson.teacherPresent) {
							// Notify teacher
							dm.send(`The lesson (${lesson.lesson.toUpperCase()}@${clsid.charAt(0).toUpperCase() + clsid.slice(1)}) was ended due to you not being present for five minutes!`);
							// End the lesson
							this.client.endLesson(lessonKey);
						}
					}
				}, 300000);
			});
			console.log(`The teacher (${lesson.teacherName}) has left the lesson!`);
		}
		// Else if it is a student
		else {
			// Get student from the lesson
			const student = lesson.students.find(std => std.id === member.id);
			// Get current time in ms
			const curtimems = new Date().getTime();
			// Push ms time to attendance array
			student.attendance.left.push(curtimems);
			// Debug log
			console.log(`${student.name} has left the lesson! (${curtimems})`);
		}
	} */

	/* async startLesson(teacher, lessonId, vchan, tchan) {
		const ctg = vchan.parent;
		const date = new Date();
		const lesson = lessonId.substring(lessonId.indexOf(`!`) + 1, lessonId.indexOf(`@`));
		const group = lessonId.substring(lessonId.indexOf(`$`) + 1, lessonId.indexOf(`%`));

		// Add the lesson to the array
		this.client.lessons.set(lessonId, {
			textchannel: tchan,
			class: lessonId.substring(lessonId.indexOf(`@`) + 1, lessonId.indexOf(`#`)),
			lesson: lesson,
			group: group,
			teacher: teacher,
			teacherName: teacher.displayName,
			teacherPresent: true,
			students: [],
			startedAt: {
				date: `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`,
				time: `${date.getHours()}:${date.getMinutes()}`,
				mstime: date.getTime(),
			},
			period: this.client.period,
		});
		const crntlsn = this.client.lessons.get(lessonId);
		// Run joinedlesson for each student already in the category
		const ctgf = ctg.children.filter(chan => chan.type === `voice`);
		for (const chan of ctgf) {
			for (const mem of chan[1].members) {
				if (mem[1] === teacher) continue;
				this.client.joinedLesson(mem[1], lessonId);
			}
		}
		// Create an embed and send it to the original text channel
		const embed = new MessageEmbed()
			.setColor(`#00ff00`)
			.setTitle(`Lesson started!`)
			.setAuthor(`${teacher.displayName}`, teacher.user.avatarURL())
			.setDescription(`${lesson.toUpperCase()} has started, happy learning!`)
			.setThumbnail('https://cdn.discordapp.com/attachments/371283762853445643/768906541277380628/Felix-logo-01.png')
			.setTimestamp()
			.setFooter(`End the lesson by running !teach end`);
		crntlsn.embedmsg = await tchan.send(embed);
	} */

	/* endLesson(lessonKey) {
		// Get current lesson
		const lesson = this.client.lessons.get(lessonKey);
		// Get the students array, text channel where the lesson was started and the teacher
		const students = lesson.students;
		const textchan = lesson.textchannel;
		const teacher = lesson.teacher;
		// Create the red public embed symbolizing lesson end and send it to the text channel
		const publicembed = new MessageEmbed()
			.setColor(`#ff0000`)
			.setTitle(`Lesson ended!`)
			.setAuthor(`${lesson.teacherName}`, teacher.user.avatarURL())
			.setDescription(`${lesson.lesson.toUpperCase()} has ended!`)
			.setThumbnail(`https://cdn.discordapp.com/attachments/371283762853445643/768906541277380628/Felix-logo-01.png`)
			.setTimestamp()
			.setFooter(`The lesson has ended!`);
		textchan.send(publicembed);
		// Create the yellow private embed, summarizing the lesson
		const privateembed = new MessageEmbed()
			.setColor(`#ffff00`)
			.setTitle(`Summary of ${lesson.lesson.toUpperCase()}@${lesson.class.charAt(0).toUpperCase() + lesson.class.slice(1)}`)
			.setAuthor(`${this.client.user.username}`, `${this.client.user.avatarURL()}`)
			.setDescription(`The summary of ${lesson.lesson.toUpperCase()}@${lesson.class.charAt(0).toUpperCase() + lesson.class.slice(1)} lasting from ${lesson.startedAt.time} to ${new Date().getHours()}:${new Date().getMinutes()}`)
			.setThumbnail(`https://cdn.discordapp.com/attachments/371283762853445643/768906541277380628/Felix-logo-01.png`)
			.setTimestamp();
		const extraembed = new MessageEmbed()
			.setColor(`#ffff00`);
		// Populate the private embed - loop until all the student data has been processed
		for (let i = 0; i < students.length; i++) {
			// Get the current student's name
			const name = students[i].name;
			// Create a var with join times
			let joinedms = 0;
			// Create a var with leave times
			let leftms = 0;
			const jlen = students[i].attendance.joined.length;
			const llen = students[i].attendance.left.length;
			if (jlen > llen) leftms = leftms + new Date().getTime();
			// Loop all the join (ms) times and add them to joinedms
			for (let ii = 0; ii < students[i].attendance.joined.length; ii++) {
				joinedms = joinedms + students[i].attendance.joined[ii];
			}
			// Loop all the leave (ms) times and add them to leftms
			for (let ii = 0; ii < students[i].attendance.left.length; ii++) {
				leftms = leftms + students[i].attendance.left[ii];
			}
			// Create a var with the net time in lesson (ms)
			let netms = 0;
			if (joinedms > leftms) netms = joinedms - leftms;
			else netms = leftms - joinedms;
			// Convert the net time to minutes and floor them
			const min = Math.floor(netms / 60000);
			// Get the first joined time
			const firstjoined = new Date(students[i].attendance.joined[0]);
			// Create an array with the current student's processed attendance data
			const atten = [`First joined at ${firstjoined.getHours()}:${firstjoined.getMinutes()}`, `Total time: ${min} min`];
			// Add the data to the embed, if the embed's limit is hit, use the extra embed
			if (i <= 25) { privateembed.addField(name, atten, true); }
			else if (i < 50) { extraembed.addField(name, atten, true); }
			else { teacher.createDM().then(dm => dm.send(`Unfortunately, I have reached the user limit I can log for you`)); break; }
		}
		// Send the populated private embed to the teacher
		teacher.createDM().then(dm => {
			dm.send(privateembed);
			if (extraembed.fields.length != 0) dm.send(extraembed);
		});
		// Delete the lesson from the map
		this.client.lessons.delete(lessonKey);
	} */
}

module.exports = LessonManager;