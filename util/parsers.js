const { Guild } = require('discord.js');
const FelixBotClient = require('../client');
const config = require('../config.json');

/**
 * @typedef {'VERIFIED' | 'VERIFY_EMAIL' | 'VERIFY_TEACHER' | 'PENDING' | 'NONE'} VerificationLevel
 */

class Parsers {
	/**
	 *
	 * @param {Array} data
	 * @returns
	 */
	static parseTeacher(data) {
		/** @type {FelixBotClient} */
		const client = global.client;
		const guild = client.guilds.resolve(config.guild);

		const map = data.map(t => {
			const EDU = client.edupageManager[t.manager];
			const member = guild.members.resolve(t.dsid);
			const eusr = EDU.teachers.find(u => u.id == String(t.eduid));

			const obj = {
				member,
				eduUser: eusr,
				name: t.name,
				manager: t.manager,
				autolessons: Boolean(t.autolessons),
				/** @type {VerificationLevel} */
				verification: t.verification,
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
		/** @type {FelixBotClient} */
		const client = global.client;
		const guild = client.guilds.resolve(config.guild);

		const map = data.map(m => {
			const EDU = client.edupageManager[m.manager];
			const id = m.dsid;
			const member = guild.members.resolve(id);
			if (!member) global.client.logger.error("Member from DB can't be parsed in Discord!", m.dsid);
			const student = member.roles.cache.find(r => config.classRoles.find(rr => r.id == rr.value));
			const eusr = (student && m.eduid) ? EDU.students.find(s => s.id == String(m.eduid)) : null;
			const role = guild.roles.resolve(m.role);

			const obj = {
				member,
				role,
				name: m.name,
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