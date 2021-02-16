const { VoiceState, GuildMember } = require("discord.js");
const { CommandoClient } = require("discord.js-commando");
const Lesson = require("../types/lesson/lesson");
const LessonStudent = require("../types/lesson/lessonstudent");
const LessonTeacher = require("../types/lesson/lessonteacher");
const Logger = require("../util/logger");
const str = require("../util/stringutils");
const time = require("../util/timeutils");

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
		const member = newstate.member;
		const oldchan = oldstate.channel;
		const newchan = newstate.channel;
		const mgr = this.client.lessonManager;
		await mgr.ready;
		const lessons = mgr.lessons;
		if (newchan != oldchan) {
			if (oldchan) {
				if (newchan) this.logger.log(`${member.displayName} changed channels from ${oldchan.name} to ${newchan.name}`);
				else this.logger.log(`${member.displayName} left ${oldchan.name}`);
			}
			else if (newchan) {
				this.logger.log(`${member.displayName} joined ${newchan.name}`);
			}
		}

		// Does the old channel exist?
		if (oldchan) {
			const clsid = str.getChanName(oldchan);
			const lesson = lessons.find(les => les.allocated.includes(oldchan));
			// Is there an ongoing lesson in the old channel?
			if (lesson) {
				// Does the old channel not match the new channel
				if (oldchan !== newchan) {
					// If the channel is not in the same category
					if (newchan == null || str.getChanName(newchan) !== clsid) {
						const student = lesson.students.find(val => val.member.id == member.id);
						if (student) mgr.left(lesson, student);
						else if (lesson.teacher.member.id == member.id) mgr.left(lesson, lesson.teacher);
						else this.logger.error(`Participant does not exist! This should not happen!`);
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
					else if (lessonnew.teacher.member.id == member.id) mgr.joined(lessonnew, lessonnew.teacher);
					else mgr.joined(lessonnew, new LessonStudent(member));
				}
				else if (!lessonnew) {
					this.handleTeacherJoin(newstate);
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
				else if (lessonnew.teacher.member.id === member.id) mgr.joined(lessonnew, lessonnew.teacher);
				else mgr.joined(lessonnew, new LessonStudent(member));
			}
			else {
				this.handleTeacherJoin(newstate);
			}
		}

		this.handleMute(oldstate, newstate);
		this.handleDeafen(oldstate, newstate);
		this.handleVideo(oldstate, newstate);
	}

	/**
	 * @param {VoiceState} state
	 */
	handleTeacherJoin(state) {
		this.client.lessonManager.shouldStartLesson(state.member, state.channel)
			.then(should => {
				if (should) {
					this.client.lessonManager.start(new Lesson(null, null, state.member, should.substring(should.indexOf('!') + 1, should.indexOf('@')), str.getChanName(state.channel), should.substring(should.indexOf('$') + 1, should.indexOf('%')), time.getCurrentPeriod(), Array.from(state.channel.members.values())));
				}
			});
	}

	/**
	 * @param {VoiceState} oldstate
	 * @param {VoiceState} newstate
	 */
	handleMute(oldstate, newstate) {
		if (oldstate.selfMute != newstate.selfMute) {
			const lesson = this.client.lessonManager.lessons.find(ls => ls.classid == str.getChanName(newstate.channel));
			if (!lesson) return;
			const participant = lesson.students.find(st => st.member.id == newstate.member.id) || lesson.teacher.member.id == newstate.member.id ? lesson.teacher : null;
			if (participant) this.client.lessonManager.togglemute(lesson, participant, newstate.selfMute);
		}
	}
	/**
	 * @param {VoiceState} oldstate
	 * @param {VoiceState} newstate
	 */
	handleDeafen(oldstate, newstate) {
		if (oldstate.selfDeaf != newstate.selfDeaf) {
			const lesson = this.client.lessonManager.lessons.find(ls => ls.classid == str.getChanName(newstate.channel));
			if (!lesson) return;
			const participant = lesson.students.find(st => st.member.id == newstate.member.id) || lesson.teacher.member.id == newstate.member.id ? lesson.teacher : null;
			if (participant) this.client.lessonManager.toggledeaf(lesson, participant, newstate.serverDeaf);
		}
	}
	/**
	 * @param {VoiceState} oldstate
	 * @param {VoiceState} newstate
	 */
	handleVideo(oldstate, newstate) {
		if (oldstate.selfVideo != newstate.selfVideo) {
			const lesson = this.client.lessonManager.lessons.find(ls => ls.classid == str.getChanName(newstate.channel));
			if (!lesson) return;
			const participant = lesson.students.find(st => st.member.id == newstate.member.id) || lesson.teacher.member.id == newstate.member.id ? lesson.teacher : null;
			if (participant) this.client.lessonManager.togglevideo(lesson, participant, newstate.selfVideo);
		}
	}
}

module.exports = VoiceStateManager;