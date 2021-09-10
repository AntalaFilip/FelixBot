const { GuildMember } = require("discord.js");
const EduTeacher = require("../edu/eduteacher");
const Lesson = require("./lesson");
const LessonParticipant = require("./lessonparticipant");

class LessonTeacher extends LessonParticipant {
	/**
	 * Creates the teacher object
	 * @param {Lesson} lesson
	 * @param {GuildMember} member
	 * @param {import("./lessonparticipant").LessonParticipantObject} pobj
	 * @param {EduTeacher} eduteacher
	 */
	constructor(lesson, member, pobj, eduteacher) {
		super(lesson, member, pobj);

		this.edu = eduteacher;
	}
}

module.exports = LessonTeacher;