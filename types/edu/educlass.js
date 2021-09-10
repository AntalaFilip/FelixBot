const { Role } = require("discord.js");
const EduBase = require("./edubase");

class EduClass extends EduBase {
	constructor({ id, name, short, color, classroomid, role, teacherid, timeoff, bell }, mgr) {
		super({ id, color }, mgr);
		/** @type {string} */
		this.name = name;
		/** @type {string} */
		this.short = short;
		/** @type {string} */
		this.classroomid = classroomid;
		/** @type {Role} */
		this.role = role ?? this.guild.roles.cache.find(r => r.name === this.short);
		/** @type {string} */
		this.bell = bell;
		/** @type {string} */
		this.teacherid = teacherid;
		/** @type {[][][]} */
		this.timeoff = timeoff;
	}

	get classroom() {
		return this.manager.classrooms.find(c => c.id === this.classroomid);
	}

	get teacher() {
		return this.manager.teachers.find(t => t.id === this.teacherid);
	}

	get students() {
		return this.manager.students.filter(s => s.classid === this.id);
	}

	get cards() {
		return this.manager.cards.filter(c => c.lesson.classids.includes(this.id));
	}

	get lessons() {
		return this.manager.lessons.filter(l => l.classids.includes(this.id));
	}

	get groups() {
		return this.manager.groups.filter(g => g.classid === this.id);
	}
}

module.exports = EduClass;