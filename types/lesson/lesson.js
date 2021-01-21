const { GuildMember, VoiceChannel } = require("discord.js");
const { CommandoClient } = require("discord.js-commando");
const { all } = require("../../api/express");
const LessonManager = require("../../managers/lessonmanager");
const LessonStudent = require("./lessonstudent");
const LessonTeacher = require("./lessonteacher");


class Lesson {
	/**
	 * Creates a lesson object
	 * @param {number} id The ID of the Lesson, generated automatically if creating a new Lesson, if present, Lesson won't get pushed to database automatically.
	 * @param {Array} allocated The allocated channels for this lesson
	 * @param {GuildMember} teacher The lesson teacher
	 * @param {String} lessonid The lesson ID
	 * @param {String} classid The class ID having the lesson
	 * @param {String} group The class group
	 * @param {number} period The period the lesson relates to
	 * @param {GuildMember[]} students The students present at the creation of the Lesson
	 * @param {Date} startedAt The date when the lesson started
	 * @param {Date} endedAt The date when the lesson ended (if creating an ended lesson)
	 */
	constructor(id, allocated, teacher, lessonid, classid, group, period, students, startedAt, endedAt) {
		this.id = id;
		this.allocated = new Array();
		// Create a LessonTeacher from the teacher member
		this.teacher = new LessonTeacher(teacher);
		if (allocated) allocated.forEach(val => this.allocated.push(this.teacher.member.guild.channels.cache.find(chan => chan.id = val)));
		// Assign the lesson ID
		this.lessonid = lessonid.toLowerCase();
		// Assign the class ID
		this.classid = classid.toLowerCase();
		// Assign the group ID
		this.group = group.toLowerCase();
		// Assign the period
		this.period = period;
		// Assign started at
		if (startedAt) this.startedAt = new Date(startedAt);
		else this.startedAt = new Date();
		if (endedAt) this.endedAt = new Date(endedAt);
		else this.endedAt = null;

		this.students = new Array();
		// For each member/studentdata if its ID doesn't match the teach, create a new LessonStudent and push it to the studentlist.
		if (students) {
			students.forEach(student => {
				if (student instanceof GuildMember) {
					if (student.id == this.teacher.member.id) return;
				}
				this.students.push(new LessonStudent(student));
			}, this);
		}
	}

	/**
	 * Adds the given student to the lesson
	 * @param {LessonStudent} student The student to add to the Lesson
	 */
	addStudent(student) {
		if (this.students.includes(student)) return student;
		this.students.push(student);
		this.update();
		return student;
	}
}

module.exports = Lesson;