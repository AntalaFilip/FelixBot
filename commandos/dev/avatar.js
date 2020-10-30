const commando = require(`discord.js-commando`);

module.exports = class AvatarCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: `avatar`,
			group: `dev`,
			memberName: `avatar`,
			description: `Gets the user's avatar`,
			examples: [ `sendwelcome 702922217155067924` ],
			ownerOnly: true,
			args: [
				{
					key: `memberid`,
					prompt: `ID of the member:`,
					type: `string`,
				},
			],
		});
	}

	run(message, args) {
		const guild = this.client.guilds.cache.find(gld => gld.id === `702836521622962198`);
		const member = guild.members.cache.find(mem => mem.id === args.memberid);
		if (member) {
			message.reply(`${member.nickname || member.user.username}'s avatar URL is: ${member.user.avatarURL()}`);
		}
	}
};