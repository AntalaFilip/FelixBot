const { Command } = require("../../types/command");
const { CommandInteraction } = require("discord.js");

class AvatarCommand extends Command {
	constructor(client) {
		super(client, {
			id: `863136340614971402`,
			name: `avatar`,
			group: `misc`,
			memberName: `avatar`,
			description: `Gets the user's avatar`,
		});
	}

	/**
	 *
	 * @param {CommandInteraction} interaction
	 * @returns
	 */
	async run(interaction) {
		const args = interaction.options;
		const guild = interaction.guild;
		const member = args.getMember('user');
		const silent = args.getBoolean('silent', false) ?? true;
		if (member) {
			return interaction.reply({ content: `${member.displayName}'s avatar URL is: ${member.user.avatarURL()}`, ephemeral: silent });
		}
		else {
			return interaction.reply({ ephemeral: true, content: 'Failed to get member' });
		}
	}
}

module.exports = AvatarCommand;