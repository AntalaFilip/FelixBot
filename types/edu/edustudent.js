const EduBase = require("./edubase");

class EduStudent extends EduBase {
	constructor({ id, short, classid, groupids }) {
		super({ id });
		/** @type {string} */
		this.short = short;
		/** @type {string} */
		this.classid = classid;
		/** @type {string[]} */
		this.groupids = groupids ?? [];
	}

	get class() {
		return this.manager.classes.find(c => c.id === this.classid);
	}

	get groups() {
		return this.manager.groups.filter(g => this.groupids.includes(g.id));
	}

	get lessons() {
		return this.manager.lessons.filter(l => l.studentids.includes(this.id));
	}

	get cards() {
		return this.manager.cards.filter(c => c.lesson.studentids.includes(this.id));
	}
}

module.exports = EduStudent;