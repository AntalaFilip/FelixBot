const { GuildMember } = require("discord.js");
const { removeStartingDot } = require("../../util/stringutils");

class LessonParticipant {
	/**
	 * Creates a LessonParticipant object
	 * @param {GuildMember | {member: GuildMember, created: Date, voice: {connects: Array<Date>, disconnects: Array<Date>, mutes: Array, deafs: Array, video: Array, total: number | null}}} participant The member or object to create a LessonParticipant object from
	 */
	constructor(participant) {

		/**
		 * @type {{connects: Date[], disconnects: Date[], mutes: Array, deafs: Array, video: Array, total: number | null}}
		 */
		this.voice = {
			connects: [],
			disconnects: [],
			mutes: [],
			deafs: [],
			video: [],
			total: null,
		};

		this.present = true;
		/**
		 * @type {GuildMember}
		 */
		this.member;

		if (participant instanceof GuildMember) {
			this.member = participant;
			this.name = removeStartingDot(participant.displayName);
			this.created = new Date();
		}
		else {
			this.member = participant.member;
			this.name = removeStartingDot(participant.member.displayName);
			this.created = participant.created;
			this.voice = participant.voice;
		}
	}
}

module.exports = LessonParticipant;