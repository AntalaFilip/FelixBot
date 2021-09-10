const EduDef = require("./edudef");
const EduWeek = require("./eduweek");

class EduWeekDef extends EduDef {
	constructor(...params) {
		super(...params);
	}

	/**
	 * @returns {EduWeek}
	 */
	get week() {
		return this.type === 'one' ? this.manager.weeks.find(w => w.id === String(this.val)) : null;
	}
}

module.exports = EduWeekDef;