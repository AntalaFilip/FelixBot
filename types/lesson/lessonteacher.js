const { GuildMember } = require("discord.js");
const Lesson = require("./lesson");

class LessonTeacher {
	/**
	 * Creates the teacher object
	 * @param {GuildMember} member
	 * @param {Lesson} lesson
	 */
	constructor(member, lesson) {
		this.member = member;
		this.lesson = lesson;
		this.name = member.displayName;
		this.isPresent = true;
	}

	/**
	 * Changes the presence of the teacher
	 * @param {boolean} presence
	 */
	changePresence(presence) {
		this.isPresent = presence;
	}
}

module.exports = LessonTeacher;