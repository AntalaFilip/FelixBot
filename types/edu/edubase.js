const FelixBotClient = require("../../client");
const config = require('../../config.json');

class EduBase {
	/**
	 * @param {Object} props
	 * @param {string} [props.id] 5 digit string identificator or *id
	 * @param {string} [props.color] HEX color with #
	 */
	constructor({ id, color }) {
		/** @type {string} 5 digit string identificator or *id */
		this.id = id;
		/** @type {string} HEX color with # */
		this.color = color ?? '#FFFFFF';
	}

	/** @returns {FelixBotClient} */
	get client() {
		return global.client;
	}

	get manager() {
		return this.client.edupageManager;
	}

	get guild() {
		return this.client.guilds.resolve(config.guild);
	}

	static is(obj) {
		return obj instanceof this;
	}
}

module.exports = EduBase;