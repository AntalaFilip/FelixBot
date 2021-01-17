const { VoiceState } = require("discord.js");
const { CommandoClient } = require("discord.js-commando");
const LessonStudent = require("../types/lesson/lessonstudent");
const Logger = require("./logger");

class VoiceStateManager {
	/**
	 * Creates a new VoiceState manager
	 * @param {CommandoClient} client The client that instantiated this
	 */
	constructor(client) {
		this.client = client;
		this.logger = new Logger("VoiceStateManager");
	}

	/**
	 * Handles VoiceState updates
	 * @param {VoiceState} oldstate The old VoiceState
	 * @param {VoiceState} newstate The new VoiceState
	 */
	async voiceStateUpdate(oldstate, newstate) {
		const date = new Date();
		const member = newstate.member;
		const currenttime = `${date.getHours()}:${date.getMinutes()}`;
		const oldchan = oldstate.channel;
		const newchan = newstate.channel;
		const lessons = this.client.databaseManager.getOngoingLessons();
		if (newchan != oldchan) {
			if (oldchan) {
				if (newchan) {
					this.logger.log(`${currenttime} - ${member.nickname || member.user.username} changed channels from ${oldchan.name} to ${newchan.name}`);
				}
				else {
					this.logger.log(`${currenttime} - ${member.nickname || member.user.username} left ${oldchan.name}`);
				}
			}
			else if (newchan) {
				this.logger.log(`${currenttime} - ${member.nickname || member.user.username} joined ${newchan.name}`);
			}
		}
		// Does the old channel exist?
		if (oldchan) {
			const clsid = oldchan.name.slice(0, 2);
			const lesson = lessons.find(les => les.classid === clsid);
			// Is there an ongoing lesson in the old channel?
			if (lesson) {
				// Does the old channel not match the new channel
				if (oldchan !== newchan) {
					// If the channel is not in the same category
					if (newchan == null || newchan.name.slice(0, 2) !== clsid) {
						const student = lesson.students.find(val => val.member.id == member.id);
						if (student) student.left();
						else this.logger.error(`Student does not exist! This should not happen!`);
					}
				}
			}
			// Does the new channel exist?
			if (newchan) {
				// Get the class ID
				const clsidnew = newchan.name.slice(0, 2);
				// Find the lesson and key
				const lessonnew = lessons.find(les => les.classid === clsidnew);
				// Is there an ongoing lesson in the new channel, and the lessons are not the same, and the channels are not the same
				if (lessonnew && lessonnew != lesson && newchan != oldchan) {
					const student = lessonnew.students.find(val => val.member.id == member.id);
					if (student) student.joined();
					else new LessonStudent(member, lesson);
					/* join */
				}
			}
		}
		else if (newchan) {
			// Get the class ID
			const clsidnew = newchan.name.slice(0, 2);
			// Find the lesson and key
			const lessonnew = lessons.find(les => les.classid === clsidnew);
			// Is there an ongoing lesson in the new channel
			if (lessonnew) {
				/* join */
			}
			/* else {
				// Get the timetable for today
				const today = timetable[new Date().getDay()];
				// Find a lesson in today's timetable, matching the teacher, the class he's just joined, the current period and week
				const upcoming = today.find(les => les.includes(`@${clsidnew}#${member.id}`) && les.includes(`%${this.client.timeUtils.getCurrentPeriod()}`) && les.includes(`^${this.client.databaseManager.getSettings(newchan.guild).pop().week}`));
				// Run the startLesson function
				if (upcoming) client.startLesson(member, upcoming, newchan, newchan.parent.children.find(txt => txt.name.substring(txt.name.indexOf("-") + 1) === upcoming.substring(upcoming.indexOf(`!`) + 1, upcoming.indexOf(`@`)) && txt.type === `text`));
			} */
		}
	}
}

module.exports = VoiceStateManager;