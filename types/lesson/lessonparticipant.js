const { GuildMember } = require("discord.js");

class LessonParticipant {
	/**
	 * Creates a LessonParticipant object
	 * @param {GuildMember | Object} member The member or object to create a LessonParticipant object from
	 */
	constructor(member) {
		this.present = true;
		this.voice = {
			connects: new Array(),
			disconnects: new Array(),
			mutes: new Array(),
			deafs: new Array(),
			video: new Array(),
		};

		if (member instanceof GuildMember) {
			this.member = member;
			this.name = member.displayName;
			this.created = new Date();
			this.voice.connects.push(new Date());
		}
		else {
			this.member = member.participant;
			this.name = member.participant.displayName;
			this.created = member.created;
			this.voice = member.voice;
		}
	}
}

module.exports = LessonParticipant;