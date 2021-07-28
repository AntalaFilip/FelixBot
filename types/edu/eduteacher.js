const { GuildMember } = require("discord.js");
const EduBase = require("./edubase");

class EduTeacher extends EduBase {
	constructor({ id, short, gender, bell, color, member }) {
		super({ id, color });
		/** @type {string} */
		this.short = short;
		/** @type {"F" | "M" | ""} */
		this.gender = gender;
		/** @type {string} */
		this.bell = bell;
		/** @type {GuildMember} */
		this.member = member ?? null;
	}
}

module.exports = EduTeacher;