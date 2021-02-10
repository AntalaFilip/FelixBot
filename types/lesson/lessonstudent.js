const { GuildMember } = require("discord.js");
const Lesson = require("./lesson");
const LessonParticipant = require("./lessonparticipant");


class LessonStudent extends LessonParticipant {
	/**
	 * Creates a LessonStudent object and automatically attaches it to the specified lesson
	 * @param {GuildMember | Object} member The student to create a LessonStudent object from
	 */
	constructor(member) {
		super(member);
	}
}

module.exports = LessonStudent;