const { GuildMember, Snowflake } = require('discord.js');
const { Command, CommandoClient, CommandoGuild, CommandoMessage } = require('discord.js-commando');

class SendWelcomeCommand extends Command {
	/**
	 *
	 * @param {CommandoClient} client
	 */
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

	/**
	 * Runs the SendWelcome command with the specified Message and arguments
	 * @param {CommandoMessage} message
	 * @param {any} args
	 */
	run(message, args) {
		const guild = message.guild;
		const member = guild.members.cache.find(mem => mem.id === args.memberid);
		if (member) {
			this.exec(member);
			message.reply(`Sent welcome to ${member.displayName}`);
		}
	}

	/**
	 * Executes the SendWelcome command with the specified member
	 * @param {GuildMember} member
	 */
	exec(member) {
		member.createDM().then(dm => {
			dm.send(`Ahoj! Vitaj vo FELIX Discorde!`);
			dm.send(`Prosím Ťa, napíš svoje meno, priezvisko a triedu jednému z našich administrátorov (Filip Antala, Mati Halák, Zuzka Burjanová) aby Ťa mohli zaradiť do tvojej triedy.`);
			dm.send(`Ak sa Ti ale nechce písať administrátorovi (alebo žiaden práve nie je online), môžeš napísať meno a triedu aj mne nasledovne (prosím, používaj diakritiku):`);
			dm.send(`iam TvojeMeno TvojePriezvisko TvojaTrieda`);
		});
		global.clientlogger.info(`Sent welcome message to: ${member.displayName}`);
	}
}

module.exports = SendWelcomeCommand;