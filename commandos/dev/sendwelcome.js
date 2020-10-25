const commando = require(`discord.js-commando`);

module.exports = class OngoingLessonsCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: `sendwelcome`,
			group: `dev`,
			memberName: `sendwelcome`,
			description: `Sends a welcome message to the specified member`,
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
			this.client.sendWelcomeMessage(member);
			message.reply(`Sent welcome to ${member.user.username}`);
		}
	}
};