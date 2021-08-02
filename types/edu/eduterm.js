const EduBase = require("./edubase");

class EduTerm extends EduBase {
	constructor({ id, name, short }) {
		super({ id });
		/** @type {string} */
		this.name = name;
		/** @type {string} */
		this.short = short;
	}

	get def() {
		return this.manager.termsdef.find(td => td.term === this);
	}
}

module.exports = EduTerm;