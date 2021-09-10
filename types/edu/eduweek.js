const EduBase = require("./edubase");

class EduWeek extends EduBase {
	constructor({ id, name, short }, mgr) {
		super({ id }, mgr);
		/** @type {string} */
		this.name = name;
		/** @type {string} */
		this.short = short;
	}

	get def() {
		return this.manager.weekdefs.find(wd => wd.week === this);
	}
}

module.exports = EduWeek;