const { Command } = require("../../types/command");
const { CmdMessageResponse } = require("../../util/interactions");
const config = require('../../config.json');

class AvatarCommand extends Command {
	constructor(client) {
		super(client, {
			id: `863136340614971402`,
			name: `avatar`,
			group: `dev`,
			memberName: `avatar`,
			description: `Gets the user's avatar`,
			examples: [`sendwelcome 702922217155067924`],
		});
	}


	run(interaction) {
		const args = interaction.data.options;
		const guild = this.client.guilds.cache.find(gld => gld.id === config.guild);
		const member = guild.members.cache.find(mem => mem.id === args[0].value);
		const ephemeral = (args[1] && args[1].value) || true;
		if (member) {
			return CmdMessageResponse(`${member.nickname || member.user.username}'s avatar URL is: ${member.user.avatarURL()}`, ephemeral);
		}
	}
}

module.exports = AvatarCommand;