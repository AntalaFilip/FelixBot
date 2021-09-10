const { Role } = require("discord.js");
const EduBase = require("./edubase");
const { subjectExceptions: exc } = require('../../config.json');

class EduSubject extends EduBase {
	constructor({ id, name, short, color, timeoff, role }, mgr) {
		super({ id, color }, mgr);
		/** @type {string} */
		this.name = name;
		/** @type {string} */
		this.short = short;
		/** @type {Role} */
		this.role = role ?? (this.guild.roles.cache.find(r => r.name === this.short) || this.guild.roles.resolve(exc[this.short]));
		/** @type {[][][]} */
		this.timeoff = timeoff;
	}

	get lessons() {
		return this.manager.lessons.filter(l => l.subjectid === this.id);
	}

	get teachers() {
		return this.manager.teachers.filter(t => this.lessons.find(l => l.teacherids.includes(t.id)));
	}
}

module.exports = EduSubject;