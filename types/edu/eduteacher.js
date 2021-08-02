const { GuildMember } = require("discord.js");
const EduBase = require("./edubase");

class EduTeacher extends EduBase {
	constructor({ id, short, gender, bell, color, member }) {
		super({ id, color });
		/** @type {string} */
		this.short = short;
		/** @type {"F" | "M" | ""} */
		this.gender = gender;
		/** @type {string} */
		this.bell = bell;
		/** @type {GuildMember} */
		this.member = member ?? null;
	}

	get class() {
		return this.manager.classes.find(c => c.teacherid === this.id);
	}

	get subjects() {
		return this.manager.subjects.filter(s => s.lessons.find(l => l.teacherids.includes(this.id)));
	}

	get cards() {
		return this.manager.cards.filter(c => c.lesson.teacherids.includes(this.id));
	}
}

module.exports = EduTeacher;