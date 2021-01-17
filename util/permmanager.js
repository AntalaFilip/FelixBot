class PermissionsManager {
	constructor(client) {
		this.client = client;
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
	 * Checks if the specified member is a student
	 * @param {GuildMember} member
	 * @returns {boolean}
	 */
	isStudent(member) {
		if (member.roles.cache.find(role => this.client.databaseManager.getSettings(member.guild).pop().classes.includes(role.name))) return true;
		return false;
	}
}

module.exports = PermissionsManager;