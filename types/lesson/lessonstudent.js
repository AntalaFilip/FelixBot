const { GuildMember } = require("discord.js");
// eslint-disable-next-line no-unused-vars
const Lesson = require("./lesson");


class LessonStudent {
	/**
	 * Creates a LessonStudent object and automatically attaches it to the specified lesson
	 * @param {GuildMember} member The student to create a LessonStudent object from
	 * @param {Lesson} lesson The lesson the student belongs to
	 * @param {boolean} noattach Whether to disable autoattach
	 */
	constructor(member, lesson, noattach) {
		this.lesson = lesson;
		this.present = true;
		if (member instanceof GuildMember) {
			this.member = member;
			this.name = member.displayName;
			this.created = new Date();
			this.joined(true);
		}
		else {
			this.member = member.student;
			this.name = member.student.displayName;
			this.created = member.created;
			this.joins = member.joins;
			this.leaves = member.leaves;
		}
		if (!noattach) lesson.addStudent(this);
	}

	joined(donotupdate) {
		this.joins.push(new Date());
		this.present = true;
		if (!donotupdate) this.lesson.update();
	}

	left(donotupdate) {
		this.leaves.push(new Date());
		this.present = false;
		if (!donotupdate) this.lesson.update();
	}
}

module.exports = LessonStudent;