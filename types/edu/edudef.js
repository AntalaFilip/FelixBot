const EduBase = require("./edubase");

class EduDef extends EduBase {
	constructor({ id, name, short, typ, vals, val }, mgr) {
		super({ id }, mgr);
		/** @type {string} */
		this.name = name;
		/** @type {string} */
		this.short = short;
		/** @type {"one" | "any" | "all"} */
		this.type = typ;
		/** @type {string[]} */
		this.vals = vals;
		/** @type {number} */
		this.val = val;
	}

	/**
	 * @param {string} val
	 */
	matches(val) {
		const indexes = val.split('').map((v, i) => v == 1 ? i : null).filter(o => o != null);
		const has = this.vals.find(v => indexes.map(i => v.charAt(i) == 1).includes(true));
		return typeof has === 'string';
	}
}

module.exports = EduDef;