const EduBase = require("./edubase");

class EduDay extends EduBase {
	constructor({ id, name, short }) {
		super({ id });
		/** @type {string} */
		this.name = name;
		/** @type {string} */
		this.short = short;
	}
}

module.exports = EduDay;