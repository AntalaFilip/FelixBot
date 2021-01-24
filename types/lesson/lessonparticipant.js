const { GuildMember } = require("discord.js");

class LessonParticipant {
	/**
	 * Creates a LessonParticipant object
	 * @param {GuildMember | Object} participant The member or object to create a LessonParticipant object from
	 */
	constructor(participant) {
		this.present = true;
		this.voice = {
			connects: new Array(),
			disconnects: new Array(),
			mutes: new Array(),
			deafs: new Array(),
			video: new Array(),
		};

		if (participant instanceof GuildMember) {
			this.member = participant;
			this.name = participant.displayName;
			this.created = new Date();
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