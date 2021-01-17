const { GuildMember } = require("discord.js");
// eslint-disable-next-line no-unused-vars
const { CommandoClient } = require("discord.js-commando");
const LessonManager = require("../../util/lessonmanager");
// eslint-disable-next-line no-unused-vars
const LessonStudent = require("./lessonstudent");
const LessonTeacher = require("./lessonteacher");


class Lesson {
	/**
	 * Creates a lesson object
	 * @param {number} id The ID of the Lesson, generated automatically if creating a new Lesson, if present, Lesson won't get pushed to database automatically.
	 * @param {CommandoClient} client The client that instantiated this
	 * @param {LessonManager} manager The manager that manages this
	 * @param {GuildMember} teacher The lesson teacher
	 * @param {String} lessonid The lesson ID
	 * @param {String} classid The class ID having the lesson
	 * @param {String} group The class group
	 * @param {Number} period The period the lesson relates to
	 * @param {GuildMember[] || } students The students present at the creation of the Lesson
	 * @param {Date} startedAt The date when the lesson started
	 * @param {Date} endedAt The date when the lesson ended (if creating an ended lesson)
	 * @param {boolean} nocache Whether the Lesson should not get cached locally
	 */
	constructor(client, id, manager, teacher, lessonid, classid, group, period, students, startedAt, endedat, nocache) {
		this.id = id;
		this.client = client;
		this.manager = manager;
		// Create a LessonTeacher from the teacher member
		this.teacher = new LessonTeacher(teacher, this);
		// Assign the lesson ID
		this.lessonid = lessonid.toLowerCase();
		// Assign the class ID
		this.classid = classid.toLowerCase();
		// Assign the group ID
		this.group = group.toLowerCase();
		// Assign the period
		this.period = period;
		// Assign started at
		if (startedAt) this.startedAt = startedAt;
		else this.startedAt = new Date();
		this.endedAt = endedat;

		this.students = new Array();
		// For each member/studentdata if its ID doesn't match the teach, create a new LessonStudent and push it to the studentlist.
		if (students) {
			students.forEach(student => {
				if (student instanceof GuildMember) {
					if (student.id == this.teacher.member.id) return;
				}
				this.students.push(new LessonStudent(student, this, true));
			}, this);
		}

		if (!id) this.id = this.client.databaseManager.pushNewLesson(this);
		if (!nocache) this.client.lessonManager.lessons.push(this);
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

	update() {
		return this.client.databaseManager.updateLesson(this);
	}

	end() {
		this.endedAt = new Date();
		this.students.forEach(student => {
			if (student.present) student.left();
		});
		this.manager.lessons.splice(this.manager.lessons.findIndex(this), 1);
	}
}

module.exports = Lesson;