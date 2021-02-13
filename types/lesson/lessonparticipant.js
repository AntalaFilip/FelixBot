const { GuildMember } = require("discord.js");

class LessonParticipant {
	/**
	 * Creates a LessonParticipant object
	 * @param {GuildMember | {member: GuildMember, created: Date, voice: {connects: Array<Date>, disconnects: Array<Date>, mutes: Array, deafs: Array, video: Array}}} participant The member or object to create a LessonParticipant object from
	 */
	constructor(participant) {
		this.present = true;

		/**
		 * @type {{connects: Array<Date>, disconnects: Array<Date>, mutes: Array, deafs: Array, video: Array}}
		 */
		this.voice = {
			connects: new Array(),
			disconnects: new Array(),
			mutes: new Array(),
			deafs: new Array(),
			video: new Array(),
		};

		/**
		 * @type {GuildMember}
		 */
		this.member;

		if (participant instanceof GuildMember) {
			this.member = participant;
			this.name = participant.displayName;
			this.created = new Date();
			this.voice.connects.push(new Date());
		}
		else {
			this.member = participant.member;
			this.name = participant.member.displayName;
			this.created = participant.created;
			this.voice = participant.voice;
		}
	}
}

module.exports = LessonParticipant;