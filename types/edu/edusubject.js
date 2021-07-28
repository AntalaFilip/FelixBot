const { Role } = require("discord.js");
const EduBase = require("./edubase");

class EduSubject extends EduBase {
	constructor({ id, name, short, color, timeoff, role }) {
		super({ id, color });
		/** @type {string} */
		this.name = name;
		/** @type {string} */
		this.short = short;
		/** @type {Role} */
		this.role = role ?? this.guild.roles.cache.find(r => r.name === this.short);
		/** @type {[][][]} */
		this.timeoff = timeoff;
	}
}

module.exports = EduSubject;