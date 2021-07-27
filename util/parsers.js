const { Guild } = require('discord.js');
const config = require('../config.json');

/**
 * @typedef {'VERIFIED' | 'APPROVAL_NEEDED' | 'PENDING' | 'NONE'} VerificationLevel
 */

class Parsers {
	/**
	 *
	 * @param {Array} data
	 * @returns
	 */
	static parseTeacher(data) {
		/** @type {Guild} */
		const guild = global.client.guilds.resolve(config.guild);
		const EDU = global.client.edupageManager;

		const map = data.map(t => {
			const member = guild.members.resolve(t.dsid);
			const eusr = EDU.teachers.find(u => u.id == t.eduid);

			const obj = {
				member,
				eduUser: eusr,
				autolessons: Boolean(t.autolessons),
			};
			return obj;
		});
		return map;
	}

	/**
	 *
	 * @param {Array} data
	 * @returns
	 */
	static parseMember(data) {
		/** @type {Guild} */
		const guild = global.client.guilds.resolve(config.guild);
		const EDU = global.client.edupageManager;

		const map = data.map(m => {
			const member = guild.members.resolve(m.dsid);
			const student = member.roles.cache.find(r => config.classRoles.find(rr => r.id == rr.value));
			const eusr = student ? EDU.students.find(s => s.id == m.eduid) : null;

			const obj = {
				member,
				eduUser: eusr,
				/** @type {VerificationLevel} */
				verification: m.verification,
			};
			return obj;
		});

		return map;
	}
}

module.exports = Parsers;