const { GuildMember } = require("discord.js");
const EduStudent = require("../edu/edustudent");
const Lesson = require("./lesson");
const LessonParticipant = require("./lessonparticipant");


class LessonStudent extends LessonParticipant {
	/**
	 * Creates a LessonStudent object and automatically attaches it to the specified lesson
	 * @param {Lesson} lesson
	 * @param {GuildMember} member The student to create a LessonStudent object from
	 * @param {import("./lessonparticipant").LessonParticipantObject} pobj
	 * @param {EduStudent} edustudent
	 */
	constructor(lesson, member, pobj, edustudent) {
		super(lesson, member, pobj);

		this.edu = edustudent;
		// TODO add check if student matches lesson
	}
}

module.exports = LessonStudent;