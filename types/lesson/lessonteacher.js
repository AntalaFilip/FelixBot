const { GuildMember } = require("discord.js");
const Lesson = require("./lesson");
const LessonParticipant = require("./lessonparticipant");

class LessonTeacher extends LessonParticipant {
	/**
	 * Creates the teacher object
	 * @param {GuildMember} member
	 */
	constructor(member) {
		super(member);
	}
}

module.exports = LessonTeacher;