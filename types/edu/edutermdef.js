const EduDef = require("./edudef");
const EduTerm = require("./eduterm");

class EduTermDef extends EduDef {
	constructor(params) {
		super(params);
	}

	/**
	 * @returns {EduTerm}
	 */
	get term() {
		return this.type === 'one' ? this.manager.terms.find(t => t.id === String(this.val)) : null;
	}
}

module.exports = EduTermDef;