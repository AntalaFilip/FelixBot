const EduBase = require("./edubase");

class EduGroup extends EduBase {
	constructor({ id, name, color, classid, entireclass, divisionid }) {
		super({ id, color });
		/** @type {string} */
		this.name = name;
		/** @type {string} */
		this.classid = classid;
		/** @type {boolean} */
		this.entireclass = entireclass;
		/** @type {string} */
		this.divisionid = divisionid;
	}

	get class() {
		return this.manager.classes.find(c => c.id === this.classid);
	}

	get division() {
		// TODO: divisions
		return null;
	}
}

module.exports = EduGroup;