const config = require('../../config.json');

class EduBase {
	/**
	 * @param {Object} props
	 * @param {string} [props.id] 5 digit string identificator or *id
	 * @param {string} [props.color] HEX color with #
	 * @param {import('../../managers/edupagemanager')} mgr
	 */
	constructor({ id, color }, mgr) {
		/** @type {string} 5 digit string identificator or *id */
		this.id = id;
		this.manager_id = (mgr && mgr.id) || 0;
		/** @type {string} HEX color with # */
		this.color = color ?? '#FFFFFF';
	}

	/** @returns {import("../../client")} */
	get client() {
		return global.client;
	}

	get manager() {
		return this.client.edupageManager[this.manager_id];
	}

	get guild() {
		return this.client.guilds.resolve(config.guild);
	}

	static is(obj) {
		return obj instanceof this;
	}
}

module.exports = EduBase;