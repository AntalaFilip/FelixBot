const config = require('../config.json');

class Parsers {
	static parseTeacher(data) {
		const guild = global.client.guilds.resolve(config.guild);

		const map = data.map(t => {
			const member = guild.members.resolve(t.dsid);
			const EDU = global.client.edupageManager;
			const eusr = EDU.users.find(u => u.id == t.eduid);

			const obj = {
				member,
				eduUser: eusr,
				autolessons: Boolean(t.autolessons),
			};
			return obj;
		});
		return map;
	}
}

module.exports = Parsers;