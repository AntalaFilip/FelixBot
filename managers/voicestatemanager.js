const { VoiceState } = require("discord.js");
const { CommandoClient } = require("discord.js-commando");
const LessonStudent = require("../types/lesson/lessonstudent");
const Logger = require("../util/logger");
class VoiceStateManager {
	/**
	 * Creates a new VoiceState manager
	 * @param {CommandoClient} client The client that instantiated this
	 */
	constructor(client) {
		this.client = client;
		this.logger = new Logger("VoiceStateManager");
		this.logger.log('Ready!');
	}

	/**
	 * Handles VoiceState updates
	 * @param {VoiceState} oldstate The old VoiceState
	 * @param {VoiceState} newstate The new VoiceState
	 */
	voiceStateUpdate(oldstate, newstate) {
		const date = new Date();
		const member = newstate.member;
		const oldchan = oldstate.channel;
		const newchan = newstate.channel;
		const lessons = this.client.databaseManager.getOngoingLessons();
		const mgr = this.client.lessonManager;
		if (newchan != oldchan) {
			if (oldchan) {
				if (newchan) {
					this.logger.log(`${member.displayName} changed channels from ${oldchan.name} to ${newchan.name}`);
				}
				else {
					this.logger.log(`${member.displayName} left ${oldchan.name}`);
				}
			}
			else if (newchan) {
				this.logger.log(`${member.displayName} joined ${newchan.name}`);
			}
		}
		// Does the old channel exist?
		else if (oldchan) {
			const clsid = oldchan.name.slice(0, 2);
			const lesson = lessons.find(les => les.classid === clsid);
			// Is there an ongoing lesson in the old channel?
			if (lesson) {
				// Does the old channel not match the new channel
				if (oldchan !== newchan) {
					// If the channel is not in the same category
					if (newchan == null || newchan.name.slice(0, 2) !== clsid) {
						const student = lesson.students.find(val => val.member.id == member.id);
						if (student) student.left(lesson);
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
					if (student) mgr.joined(lessonnew, student);
					else mgr.addStudent(new LessonStudent(member, lessonnew));
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
				const student = lessonnew.students.find(val => val.member.id == member.id);
				if (student) mgr.joined(lessonnew, student);
				else mgr.addStudent(new LessonStudent(member, lessonnew));
			}
		}
		if (oldstate.mute != newstate.mute) {
			const lesson = lessons.find(ls => ls.classid == newstate.channel.name.slice(0, 2));
			if (!lesson) return;
			const student = lesson.students.find(st => st.member.id == member.id);
			mgr.togglemute(lesson, student);
		}
		if (oldstate.deaf != newstate.deaf) {
			const lesson = lessons.find(ls => ls.classid == newstate.channel.name.slice(0, 2));
			if (!lesson) return;
			const student = lesson.students.find(st => st.member.id == member.id);
			mgr.toggledeaf(lesson, student);
		}
		if (oldstate.selfVideo != newstate.selfVideo) {
			const lesson = lessons.find(ls => ls.classid == newstate.channel.name.slice(0, 2));
			if (!lesson) return;
			const student = lesson.students.find(st => st.member.id == member.id);
			mgr.togglevideo(lesson, student);
		}
	}
}

module.exports = VoiceStateManager;