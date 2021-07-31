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
		const EDU = client.edupageManager;

		const map = data.map(t => {
			const member = guild.members.resolve(t.dsid);
			const eusr = EDU.teachers.find(u => u.id == String(t.eduid));

			const obj = {
				member,
				eduUser: eusr,
				name: t.name,
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
		const EDU = client.edupageManager;

		const map = data.map(m => {
			const id = m.dsid;
			const member = guild.members.resolve(id);
			const student = member.roles.cache.find(r => config.classRoles.find(rr => r.id == rr.value));
<<<<<<< Updated upstream
			const eusr = student ? EDU.students.find(s => s.id == String(m.eduid)) : null;
=======
			const eusr = (student && m.eduid) ? EDU.students.find(s => s.id == String(m.eduid)) : null;
			const role = guild.roles.resolve(m.role);
>>>>>>> Stashed changes

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