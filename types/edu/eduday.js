const EduBase = require("./edubase");

class EduDay extends EduBase {
	constructor({ id, name, short }) {
		super({ id });
		/** @type {string} */
		this.name = name;
		/** @type {string} */
		this.short = short;
	}

	get def() {
		return this.manager.daydefs.find(dd => dd.day === this);
	}
}

module.exports = EduDay;