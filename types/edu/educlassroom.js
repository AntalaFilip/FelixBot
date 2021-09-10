const EduBase = require("./edubase");

class EduClassroom extends EduBase {
	constructor({ id, name, short, needssupervision, sharedroom, color }, mgr) {
		super({ id, color }, mgr);
		/** @type {string} */
		this.name = name;
		/** @type {string} */
		this.short = short;
		/** @type {boolean} */
		this.needssupervision = needssupervision;
		/** @type {boolean} */
		this.sharedroom = sharedroom;
	}

	get class() {
		return this.manager.classes.find(c => c.classroomid === this.id);
	}
}

module.exports = EduClassroom;