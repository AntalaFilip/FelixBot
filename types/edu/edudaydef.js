const EduBase = require("./edubase");
const EduDay = require("./eduday");
const EduDef = require("./edudef");

class EduDayDef extends EduDef {
	constructor(...params) {
		super(...params);
	}

	/**
	 * @returns {EduDay}
	 */
	get day() {
		return this.type === 'one' ? this.manager.days.find(d => d.id === String(this.val)) : null;
	}
}

module.exports = EduDayDef;