const { GuildMember } = require("discord.js");
const Logger = require("../util/logger");

class PermissionsManager {
	constructor(client) {
		this.client = client;
		this.logger = new Logger("PermissionsManager");
		this.logger.log('Ready!');
	}

	/**
	 * Checks if the specified member is a teacher
	 * @param {GuildMember} member
	 * @returns {boolean}
	 */
	isTeacher(member) {
		if (member.roles.cache.find(role => role.name === `Učiteľ`)) return true;
		return false;
	}

	/**
	 * @param {GuildMember} member
	 */
	getTeacherSubjects(member) {
		if (!this.isTeacher(member)) return null;
		return Array.from(member.roles.cache.filter(role => role.hexColor == `#ff0000`).values());
	}

	/**
	 * @param {GuildMember} member
	 */
	isClassTeacher(member) {
		return new Promise((resolve, reject) => {
			if (!this.isTeacher(member)) resolve(null);
			this.client.databaseManager.getSettings()
				.then(settings => {
					const classes = settings.classes;
					const role = member.roles.cache.find(rl => classes.includes(rl.name.toLowerCase()));
					if (role) resolve({ name: role.name.toLowerCase(), role: role });
					else resolve(false);
				}, err => reject(err));
		});
	}

	/**
	 * Checks if the specified member is a student
	 * @param {GuildMember} member
	 * @returns {boolean}
	 */
	isStudent(member) {
		if (member.roles.cache.find(role => this.client.databaseManager.getSettings(member.guild).classes.includes(role.name))) return true;
		return false;
	}
}

module.exports = PermissionsManager;