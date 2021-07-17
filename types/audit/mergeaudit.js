const { Collection } = require("discord.js");
const { GuildMember, VoiceChannel } = require("discord.js");
const Audit = require("./audit");

class MergeAudit extends Audit {
	/**
	 * Creates a MergeAudit class
	 * @param {GuildMember} initiator The member that initiated this audit
	 * @param {VoiceChannel} to The channel to which the members were moved
	 * @param {VoiceChannel[]} from The channels from which the members were moved
	 * @param {Collection<string, GuildMember[]>} list The list of channel ids and members that were moved
	 * @param {Date?} timestamp The timestamp this action ocurred
	 * @param {number?} id The ID of the audit event
	 */
	constructor(initiator, to, from, list, timestamp = new Date(), id = null) {
		super(initiator, null, timestamp, id);
		this.action = 'merge';
		this.data = {
			to: to,
			from: from,
			list: list,
		};
	}
}

module.exports = MergeAudit;