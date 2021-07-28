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
}

module.exports = EduStudent;