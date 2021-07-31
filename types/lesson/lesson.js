const { GuildMember, VoiceChannel } = require("discord.js");
const LessonStudent = require("./lessonstudent");
const LessonTeacher = require("./lessonteacher");
const EventEmitter = require('events');

class Lesson extends EventEmitter {
	/**
	 * Creates a lesson object
	 * @param {number} id The ID of the Lesson, generated automatically if creating a new Lesson. If present, Lesson won't get pushed to database automatically.
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
		super();
		this.id = id;
		/**
		 * @type {VoiceChannel[]}
		 */
		this.allocated = new Array();
		// Create a LessonTeacher from the teacher member
		this.teacher = new LessonTeacher(teacher);
		if (!this.teacher.member.voice.channel || !this.teacher.member.voice.channel.name.includes(classid)) this.teacher.present = false;
		if (allocated) allocated.forEach(val => this.allocated.push(this.teacher.member.guild.channels.cache.find(chan => chan.id == val)));
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

		/**
		 * @type {LessonStudent[]}
		 */
		this.students = new Array();
		// For each member/studentdata if its ID doesn't match the teacher, create a new LessonStudent and push it to the studentlist.
		if (students) {
			students.forEach(student => {
				if (student instanceof GuildMember) {
					if (student.id == this.teacher.member.id) return;
				}
				const st = new LessonStudent(student);
				st.voice.connects.push(new Date());
				this.students.push(st);
			}, this);
		}
	}

	static is(lesson) {
		return lesson instanceof Lesson;
	}
}

module.exports = Lesson;