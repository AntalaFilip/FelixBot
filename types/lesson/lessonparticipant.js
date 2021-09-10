const { GuildMember } = require("discord.js");
const { removeStartingDot } = require("../../util/stringutils");

/**
 * @typedef {"JOIN" | "LEAVE" | "MUTE" | "UNMUTE" | "DEAF" | "UNDEAF" | "VIDEO_ON" | "VIDEO_OFF"} LessonParticipantDataType
 */

/**
 * @typedef LessonParticipantObject
 * @property {GuildMember} member
 * @property {string} name
 * @property {{date: Date, type: LessonParticipantDataType}[]} data
 */

class LessonParticipant {
	/**
	 * Creates a LessonParticipant object
	 * @param {import("./lesson") | number} lesson
	 * @param {GuildMember} member
	 * @param {LessonParticipantObject} pobj
	 */
	constructor(lesson, member, pobj) {
		/** @type {{date: Date, type: LessonParticipantDataType}[]} */
		this.voice = [];

		/** @type {number} */
		this.lsid = lesson.id ?? lesson;

		this.present = true;
		/** @type {GuildMember} */
		this.member;
		/** @type {string} */
		this.name;
		/** @type {Date} */
		this.created;

		if (member) {
			this.member = member;
			this.name = removeStartingDot(member.displayName);
			this.created = new Date();
		}
		else {
			this.member = pobj.member;
			this.name = removeStartingDot(pobj.member ? pobj.member.displayName : pobj.name);
			this.created = pobj.created;
			this.voice = pobj.data;
		}
	}

	/** @returns {import("../../client")} */
	get client() {
		return global.client;
	}

	get manager() {
		return this.client.lessonManager;
	}

	get lesson() {
		return this.manager.lessons.get(this.lsid);
	}

	get frozen() {
		return this.lesson.frozen;
	}
}

module.exports = LessonParticipant;