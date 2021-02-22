const { GuildMember } = require("discord.js");

class Audit {
	/**
	 *
	 * @param {GuildMember} initiator
	 * @param {*?} data
	 * @param {Date?} timestamp
	 * @param {number?} id
	 */
	constructor(initiator, data = null, timestamp = new Date(), id = null) {
		this.action = 'general';
		this.id = id;
		this.data = data;
		this.initiator = initiator;
		this.timestamp = timestamp;
	}
}

module.exports = Audit;