const { VoiceState } = require("discord.js");
const { CommandoClient } = require("discord.js-commando");
const LessonStudent = require("../types/lesson/lessonstudent");
const Logger = require("../util/logger");
const str = require("../util/stringutils");
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
	async voiceStateUpdate(oldstate, newstate) {
		const date = new Date();
		const member = newstate.member;
		const oldchan = oldstate.channel;
		const newchan = newstate.channel;
		const mgr = this.client.lessonManager;
		const lessons = mgr.lessons;
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
		if (oldchan) {
			const clsid = str.getChanName(oldchan);
			const lesson = lessons.find(les => les.classid === clsid);
			// Is there an ongoing lesson in the old channel?
			if (lesson) {
				// Does the old channel not match the new channel
				if (oldchan !== newchan) {
					// If the channel is not in the same category
					if (newchan == null || str.getChanName(newchan) !== clsid) {
						const student = lesson.students.find(val => val.member.id == member.id);
						if (student) mgr.left(lesson, student);
						else this.logger.error(`Student does not exist! This should not happen!`);
					}
				}
			}
			// Does the new channel exist?
			if (newchan) {
				// Get the class ID
				const clsidnew = str.getChanName(newchan);
				// Find the lesson and key
				const lessonnew = lessons.find(les => les.classid === clsidnew);
				// Is there an ongoing lesson in the new channel, and the lessons are not the same, and the channels are not the same
				if (lessonnew && lessonnew != lesson && newchan != oldchan) {
					const student = lessonnew.students.find(val => val.member.id == member.id);
					if (student) mgr.joined(lessonnew, student);
					else mgr.joined(lessonnew, new LessonStudent(member, lessonnew));
				}
			}
		}
		else if (newchan) {
			// Get the class ID
			const clsidnew = str.getChanName(newchan);
			// Find the lesson and key
			const lessonnew = lessons.find(les => les.classid === clsidnew);
			// Is there an ongoing lesson in the new channel
			if (lessonnew) {
				const student = lessonnew.students.find(val => val.member.id == member.id);
				if (student) mgr.joined(lessonnew, student);
				else mgr.joined(lessonnew, new LessonStudent(member, lessonnew));
			}
		}
		if (oldstate.selfMute != newstate.selfMute) {
			const lesson = lessons.find(ls => ls.classid == str.getChanName(newstate.channel));
			if (!lesson) return;
			const participant = lesson.students.find(st => st.member.id == member.id) || lesson.teacher.member.id == member.id ? lesson.teacher : null;
			if (participant) mgr.togglemute(lesson, participant, newstate.selfMute);
		}
		if (oldstate.selfDeaf != newstate.selfDeaf) {
			const lesson = lessons.find(ls => ls.classid == str.getChanName(newstate.channel));
			if (!lesson) return;
			const participant = lesson.students.find(st => st.member.id == member.id) || lesson.teacher.member.id == member.id ? lesson.teacher : null;
			if (participant) mgr.toggledeaf(lesson, participant, newstate.serverDeaf);
		}
		if (oldstate.selfVideo != newstate.selfVideo) {
			const lesson = lessons.find(ls => ls.classid == str.getChanName(newstate.channel));
			if (!lesson) return;
			const participant = lesson.students.find(st => st.member.id == member.id) || lesson.teacher.member.id == member.id ? lesson.teacher : null;
			if (participant) mgr.togglevideo(lesson, participant, newstate.selfVideo);
		}
	}
}

module.exports = VoiceStateManager;